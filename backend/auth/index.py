'''
Business: User authentication and authorization with role-based access control
Args: event - dict with httpMethod, body (login/password for POST)
      context - object with attributes: request_id, function_name
Returns: HTTP response with JWT token or user info
'''

import json
import os
import hashlib
import hmac
import psycopg2
import psycopg2.extras
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

def generate_token(user_id: int, email: str, role: str) -> str:
    secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    expiry = (datetime.utcnow() + timedelta(days=7)).isoformat()
    payload = f"{user_id}:{email}:{role}:{expiry}"
    signature = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}:{signature}"

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

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            email = body_data.get('email', '').strip()
            password = body_data.get('password', '').strip()
            
            if not email or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Email and password required'})
                }
            
            password_hash = hash_password(password)
            
            cur.execute(
                "SELECT id, email, full_name, role, phone, region FROM t_p91929212_notary_registry_syst.users WHERE email = %s AND password_hash = %s",
                (email, password_hash)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Invalid credentials'})
                }
            
            user_id, user_email, full_name, role, phone, region = user
            token = generate_token(user_id, user_email, role)
            
            cur.execute(
                "INSERT INTO t_p91929212_notary_registry_syst.activity_log (user_id, action_type, action_description) VALUES (%s, %s, %s)",
                (user_id, 'login', f'User {full_name} logged in')
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'token': token,
                    'user': {
                        'id': user_id,
                        'email': user_email,
                        'full_name': full_name,
                        'role': role,
                        'phone': phone,
                        'region': region
                    }
                })
            }
        
        elif method == 'GET':
            auth_header = event.get('headers', {}).get('X-Auth-Token', '')
            if not auth_header:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'No token provided'})
                }
            
            user_data = verify_token(auth_header)
            if not user_data:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Invalid or expired token'})
                }
            
            cur.execute(
                "SELECT id, email, full_name, role, phone, region FROM t_p91929212_notary_registry_syst.users WHERE id = %s",
                (user_data['user_id'],)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'User not found'})
                }
            
            user_id, user_email, full_name, role, phone, region = user
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'user': {
                        'id': user_id,
                        'email': user_email,
                        'full_name': full_name,
                        'role': role,
                        'phone': phone,
                        'region': region
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