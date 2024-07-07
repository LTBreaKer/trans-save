from rest_framework import serializers
from .models import UserProfile, FriendRequest

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'user_id',
            'friends',
        ]

    # def create(self, validated_data, *args, **kwargs):
    #     print("create called")
    #     user_profile = UserProfile.objects.create(validated_data)
    #     return user_profile

class FriendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = [
            'to_user_id',
            'from_user_id',
        ]