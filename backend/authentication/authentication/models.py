from django.db import models
from django.contrib.auth.models import AbstractUser, AbstractBaseUser, BaseUserManager, PermissionsMixin, User, UserManager
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.utils import timezone
from django.contrib.auth.password_validation import validate_password
from django.db.models.signals import post_save
from django.dispatch import receiver
# Create your models here.

# class CustomUserManager(BaseUserManager):
#     def create_user(self, username, password=None, **extra_fields):
#         if not username:
#             raise ValueError('The Username must be set')
#         # if not password:
#         #     raise ValueError('The Password must be set')

#         first_name = extra_fields.get('first_name')
#         last_name = extra_fields.get('last_name')
#         user = self.model(username=username, first_name=first_name, last_name=last_name)
#         if password:
#             validate_password(password)
#             user.set_password(password)
#         else:
#             user.set_unusable_password()
#         user.save()
#         avatar = extra_fields.get('avatar')
#         if not CustomUserProfile.objects.filter(user=user).exists():
#             profile = CustomUserProfile(user=user, avatar=avatar) if avatar else CustomUserProfile(user=user)
#             profile.save()
#         return user

#     def create_superuser(self, username, password=None, **extra_fields):
#         first_name = extra_fields.get('first_name')
#         last_name = extra_fields.get('last_name')
#         user = self.create_user(username=username, password=password, first_name=first_name, last_name=last_name)
#         user.is_superuser = True
#         user.is_staff = True
#         user.date_joined = timezone.now()
#         user.save()
#         return user
    
# class CustomUser(AbstractBaseUser, PermissionsMixin):
#     username_validator = UnicodeUsernameValidator()

#     user_id = models.AutoField(primary_key=True)
#     username = models.CharField(max_length=255, unique=True, validators=[username_validator])
#     first_name = models.CharField(max_length=255, null=True, blank=True)
#     last_name = models.CharField(max_length=255, null=True, blank=True)
#     is_active = models.BooleanField(default=True)
#     is_staff = models.BooleanField(default=False)
#     is_superuser = models.BooleanField(default=False)
#     date_joined = models.DateTimeField(default=timezone.now)

#     objects = CustomUserManager()
#     USERNAME_FIELD = 'username'
#     # REQUIRED_FIELDS = []

#     def __str__(self):
#         return self.username

#     def has_perm(self, perm, obj=None):
#         return self.is_superuser

#     def has_module_perms(self, app_label):
#         return self.is_superuser

# class CustomUserManager(UserManager):

#     def create_user(self, username, password, avatar, **extra_fields):

#         user = super().create_user(username, password, **extra_fields)

#         profile = CustomUserProfile.objects.create(user=user)

#         avatar = extra_fields.get('avatar')

#         if avatar:
#             profile.avatar = avatar

#         profile.save()

#         return user

# class CustomUser(AbstractUser):
#     objects = CustomUserManager()

class CustomUserProfile(models.Model):
    user = models.OneToOneField(User, related_name='profile', on_delete=models.CASCADE)
    avatar = models.ImageField(default='avatars/avatar-default.webp', upload_to='avatars/')
    friends = models.ManyToManyField('self', blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_online = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username + '/`s Profile'
    
@receiver(post_save, sender=User)
def create_user_profile(sender, instance=None, created=False, **kwargs):
    if created:
        CustomUserProfile.objects.create(user=instance)

class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, related_name='from_user', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='to_user', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.from_user.username} sent friend request to {self.to_user.username}'