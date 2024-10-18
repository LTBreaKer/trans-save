import requests

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