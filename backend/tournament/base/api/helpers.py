import requests

def check_auth(auth_header):
    endpoint = 'https://server:9004/api/auth/get-user/'
    headers = {
        'Authorization': auth_header,
    }
    response = requests.get(endpoint, headers=headers, verify=False)
    return response

def is_user_authenticated(auth_header) -> bool:
    response = check_auth(auth_header)
    return response.status_code == 200

def get_user_info(user_id, auth_header):
    endpoint = 'https://server:9004/api/auth/get-user-by-id/'
    headers = {
        'Authorization': auth_header,
    }
    data = {
        'user_id': user_id,
    }
    response = requests.get(endpoint, headers=headers, data=data, verify=False)
    return response