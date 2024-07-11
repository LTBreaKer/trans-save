import requests

def check_auth(auth_header):
    endpoint = 'https://server:9004/api/auth/get_user/'
    headers = {
        'Authorization': auth_header,
    }
    response = requests.get(endpoint, headers=headers, verify=False)
    return response

def get_user(user_id, auth_header):
    endpoint = 'https://server:9004/api/auth/get_user_by_id/'
    headers = {
        'Authorization': auth_header,
    }
    data = {
        'user_id': user_id,
    }
    response = requests.get(endpoint, headers=headers, data=data, verify=False)
    return response