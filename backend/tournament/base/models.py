from django.db import models
from .validators import CustomUsernameValidator

class Tournament(models.Model):
    creator_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"tournament id {self.id}"
    

class TournamentParticipant(models.Model):

    username_validator = CustomUsernameValidator()

    tournament = models.ForeignKey(Tournament, related_name='participants', on_delete=models.CASCADE)
    username = models.CharField(max_length=255, validators=[username_validator])

    def __str__(self) -> str:
        return f"{self.username} in tournament id {self.tournament.id}"
    
class Match(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='matches', on_delete=models.CASCADE)
    player_one = models.ForeignKey(TournamentParticipant, related_name='matches_as_player_one', on_delete=models.CASCADE)
    player_two = models.ForeignKey(TournamentParticipant, related_name='matches_as_player_two', on_delete=models.CASCADE)
    player_one_score = models.IntegerField(default=0)
    player_two_score = models.IntegerField(default=0)
    winner = models.ForeignKey(TournamentParticipant, related_name='won_matches', on_delete=models.CASCADE)
    status = models.CharField(max_length=50, choices=[('upcoming', 'Upcoming'), ('ongoing', 'Ongoing'), ('complete', 'Complete')], default='upcoming')

    def __str__(self) -> str:
        return f"Match: {self.player_one.username} vs {self.player_two.username} in tournament id {self.tournament.id}"