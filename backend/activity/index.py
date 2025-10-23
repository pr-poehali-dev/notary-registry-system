'''
Business: Get user activity log for personal cabinet
Args: event - dict with httpMethod, headers (X-Auth-Token)
      context - object with attributes: request_id, function_name
Returns: HTTP response with activity log entries
'''

import json
import os
import hashlib
import hmac
import psycopg2
import psycopg2.extras
from typing import Dict, Any, Optional
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
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
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
        
        cur.execute("""
            SELECT al.id, al.action_type, al.action_description, al.created_at, d.document_number
            FROM t_p91929212_notary_registry_syst.activity_log al
            LEFT JOIN t_p91929212_notary_registry_syst.documents d ON al.document_id = d.id
            WHERE al.user_id = %s
            ORDER BY al.created_at DESC
            LIMIT 50
        """, (user_data['user_id'],))
        
        rows = cur.fetchall()
        
        activities = []
        for row in rows:
            activities.append({
                'id': row[0],
                'action_type': row[1],
                'description': row[2],
                'created_at': row[3].isoformat() if row[3] else None,
                'document_number': row[4]
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'activities': activities})
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