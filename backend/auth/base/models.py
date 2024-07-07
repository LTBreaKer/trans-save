from django.db import models
from django.contrib.auth.models import AbstractUser
from .validators import CustomUsernameValidator
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save
from django.dispatch import receiver
import requests


# Create your models here.

class User(AbstractUser):

    username_validator = CustomUsernameValidator()

    username = models.CharField(
        _("username"),
        max_length=150,
        unique=True,
        help_text=_(
            "Required.4 characters or more and 150 characters or fewer. Letters, digits and @/./+/-/_ only."
        ),
        validators=[username_validator],
        error_messages={
            "unique": _("A user with that username already exists."),
        },
    )
    email = models.EmailField(unique=True, blank=False, null=False)
    avatar = models.ImageField(default='avatars/avatar-default.webp', upload_to='avatars/')
    is_online = models.BooleanField(default=False)
    email_verified = models.BooleanField(
        default=False,
        error_messages={
            "unique": _("A user with that email already exists."),
        })
    is_authentication_completed = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_expiry = models.DateTimeField(blank=True, null=True)
    max_otp_try = models.CharField(max_length=2, default=3)
    otp_max_out = models.DateTimeField(blank=True, null=True)

# @receiver(post_save, sender=User)
# def create_user_profile(sender, instance=None, created=False, **kwargs):
#     if created:
#         response = requests.post(
#             'https://127.0.0.1:8001/api/user/create_profile',
#             {
#                 'user_id': instance.id,
#             }
#         )
#         response_data = response.json()
#         print(response_data)
