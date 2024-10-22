import requests
from rest_framework.response import Response

def check_auth(auth_header, session_id):
    endpoint = 'https://server:9004/api/auth/get-user/'
    headers = {
        'Authorization': auth_header,
        'Session-ID': session_id,
    }
    response = requests.get(endpoint, headers=headers, verify=False)
    return response

def is_user_authenticated(auth_header) -> bool:
    response = check_auth(auth_header)
    return response.status_code == 200

def get_user_info(user_id, auth_header, session_id):
    endpoint = 'https://server:9004/api/auth/get-user-by-id/'
    headers = {
        'Authorization': auth_header,
        'Session-ID': session_id,
    }
    data = {
        'user_id': user_id,
    }
    response = requests.post(endpoint, headers=headers, data=data, verify=False)
    return response

def get_user(user_id=None, username=None, auth_header=None, session_id=None):
    if not session_id or (not user_id and not username):
        return Response({'message': 'session_id and user_id or username required'}, status=400)
    if user_id:
        endpoint = 'https://server:9004/api/auth/get-user-by-id/'
        headers = {
            'Authorization': auth_header,
            'Session-ID': session_id,
        }
        data = {
            'user_id': user_id,
        }
    else:
        endpoint = 'https://server:9004/api/auth/get-user-by-username/'
        headers = {
            'Authorization': auth_header,
            'Session-ID': session_id,
        }
        data = {
            'username': username,
        }
    response = requests.post(url=endpoint, headers=headers, data=data, verify=False)
    return response