from django.contrib import admin
from .models import CustomUserProfile, FriendRequest
# Register your models here.
admin.site.register(CustomUserProfile)
admin.site.register(FriendRequest)