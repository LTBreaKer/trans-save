from django.db import models

# Create your models here.


class GameDb(models.Model):
    player1_id = models.IntegerField(blank=False, null=False)
    player2_id = models.IntegerField(blank=False, null=False)
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'game with player id {self.player1_id} vs player id {self.player2_id}'
    