from django.db import models
from .validators import CustomUsernameValidator

# Create your models here.


class TagGameDb(models.Model):

    username_validator = CustomUsernameValidator()


    player1_id = models.IntegerField(blank=False, null=False)
    player2_id = models.IntegerField(blank=False, null=False)
    is_remote = models.BooleanField(default=True)
    player1_name = models.CharField(max_length=150, validators=[username_validator])
    player2_name = models.CharField(max_length=150, validators=[username_validator])
    winner_id = models.IntegerField(blank=True, null=True)
    winner_name = models.CharField(max_length=150, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    