from base.models import Tournament, TournamentParticipant, Match
from base.serializers import TournamentSerializer, TournamentParticipantSerializer, MatchSrializer
from rest_framework.decorators import api_view
from .helpers import check_auth, get_user_info
from rest_framework.response import Response
import random

@api_view(['POST'])
def create_tournament(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    auth_check_response = check_auth(AUTH_HEADER)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    # check if user is not in a game



    creator_id = auth_check_response.json()['user_data']['id']

    participants = request.data.get('participants', [])
    if not isinstance(participants, list):
        return Response({'message': 'Participants must be provided as a list'}, status=400)
    
    if not len(participants) != 8:
        return Response({'message': 'unvalid number of participants, valid number is 8'}, status=400)

    tournament = Tournament.objects.create(creator_id=creator_id)

    for username in participants:
        TournamentParticipant.objects.create(tournament=tournament, username=username)

    participants = list(tournament.participants.all())
    random.shuffle(participants)

    for i in range(0, len(participants), 2):
        if i + 1 < len(participants):
            Match.objects.create(
                tournament=tournament,
                player_one=participants[i],
                player_two=participants[i + 1],
            )

    serializer = TournamentSerializer(tournament)

    return Response({'message': 'tournament created', 'tournament': serializer.data}, status=201)


    
