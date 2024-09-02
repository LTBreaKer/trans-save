from base.models import Tournament, TournamentParticipant, Match
from base.serializers import TournamentSerializer, TournamentParticipantSerializer, MatchSrializer
from rest_framework.decorators import api_view
from .helpers import check_auth, get_user_info
from rest_framework.response import Response
import random
import requests

@api_view(['POST'])
def create_tournament(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    auth_check_response = check_auth(AUTH_HEADER)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    # check if user is not in a game
    response = requests.get('https://server:9006/api/gamedb/is-available/', headers={'AUTHORIZATION': AUTH_HEADER}, verify=False)
    if response.status_code != 200:
        return Response({'message': 'user not available to create tournament'}, status=400)

    creator_id = auth_check_response.json()['user_data']['id']

    participants = request.data.get('participants', [])
    print("participants", participants)
    if not participants or not isinstance(participants, list):
        return Response({'message': 'participants must be provided as a list'}, status=400)
    
    print(len(participants))
    if not len(participants) == 8:
        return Response({'message': 'unvalid number of participants, valid number is 8'}, status=400)

    if len(participants) != len(set(participants)):
        return Response({'message': 'Cannot creat tournament with duplicate usernames'}, status=400)
    tournament = Tournament.objects.create(creator_id=creator_id)

    web3 = request.web3

    for username in participants:
        try:
            participant =  TournamentParticipant(tournament=tournament, username=username)
            participant.full_clean()
            participant.save()
        except Exception as e:
            return Response({'message' : e}, status=400)

    participants = list(tournament.participants.all())
    random.shuffle(participants)

    for i in range(0, len(participants), 2):
        if i + 1 < len(participants):
            Match.objects.create(
                tournament=tournament,
                match_number=i // 2 + 1,
                player_one=participants[i],
                player_two=participants[i + 1],
            )

    serializer = TournamentSerializer(tournament)

    return Response({'message': 'tournament created', 'tournament': serializer.data}, status=201)

@api_view(['POST'])
def start_match(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    auth_check_response = check_auth(AUTH_HEADER)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    match_number = request.data.get('match_number')
    tournament_id = request.data.get('tournament_id')

    if not match_number or not tournament_id:
        return Response({'message': 'match_id and tournament_id required'}, status=400)
    
    try:
        tournament = Tournament.objects.get(id=tournament_id)
    except Exception:
        return Response({'message': 'tournament not found'}, status=404)
    
    try:
        match = tournament.matches.get(match_number=match_number)
    except Exception:
        return Response({'message': 'match not found'}, status=404)

    match.status = 'ongoing'
    match.save()

    return Response({'message': 'message ongoing'}, status=200)


@api_view(['POST'])
def add_match_score(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    auth_check_response = check_auth(AUTH_HEADER)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    match_number = request.data.get('match_number')
    tournament_id = request.data.get('tournament_id')
    player_one_score = request.data.get('player_one_score')
    player_two_score = request.data.get('player_two_score')

    if not match_number or not tournament_id or not player_one_score or not player_two_score:
        return Response({'message': 'match_id, tournament_id required, player_one_score and player_two_score'}, status=400)
    
    try:
        tournament = Tournament.objects.get(id=tournament_id)
    except Tournament.DoesNotExist:
        return Response({'message': 'tournament not found'}, status=404)

    try:
        match = tournament.matches.get(match_number=match_number)
    except Exception:
        return Response({'message': 'match not found'}, status=404)
    
    match.player_one_score = player_one_score
    match.player_two_score = player_two_score

    match.winner = match.player_one if player_one_score > player_two_score else match.player_two
    match.status = 'complete'
    match.save()

    if match.stage == '1/4':
        matches = list(tournament.matches.filter(status='complete'))
    elif match.stage == '1/2':
                matches = list(tournament.matches.filter(status='complete'), stage='1/2')
    
    if len(matches) == 4 and match.stage == '1/4' or len(matches) == 2 and match.stage == '1/2':
        for i in range(0, len(matches), 2):
            if i + 1 != len(matches):
                first_winner = matches[i].winner
                second_winner = matches[i+1].winner
                Match.objects.create(
                    tournament=tournament,
                    match_number=4 + i // 2 + 1,
                    player_one=first_winner,
                    player_two=second_winner,
                    stage='1/2' if match.stage == '1/4' else '1/1'
                )