from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
# from .models import CustomUser, CustomUserProfile
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import authentication_classes, permission_classes
from django.conf import settings
from urllib.parse import urlencode
import requests
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework.authtoken.models import Token
import os, string, random
# from django.contrib.auth.models import User
from django.contrib.auth.models import User
from .serializers import UserSerializer
from django.contrib.auth.hashers import make_password, check_password

@api_view(['POST'])
def loginView(request, *args, **kwargs):
    if request.user.is_authenticated:
        data = {'message': 'Already logged in'}
        return Response(data=data, status=400)
    username = request.data.get('username')
    password = request.data.get('password')
    print(username, password)
    if not username or not password:
        data = {'message': 'Username and password are required'}
        return Response(data=data,content_type='application/json', status=401)
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        data = {'message': 'Invalid username'}
        return Response(data=data,content_type='application/json', status=401)
    if not user.check_password(password):
        data = {'message': 'Invalid password'}
        return Response(data=data,content_type='application/json', status=401)
    token = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(user)
    data = {'message': 'Login successful',
            'user': serializer.data,
            'token': token[0].key}
    response = Response(data=data,content_type='application/json', status=200)
    return response

@api_view(['POST'])
def registerView(request, *args, **kwargs):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        user = User.objects.get(username=serializer.data.get('username'))
        try:
            validate_password(request.data.get('password'))
        except Exception as e:
            user.delete()
            data = {'message': str(e)}
            return Response(data=data,content_type='application/json', status=400)
        user.set_password(request.data.get('password'))
        user.save()
        token = Token.objects.create(user=user)
        data = {'message': 'Registration successful',
                'user': serializer.data,
                'token': token.key}
        response = Response(data=data,content_type='application/json', status=201)
        return response
    else:
        data = {'message': serializer.errors['username'][0]}
        return Response(data=data,content_type='application/json', status=400)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def userView(request, *args, **kwargs):
    print(request.headers)
    user = request.user
    # print(user)
    if user.is_anonymous:
        data = {'message': 'Unauthorized'}
        return Response(data=data, status=401)
    user_profile = user.profile
    avatar_url = request.build_absolute_uri(user_profile.avatar.url)
    avatar_url = f"media/{user_profile.avatar}"
    print(settings.MEDIA_ROOT)
    serializer = UserSerializer(user)
    data = {'message': 'User found',
            'user': serializer.data}
    return Response(data=data, status=200)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
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
        data = {'message': 'Failed to get access token'}
        return Response(data=data, status=403)
        # print('Failed to get access token')
        # return redirect('login')
    response_data = response.json()
    access_token = response_data['access_token']

    user_url = "https://api.intra.42.fr/v2/me"
    headers = {
		'Authorization': 'Bearer ' + access_token
	}
    response = requests.get(user_url, headers=headers)
    if response.status_code != 200:
        data = {'message': 'Failed to get user info'}
        return Response(data=data, status=400)
    response_data = response.json()
    print(response_data)
    username = response_data['login']
    email = response_data['email']
    first_name = response_data['first_name']
    last_name = response_data['last_name']
    avatar = response_data['image']['link']
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        response = requests.get(avatar)
        if response.status_code == 200:
            avatar_content = ContentFile(response.content)
            avatar_filename = f"avatars/{username}_avatar.jpg"
            while os.path.exists(settings.MEDIA_ROOT + "/" + avatar_filename):
                os.remove(settings.MEDIA_ROOT + "/" + avatar_filename)
            default_storage.save(avatar_filename, avatar_content)
        user = User.objects.create_user(username=username, email=email, first_name=first_name, last_name=last_name)
    user.set_unusable_password()
    avatar_filename = f"avatars/{username}_avatar.jpg"
    user.save()
    user.profile.avatar = avatar_filename
    user.profile.save()
    token = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(user)
    data = {'message': 'Login successful',
            'user': serializer.data,
            'token': token[0].key}
    response = Response(data=data,content_type='application/json', status=200)
    return response

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_user(request, *args, **kwargs):
    user = request.user
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer = UserSerializer(user, data=serializer.validated_data, partial=True)
        if serializer.is_valid():
            if 'password' in request.data:
                old_password = request.data.get('old_password')
                if not old_password:
                    data = {'message': 'Old password is required'}
                    return Response(data=data, status=400)
                if not user.check_password(old_password):
                    data = {'message': 'Invalid old password'}
                    return Response(data=data, status=400)
                new_password = request.data.get('password')
                try:
                    validate_password(new_password)
                except Exception as e:
                    data = {'message': str(e)}
                    return Response(data=data, status=400)
                user.password = make_password(new_password)
                user.save()
                request.user.auth_token.delete()
            if 'avatar' in request.data:
                avatar = request.data.get('avatar')
                if avatar:
                    try:
                        file = request.FILES['avatar']
                        file_content = ContentFile(file.read())
                    except Exception as e:
                        data = {'message': 'Invalid avatar file'}
                        return Response(data=data, status=400)
                    avatar_filename = f"avatars/{user.username}_avatar.jpg"
                    while os.path.exists(settings.MEDIA_ROOT + "/" + avatar_filename):
                        os.remove(settings.MEDIA_ROOT + "/" + avatar_filename)
                    default_storage.save(avatar_filename, file_content)
                    #...
                    user.profile.avatar = avatar_filename
                    user.profile.save()
            serializer.save()
            data = {'message': 'User updated',
                    'user': serializer.data}
            return Response(data=data, status=200)
    else:
        data = {'message': serializer.errors}
        return Response(data=data, status=400)