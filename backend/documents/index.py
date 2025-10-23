'''
Business: CRUD operations for notary documents with role-based access control
Args: event - dict with httpMethod, body, queryStringParameters, headers (X-Auth-Token)
      context - object with attributes: request_id, function_name
Returns: HTTP response with documents list or single document data
'''

import json
import os
import hashlib
import hmac
import psycopg2
import psycopg2.extras
from typing import Dict, Any, Optional, List
from datetime import datetime

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        secret = os.environ.get('JWT_SECRET', 'default-secret-key')
        parts = token.split(':')
        if len(parts) != 5:
            return None
        
        user_id, email, role, expiry, signature = parts
        payload = f"{user_id}:{email}:{role}:{expiry}"
        expected_signature = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
        
        if not hmac.compare_digest(signature, expected_signature):
            return None
        
        if datetime.fromisoformat(expiry) < datetime.utcnow():
            return None
        
        return {
            'user_id': int(user_id),
            'email': email,
            'role': role
        }
    except:
        return None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Database connection not configured'})
        }
    
    conn = None
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            search_query = params.get('search', '').strip()
            doc_type = params.get('type', '').strip()
            status_filter = params.get('status', '').strip()
            
            query = """
                SELECT d.id, d.document_number, d.document_type, d.document_date, 
                       d.registration_date, d.status, d.party1_name, d.party1_passport,
                       d.party2_name, d.party2_passport, d.subject, d.notes,
                       u.full_name as created_by_name
                FROM t_p91929212_notary_registry_syst.documents d
                LEFT JOIN t_p91929212_notary_registry_syst.users u ON d.created_by = u.id
                WHERE 1=1
            """
            
            if search_query:
                query += f" AND (d.document_number ILIKE '%{search_query}%' OR d.party1_name ILIKE '%{search_query}%' OR d.party2_name ILIKE '%{search_query}%')"
            
            if doc_type and doc_type != 'all':
                query += f" AND d.document_type = '{doc_type}'"
            
            if status_filter and status_filter != 'all-status':
                status_map = {
                    'registered': 'Зарегистрирован',
                    'processing': 'В обработке'
                }
                mapped_status = status_map.get(status_filter, status_filter)
                query += f" AND d.status = '{mapped_status}'"
            
            query += " ORDER BY d.registration_date DESC"
            
            cur.execute(query)
            rows = cur.fetchall()
            
            documents = []
            for row in rows:
                documents.append({
                    'id': row[0],
                    'number': row[1],
                    'type': row[2],
                    'date': row[3].isoformat() if row[3] else None,
                    'registration_date': row[4].isoformat() if row[4] else None,
                    'status': row[5],
                    'party1_name': row[6],
                    'party1_passport': row[7],
                    'party2_name': row[8],
                    'party2_passport': row[9],
                    'subject': row[10],
                    'notes': row[11],
                    'created_by_name': row[12]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'documents': documents})
            }
        
        elif method == 'POST':
            auth_header = event.get('headers', {}).get('X-Auth-Token', '')
            if not auth_header:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Authentication required'})
                }
            
            user_data = verify_token(auth_header)
            if not user_data:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Invalid or expired token'})
                }
            
            if user_data['role'] not in ['notary', 'admin']:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Only notaries can register documents'})
                }
            
            body_data = json.loads(event.get('body', '{}'))
            
            required_fields = ['document_type', 'document_date', 'party1_name', 'party1_passport', 'subject']
            for field in required_fields:
                if not body_data.get(field):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': f'Missing required field: {field}'})
                    }
            
            cur.execute("SELECT COUNT(*) FROM t_p91929212_notary_registry_syst.documents")
            count = cur.fetchone()[0]
            doc_number = f"{count + 1}N-{datetime.now().strftime('%m%d')}/{datetime.now().year}"
            
            cur.execute("""
                INSERT INTO t_p91929212_notary_registry_syst.documents 
                (document_number, document_type, document_date, status, party1_name, party1_passport,
                 party2_name, party2_passport, subject, notes, created_by)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, document_number, registration_date
            """, (
                doc_number,
                body_data['document_type'],
                body_data['document_date'],
                'Зарегистрирован',
                body_data['party1_name'],
                body_data['party1_passport'],
                body_data.get('party2_name'),
                body_data.get('party2_passport'),
                body_data['subject'],
                body_data.get('notes'),
                user_data['user_id']
            ))
            
            doc_id, doc_number, reg_date = cur.fetchone()
            
            cur.execute(
                "INSERT INTO t_p91929212_notary_registry_syst.activity_log (user_id, action_type, action_description, document_id) VALUES (%s, %s, %s, %s)",
                (user_data['user_id'], 'register', f'Registered document {doc_number}', doc_id)
            )
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'document': {
                        'id': doc_id,
                        'number': doc_number,
                        'registration_date': reg_date.isoformat()
                    }
                })
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': f'Server error: {str(e)}'})
        }
    finally:
        if conn:
            conn.close()