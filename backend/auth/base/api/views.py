from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenBlacklistView
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from .serializers import UserSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.utils import timezone
from base.models import User, UserSession
from urllib.parse import urlencode
from .helpers import generate_otp, send_otp_email
import requests
import os
import sys
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import string, random, datetime, mimetypes, magic
from requests.exceptions import RequestException
import uuid

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_token(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    token = AUTH_HEADER.split(' ')[1]
    # r_token = RefreshToken(token)
    # print(r_token)
    return Response(status=200)


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request: Request, *args, **kwargs) -> Response:
        try:
            # raise Exception
            user = User.objects.get(username=request.data.get('username'))
            # if user.is_authentication_completed:
            #     return Response({'message': 'user already logged in'}, status=400)
            response = super().post(request, args, kwargs)
            user.is_online = True
            user.is_logged_out = False
            user.save()
            session_id = uuid.uuid4()
            user_session = UserSession.objects.create(user=user, session_id=session_id)
            
            #need to generate otp and send it to user email
            if user.twofa_active:
                if int(user.max_otp_try) == 0 and user.otp_max_out:
                    t = user.otp_max_out - timezone.now()
                    diff = t.total_seconds() / 60
                    data = {
                        'message': f"try again in {round(diff, 2)} minutes"
                    }
                    return Response(data=data, status=400)
                otp = generate_otp()
                otp_expiry = timezone.now() + datetime.timedelta(minutes=5)
                max_otp_try = int(user.max_otp_try) - 1
                otp_max_out = timezone.now() + datetime.timedelta(hours=1) if max_otp_try == 0 else None

                user.otp = otp
                user.otp_expiry = otp_expiry
                user.max_otp_try = max_otp_try
                user. otp_max_out = otp_max_out
                user.save()
        
                # send the otp to user email
                send_otp_email(user.otp, user.email)
                return Response({'message': 'Waiting for otp verification', 'token': response.data}, status=200)
            else:
                user_session.is_authentication_completed = True
                user_session.save()
                response.data['session_id'] = session_id
                response.data['message'] = 'user logged in'
                return response
        except Exception as e:
            raise InvalidToken(str(e))
        
class LogoutView(TokenBlacklistView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request: Request, *args, **kwargs):
        try:
            session_id = request.headers.get('Session-ID')
            if not session_id:
                return Response({'message': 'session_id is required'}, status=400)
            user = request.user
            try:
                user_session = UserSession.objects.get(user=user, session_id=session_id)
            except UserSession.DoesNotExist:
                return Response({'message': 'user_session does not exist'}, status=404)
            super().post(request, args, kwargs)
            user.is_online = False
            user_session.delete()
            user.is_logged_out = True
            user.save()
            return Response({'message': 'User logged out'}, status=200)
        except Exception as e:
            raise(InvalidToken(str(e)))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verifyOtpView(request, *args, **kwargs):
    user = request.user

    # if user.is_logged_out:
    #     return Response({'message': 'user logged out'}, status=403)
    otp = request.data.get('otp')
    if not otp:
        return Response({'message': 'otp is required'}, statu=400)
    if user.otp_expiry <= timezone.now():
        return Response({'message': 'otp expired'})
    if otp != user.otp:
        return Response({'message':'otp is incorrect'}, status=403)
    if not user.is_staff:
        user.otp = None
        user.otp_expiry = None
        user.max_otp_try = 3
        user.otp_max_out = None

        user.is_online = True
        session_id = uuid.uuid4()
        user_session = UserSession.objects.create(user=user, session_id=session_id)
        user_session.is_authentication_completed = True
        user_session.save()
        user.save()

    return Response({'message': 'otp verified successfully', 'session_id': session_id}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resendOtpView(request, *args, **kwargs):
    user = request.user
    if int(user.max_otp_try) == 0 and user.otp_max_out:
        t = user.otp_max_out - timezone.now()
        diff = t.total_seconds() / 60
        data = {
            'message': f"try again in {round(diff, 2)} minutes"
        }
        return Response(data=data, status=400)
    otp = generate_otp()
    otp_expiry = timezone.now() + datetime.timedelta(minutes=5)
    max_otp_try = int(user.max_otp_try) - 1
    otp_max_out = timezone.now() + datetime.timedelta(hours=1) if max_otp_try == 0 else None

    user.otp = otp
    user.otp_expiry = otp_expiry
    user.max_otp_try = max_otp_try
    user. otp_max_out = otp_max_out
    user.save()
    
    # need to send the otp to user email
    send_otp_email(user.otp, user.email)

    return Response({'message': 'otp sent to user email'}, status=200)


@api_view(['POST'])
def registerView(request, *args, **kwargs):
    print(request.headers)
    
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        user = User.objects.get(username=serializer.validated_data.get('username'))
        try:
            validate_password(password=request.data.get('password'))
        except Exception as e:
            user.delete()
            data = {'message': e}
            return Response(data=data, content_type='application/json', status=400)
        user.set_password(request.data.get('password'))
        user.is_online = True
        user.save()
        session_id = uuid.uuid4()
        UserSession.objects.create(user=user, session_id=session_id, is_authentication_completed=True)

        refresh = RefreshToken.for_user(user)

        token = {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }
        # otp = generate_otp()
        # otp_expiry = timezone.now() + datetime.timedelta(minutes=5)
        # max_otp_try = int(user.max_otp_try) - 1

        # user.otp = otp
        # user.otp_expiry = otp_expiry
        # user.max_otp_try = max_otp_try
        # user.save()

        # need to send the otp to user email
        # try:
        #     send_otp_email(user.otp, user.email)
        # except Exception as e:
        #     return Response({'message': str(e)}, status=500)
        try:
            response = requests.post(
                'https://server:9005/api/user/create-profile/',
                data={'user_id': user.id},
                verify=False
            )
            # response.raise_for_status()  # Raise an exception for HTTP errors
        except RequestException as e:
            return Response({'message': str(e)}, status=500)
        # Handle the error appropriately
        # response_data = response.json()
        # print(response_data)
        return Response(data={'message':'User created', 'token':token, 'session_id':session_id}, status=201)
    else:
        data = {'message': serializer.errors}
        return Response(data=data, content_type='application/json', status=400)
    
@api_view(['POST'])
def login_42(request):
    client_id = settings.OAUTH2_PROVIDER['CLIENT_ID']
    redirect_uri = settings.OAUTH2_PROVIDER['REDIRECT_URI']
    authorization_url = "https://api.intra.42.fr/oauth/authorize"
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
    }
    authorization_url += '?' + urlencode(params)
    data = {'message': 'Redirecting to 42 login',
            'url': authorization_url}
    return Response(data=data, status=200)

