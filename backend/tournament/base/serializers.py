from base.models import Tournament, TournamentParticipant, Match
from rest_framework import serializers


class TournamentParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentParticipant
        fields =['id', 'username']

    def validate_username(self, value):
        # This ensures that the custom validator is applied.
        return super().validate_username(value)

class MatchSrializer(serializers.ModelSerializer):

    player_one = TournamentParticipantSerializer()
    player_two = TournamentParticipantSerializer()
    winner = TournamentParticipantSerializer()

    class Meta:
        model = Match
        fields = [
            'match_number',
            'player_one',
            'player_two',
            'player_one_score',
            'player_two_score',
            'winner',
            'status',
            'stage',
        ]

class TournamentSerializer(serializers.ModelSerializer):
    participants = TournamentParticipantSerializer(many=True)
    matches = MatchSrializer(many=True)

    class Meta:
        model = Tournament

        fields = [
            'id',
            'creator_id',
            'created_at',
            'participants',
            'matches',
        ]



