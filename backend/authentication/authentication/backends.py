from django.contrib.auth.backends import BaseBackend
# from django.contrib.auth.models import User
from .models import User
# from .models import CustomUser
from django.contrib.auth.hashers import UNUSABLE_PASSWORD_PREFIX

class NoPasswordAuthBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        print("NoPasswordAuthBackend")
        if password != None:
            return
        if password != None and not password.startswith(UNUSABLE_PASSWORD_PREFIX):
            return
        if username is None:
            return
        try:
            user = User.objects.get(username=username)
            if user.is_active:
                return user
        except User.DoesNotExist:
            return None
        
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None