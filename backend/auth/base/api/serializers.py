from rest_framework import serializers
from base.models import User
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken 
from rest_framework.response import Response
import jwt
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
import sys

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['avatar'] = user.avatar.url

        return token


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'avatar',
            'twofa_active',
            'is_online',
            'tournament_username',
        ]
        extra_kwargs = {
            'username': {'required': False},
            # 'email': {'required': False}
        }

        def create(elf, validated_data, *args, **kwargs):
            user = User.objects.create_user(**validated_data)
            return user
        
        def update(self, instance, validated_data, *args, **kwargs):
            instance.username = validated_data.get('username', instance.username)
            instance.email = validated_data.get('email', instance.email)
            instance.first_name = validated_data.get('first_name', instance.first_name)
            instance.last_name = validated_data.get('last_name', instance.last_name)
            instance.twofa_active = validated_data.get('twofa_active', instance.twofa_active)
            instance.tournament_username = validated_data,get('tournament_username', instance.tournament_username)
            instance.save()
            return instance

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        try:
            refresh_token = RefreshToken(attrs['refresh'])
            response = super().validate(attrs)
            return response
        except TokenError as e:
            refresh_token = attrs['refresh']
            try:
                decoded_token = jwt.decode(
                    refresh_token,
                    settings.SECRET_KEY,
                    algorithms=[settings.SIMPLE_JWT['ALGORITHM']],
                )
                jti = decoded_token.get('jti')
            except jwt.ExpiredSignatureError:
                raise InvalidToken("The token has expired.")
            except jwt.InvalidTokenError:
                raise InvalidToken("Token is invalid.")
            try:
                blacklisted_token = BlacklistedToken.objects.get(token__jti=jti)
                if timezone.now() - blacklisted_token.blacklisted_at < timedelta(seconds=10):
                    raise InvalidToken("the token just changed")
                else:
                    raise InvalidToken(e.args[0])
            except InvalidToken as e:
                raise InvalidToken(e.args[0])
        return attrs

        
        
