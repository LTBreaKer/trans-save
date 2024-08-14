from rest_framework import serializers
from base.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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
            'is_online'
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
            instance.save()
            return instance