@api_view(['POST'])
def callback_42(request):
    code = request.data.get('code')

    if not code:
        data = {'message': 'Code in required'}
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
        return Response(data={'message': 'Failed to get access token'}, status=403)
    response_data = response.json()
    access_token = response_data['access_token']

    user_url = "https://api.intra.42.fr/v2/me"
    headers = {
        'Authorization': 'Bearer ' + access_token
    }
    response = requests.get(user_url, headers=headers)
    if response.status_code != 200:
        return Response(data={'message': 'Failed to get user info'})
    response_data = response.json()
    username = response_data['login']
    email = response_data['email']
    first_name = response_data['first_name']
    last_name = response_data['last_name']
    avatar = response_data['image']['link']
    data = {
        'username': username,
        'email': email,
        'first_name': first_name,
        'last_name': last_name
    }
    try:
        user = User.objects.get(first_name=first_name)
        user.is_logged_out = False
    except User.DoesNotExist:
        response = requests.get(avatar, verify=False)
        if response.status_code == 200:
            avatar_content = ContentFile(response.content)
            avatar_filename = f"avatars/{username}_avatar.jpg"
            while os.path.exists(settings.MEDIA_ROOT + '/' + avatar_filename):
                os.remove(settings.MEDIA_ROOT + '/' + avatar_filename)
            default_storage.save(avatar_filename, avatar_content)
        try:
            serializer = UserSerializer(data = data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            # user = User.objects.create_user(username=username, email=email,
            #                             first_name=first_name, last_name=last_name)
        except Exception as e:
            return Response({'message': serializer.errors}, status=400)
        user = User.objects.get(username=username)
        user.avatar = f"avatars/{username}_avatar.jpg"
        user.set_unusable_password()
        user.is_authentication_completed = True
    user.is_online = True
    user.save()
    refresh = RefreshToken.for_user(user)
    token = {
        'refresh': str(refresh),
        'access': str(refresh.access_token)
    }
    try:
        response = requests.post(
            'https://server:9005/api/user/create-profile/',
            data={'user_id': user.id},
            verify=False
        )
        # response.raise_for_status()  # Raise an exception for HTTP errors
    except RequestException as e:
        return Response({'message': str(e)}, status=500)
    session_id = uuid.uuid4()
    user_session = UserSession.objects.create(user=user, session_id=session_id)
    if user.twofa_active:
        if int(user.max_otp_try) == 0 and user.otp_max_out:
                t = user.otp_max_out - timezone.now()
                diff = t.total_seconds() / 60
                data = {
                    'message': f"try again in {round(diff, 2)} minutes"
                }
                return Response(data=data, status=400)
        otp = generate_otp()
        otp_expiry = timezone.now() + datetime.timedelta(minutes=5)
        max_otp_try = int(user.max_otp_try) - 1
        otp_max_out = timezone.now() + datetime.timedelta(hours=1) if max_otp_try == 0 else None

        user.otp = otp
        user.otp_expiry = otp_expiry
        user.max_otp_try = max_otp_try
        user. otp_max_out = otp_max_out
        user.save()

        # send the otp to user email
        send_otp_email(user.otp, user.email)
        return Response({'message': 'Waiting for otp verification', 'token': token}, status=200)
    else:
        user_session.is_authentication_completed = True
        user.save()
        user_session.save()
    return Response(data={'message': 'Login successful', 'token': token, 'session_id':session_id}, status=201)

@api_view(['POST'])
def verify_token(request, *args, **kwargs):
    try:

        access_token = AccessToken(request.data.get('token'))

        user_id = access_token['user_id']

        try:
            user = User.objects.get(id=user_id)
            return Response(data={'message': 'Token is Valid'})
        except User.DoesNotExist:
            return Response({'message': 'user does not exist'}, status=404)    
    except Exception as e:
        return Response(data={'message': 'Invalid token'}, status=401)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request, *args, **kwargs):
    user = request.user
    session_id = request.headers.get('Session-ID')
    try:
        user_session = UserSession.objects.get(user=user, session_id=session_id)
    except UserSession.DoesNotExist:
        return Response({'message': 'user_session does not exist'}, status=404)
    if not user_session.is_authentication_completed:
        return Response({'message': 'User not authenticated properly'}, status=403)
    serializer = UserSerializer(user)
    data = {
        'message': 'User found',
        'user_data': serializer.data
    }
    return Response(data, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_user_by_id(request, *args, **kwargs):
    user = request.user
    session_id = request.headers.get('Session-ID')
    try:
        user_session = UserSession.objects.get(user=user, session_id=session_id)
    except UserSession.DoesNotExist:
        return Response({'message': 'user_session does not exist'}, status=404)
    
    if not user_session.is_authentication_completed:
        return Response({'message': 'User not authenticated properly'}, status=403)
    id = request.data.get('user_id')
    if not id:
        return Response({'message': 'user_id required'}, status=400)
    try:
        requested_user = User.objects.get(id=id)
    except Exception:
        return Response({'message': 'user not found'}, status=404)
    serializer = UserSerializer(requested_user)
    data = {
        'message': 'User found',
        'user_data': serializer.data
    }
    return Response(data, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_user_by_username(request):
    user = request.user
    session_id = request.headers.get('Session-ID')
    try:
        user_session = UserSession.objects.get(user=user, session_id=session_id)
    except UserSession.DoesNotExist:
        return Response({'message': 'user_session does not exist'}, status=404)
        
    if not user_session.is_authentication_completed:
        return Response({'message': 'User not authenticated properly'}, status=403)
    
    username = request.data.get('username')
    if not username:
        return Response({'message': 'username required'}, status=400)
    
    try:
        requested_user = User.objects.get(username=username)
    except Exception:
        return Response({'message': 'user not found'}, status=404)
    serializer = UserSerializer(requested_user)
    data = {
        'message': 'User Found',
        'user_data': serializer.data
    }
    return Response(data, status=200)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request, *args, **kwargs):
    user = request.user
    session_id = request.headers.get('Session-ID')
    try:
        user_session = UserSession.objects.get(user=user, session_id=session_id)
    except UserSession.DoesNotExist:
        return Response({'message': 'user_session does not exist'}, status=404)
        
    if not user_session.is_authentication_completed:
        return Response({'message': 'User not authenticated properly'}, status=403)
    # serializer = UserSerializer(data=request.data)
    # if not serializer.is_valid():
    #     return Response(data={'message': serializer.errors}, status=401)
    print('data: ', request.data)
    serializer = UserSerializer(instance=user, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(data={'message': serializer.errors}, status=400)
    if 'avatar' in request.data:
        avatar = request.FILES['avatar']

        mime = magic.Magic(mime=True)
        mime_type = mime.from_buffer(avatar.read(1024))
        avatar.seek(0)
        if mime_type not in ['image/jpeg', 'image/png', 'image/webp']:
            return Response(data={'message': 'Only JPEG, PNG and webp formats are allowed.'}, status=400)
        try:
            file_content = ContentFile(avatar.read())
        except Exception as e:
            return Response(data={'message': 'Invalid avatar file'}, status = 400)
        avatar_filename = f"avatars/{user.username}_avatar.jpg"
        while os.path.exists(settings.MEDIA_ROOT + "/" + avatar_filename):
            os.remove(settings.MEDIA_ROOT + "/" + avatar_filename)
        default_storage.save(avatar_filename, file_content)
        user.avatar = avatar_filename
    if 'password' in request.data:
        old_password = request.data.get('old_password')
        if not old_password:
            error = {
                'old_password': ['old_password is required'],
            }
            return Response(data={'message': error}, status=400)
        if not user.check_password(old_password):
            error = {
                'old_password': ['Invalid old password']
            }
            return Response(data={'message': error}, status=400)
        new_password = request.data.get('password')
        try:
            validate_password(new_password)
        except Exception as e:
            return Response(data={'message': {'password': e}}, status=400)
        user.password = make_password(new_password)

    user.save()
    serializer.save()
    return Response(data={'message': 'User updated'}, status=200)
