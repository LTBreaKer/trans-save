from django.db import models
from django.contrib.auth.models import AbstractUser
from .validators import CustomUsernameValidator
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save
from django.dispatch import receiver
import requests

class User(AbstractUser):

    username_validator = CustomUsernameValidator()

    username = models.CharField(
        _("username"),
        max_length=10,
        unique=True,
        help_text=_(
            "Required.4 characters or more and 10 characters or fewer. Letters, digits and @/./+/-/_ only."
        ),
        validators=[username_validator],
        error_messages={
            "unique": _("A user with that username already exists."),
        },
    )
    tournament_username = models.CharField(
        max_length=10,
        validators=[username_validator],
        default="",
    )
    email = models.EmailField(unique=True, blank=False, null=False)
    avatar = models.ImageField(default='avatars/avatar-default.webp', upload_to='avatars/')
    is_online = models.BooleanField(default=False)
    is_logged_out = models.BooleanField(default=False)
    is_authentication_completed = models.BooleanField(default=False)
    twofa_active = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_expiry = models.DateTimeField(blank=True, null=True)
    max_otp_try = models.CharField(max_length=2, default=3)
    otp_max_out = models.DateTimeField(blank=True, null=True)

class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_id = models.CharField(max_length=255, unique=True)
    is_authentication_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)
