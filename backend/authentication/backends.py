from django.contrib.auth.backends import BaseBackend
# from django.contrib.auth.models import User
from authentication.models import CustomUser
from django.contrib.auth.hashers import UNUSABLE_PASSWORD_PREFIX

class NoPasswordAuthBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        print("NoPasswordAuthBackend")
        if password != None:
            return None
        if password != None and not password.startswith(UNUSABLE_PASSWORD_PREFIX):
            return None
        if username is None:
            return None
        try:
            user = CustomUser.objects.get(username=username)
            if user.is_active:
                return user
        except CustomUser.DoesNotExist:
            return None
        
    def get_user(self, user_id):
        try:
            return CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return None