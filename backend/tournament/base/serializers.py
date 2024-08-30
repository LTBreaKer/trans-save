from base.models import Tournament, TournamentParticipant, Match
from rest_framework import serializers


class TournamentParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentParticipant
        fields =['id', 'username']

class MatchSrializer(serializers.ModelSerializer):

    player_one = TournamentParticipantSerializer()
    player_two = TournamentParticipantSerializer()
    winner = TournamentParticipantSerializer()

    class Meta:
        model = Match
        fields = [
            'id',
            'player_one',
            'player_two',
            'player_one_score',
            'player_two_score',
            'winner',
            'status',
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



