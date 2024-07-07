from rest_framework import serializers
# from django.contrib.auth.models import User
from .models import User

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name', 'avatar',
            'is_online'
        ]
        extra_kwargs = {
            'username': {'required': False}
        }
    def get_avatar(self, obj):
        return obj.avatar.url
    def create(self, validated_data, *args, **kwargs):
        user = User.objects.create_user(**validated_data)
        return user
    def update(self, instance, validated_data, *args, **kwargs):
        instance.username = validated_data.get('username', instance.username)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.avatar = validated_data.get('avatar', instance.avatar)
        instance.save()
        return instance