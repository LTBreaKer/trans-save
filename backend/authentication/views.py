from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CustomUser, CustomUserProfile
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import authentication_classes, permission_classes
from django.conf import settings
from urllib.parse import urlencode
import requests
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

@api_view(['POST'])
def loginView(request, *args, **kwargs):
    # print(request.headers)
    if request.user.is_authenticated:
        data = {'message': 'Already logged in'}
        return Response(data=data, status=400)
    username = request.data.get('username')
    password = request.data.get('password')
    if not username or not password:
        data = {'message': 'Username and password are required'}
        return Response(data=data,content_type='application/json', status=400)
    user = authenticate(request, username=username, password=password)
    if user is None:
        data = {'message': 'Invalid username or password'}
        return Response(data=data,content_type='application/json', status=401)
    login(request, user)
    data = { 'message': 'Login successful',
        'user': {'user_id': user.user_id,
                 'username': user.username,
                 'first_name': user.first_name,
                 'last_name': user.last_name}}
    response = Response(data=data,content_type='application/json', status=200)
    # print(response)
    return response

@api_view(['POST'])
def registerView(request, *args, **kwargs):

    username = request.data.get('username')
    password = request.data.get('password')
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    if not username or not password:
        return Response(status=400)
    user = CustomUser.objects.filter(username=username)
    if user.exists():
        data = {'username': ['This username is already taken.']}
        return Response(data=data, status=409)
    try:
        validate_password(password)
    except Exception as e:
        data = {'password': list(e.messages)}
        return Response(data, status=400)
    user = CustomUser.objects.create_user(username=username, password=password, first_name=first_name, last_name=last_name)
    
    return Response(status=201)

@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def userView(request, *args, **kwargs):
    # print(request.headers)
    user = request.user
    # print(user)
    if user.is_anonymous:
        data = {'message': 'Unauthorized'}
        return Response(data=data, status=401)
    user_profile = user.profile
    avatar_url = request.build_absolute_uri(user_profile.avatar.url)
    print(settings.MEDIA_ROOT)
    data = {'message': 'User found',
            'user': {'user_id': user.user_id,
                     'username': user.username,
                     'first_name': user.first_name,
                     'last_name': user.last_name,
                     'avatar': avatar_url}
                     }
    return Response(data=data, status=200)

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def logoutView(request, *args, **kwargs):
    print(request.headers)
    logout(request)
    data = {'message': 'Logout successful'}
    return Response(data=data, status=200)

@api_view(['POST'])
def login_42(request):
    client_id = settings.OAUTH2_PROVIDER['CLIENT_ID']
    redirect_uri = settings.OAUTH2_PROVIDER['REDIRECT_URI']
    authorization_url = "https://api.intra.42.fr/oauth/authorize"
    scopes = settings.OAUTH2_PROVIDER['SCOPES']
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': ' '.join(scopes)
    }
    authorization_url += '?' + urlencode(params)
    data = {'message': 'Redirecting to 42 login',
            'url': authorization_url}
    print(authorization_url)
    
    return Response(data=data, status=200)
    # return redirect(authorization_url)

@api_view(['POST'])
def callback(request):
    code = request.data.get('code')

    if not code:
        data = {'message': 'Code is required'}
        return Response(data=data, status=400)
		# return redirect('login')
    print('code = ',code)

    client_id = settings.OAUTH2_PROVIDER['CLIENT_ID']
    client_secret = settings.OAUTH2_PROVIDER['CLIENT_SECRET']
    redirect_uri = settings.OAUTH2_PROVIDER['REDIRECT_URI']
    token_url = "https://api.intra.42.fr/oauth/token"
    params = {
		'grant_type': 'authorization_code',
		'client_id': client_id,
		'client_secret': client_secret,
		'code': code,
		'redirect_uri': redirect_uri
	}
    response = requests.post(token_url, data=params)
    if response.status_code != 200:
        print(response.json())
        print('Failed to get access token')
        data = {'message': 'Failed to get access token'}
        return Response(data=data, status=403)
        # print('Failed to get access token')
        # return redirect('login')
    response_data = response.json()
    access_token = response_data['access_token']
    print('token = ' ,access_token)

    user_url = "https://api.intra.42.fr/v2/me"
    headers = {
		'Authorization': 'Bearer ' + access_token
	}
    response = requests.get(user_url, headers=headers)
    if response.status_code != 200:
        data = {'message': 'Failed to get user info'}
        return Response(data=data, status=400)

        # print('Failed to get user info')
        # return redirect('login')
    response_data = response.json()
    print(response_data)
    username = response_data['login']
    email = response_data['email']
    first_name = response_data['first_name']
    last_name = response_data['last_name']
    avatar = response_data['image']['link']
    try:
        user = CustomUser.objects.get(username=username)
    except CustomUser.DoesNotExist:
        response = requests.get(avatar)
        if response.status_code == 200:
            avatar_content = ContentFile(response.content)
            avatar_filename = f"avatars/{username}_avatar.jpg"
            print(avatar_filename)
            
            default_storage.save(avatar_filename, avatar_content)
        user = CustomUser.objects.create_user(username=username, email=email, first_name=first_name, last_name=last_name, avatar=avatar_filename)
    user.set_unusable_password()
    user.save()
    user = authenticate(username=username, password=None)
    if user is not None:
        login(request, user)
        data = { 'message': 'Login successful',
            'user': {'user_id': user.user_id,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name}}
        print('success')

        response = Response(data=data,content_type='application/json', status=200)
        return response
        # print('User authenticated')
        # login(request, user)
        # return redirect('index')
    else:
        data = {'message': 'Failed to authenticate'}
        return Response(data=data, status=400)
        # print('Failed to authenticate')
        # return redirect('login')
    