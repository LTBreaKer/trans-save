from django.db import models
from .validators import CustomUsernameValidator

# Create your models here.


class TagGameDb(models.Model):

    username_validator = CustomUsernameValidator()


    player1_id = models.IntegerField(blank=False, null=False)
    player2_id = models.IntegerField(blank=False, null=False)
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_remote = models.BooleanField(default=True)
    player2_name = models.CharField(max_length=150, validators=[username_validator])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'game with player id {self.player1_id} vs player id {self.player2_id}'
    