from rest_framework.response import Response
import requests

def check_auth(auth_header):
    endpoint = 'https://server:9004/api/auth/get-user/'
    headers = {
        'Authorization': auth_header,
    }
    response = requests.get(endpoint, headers=headers, verify=False)
    return response

def get_user(user_id=None, username=None, auth_header=None):
    if not user_id and not username:
        return Response({'message': 'user_id or username required'}, status=400)
    if user_id:
        endpoint = 'https://server:9004/api/auth/get-user-by-id/'
        headers = {
            'Authorization': auth_header,
        }
        data = {
            'user_id': user_id,
        }
    else:
        endpoint = 'https://server:9004/api/auth/get-user-by-username/'
        headers = {
            'Authorization': auth_header,
        }
        data = {
            'username': username,
        }
    response = requests.get(url=endpoint, headers=headers, data=data, verify=False)
    return response