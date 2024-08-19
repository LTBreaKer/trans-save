from django.db.models import Q
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view
from base.models import GameDb
from base.serializers import GameDbSerialiser
from .helpers import check_auth, get_user_info, is_user_authenticated
import base.global_vars as global_vars

game_queue = global_vars.game_queue

def check_user_availablity(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    auth_check_response = check_auth(AUTH_HEADER)
    if auth_check_response.status_code != 200:
        return {
            'is_available': False,
            'res': Response(data=auth_check_response.json(), status=auth_check_response.status_code)
            }
    user_data = auth_check_response.json()['user_data']
    player_id = user_data['id']

    if GameDb.objects.filter(
        Q(player1_id=player_id) | Q(player2_id=player_id),
        is_active=True
    ).exists():
        return {
            'is_available': False,
            'res': Response({'message': 'player is already in a game'}, status=400)
            }
    if player_id in game_queue:
        return {
            'is_available': False,
            'res': Response({'message': 'player already in queue'}, status=400)
            }
    return {
        'is_available' : True,
        'res': None,
        'player_id': player_id,
        }

@api_view(['POST'])
def create_local_game(request):
    user_availablity = check_user_availablity(request)
    if not user_availablity['is_available']:
        return user_availablity['res']
    if user_availablity['player_id'] in game_queue:
        return Response({'message': 'can\'t create a game while in game queue'}, status=400)
    player2_name = request.data.get('player2_name')
    if not player2_name:
        return Response({'message': 'player2_name required'}, status=400)
    serializer = GameDbSerialiser(data={'player1_id': -1, 'player2_id': -1, 'is_remote': False, 'player2_name': player2_name})
    if serializer.is_valid():
        serializer.save()
        return Response({
                'message': 'game created',
                'player2_name': player2_name,
            },
            status=201
            )

@api_view(['POST'])
def create_remote_game(request):
    user_availablity = check_user_availablity(request)
    if not user_availablity['is_available']:
        return user_availablity['res']
    player_id = user_availablity['player_id']
    game_queue.append(player_id)
    if len(game_queue) >= 2:
        player1_id = game_queue.pop()
        player2_id = game_queue.pop()
        serializer = GameDbSerialiser(data={'player1_id': player1_id, 'player2_id': player2_id})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'game created',
                            'player1_id': player1_id,
                            'player2_id': player2_id},
                            status=201
                    )
        else:
            return Response({'message': 'invalid data'}, status=400)
    else:
        return Response({'message': 'waiting for second player to join'}, status=200)
    
@api_view(['POST'])
def cancel_remote_game_creation(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    auth_check_response = check_auth(AUTH_HEADER)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    player_id = auth_check_response.json()['user_data']['id']
    if player_id not in game_queue:
        return Response({'message': 'player not in game queue'}, status=400)
    else:
        game_queue.remove(player_id)
        return Response({'message': 'player removed from game queue'}, status=200)
    
@api_view(['POST'])
def add_game_score(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    auth_check_response = check_auth(AUTH_HEADER)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    game_id = request.data.get('game_id')
    player1_id = request.data.get('player1_id')
    player2_id = request.data.get('player2_id')
    player1_score = request.data.get('player1_score')
    player2_score = request.data.get('player2_score')
    if not game_id or not player1_id or not player2_id or not player1_score or not player2_score:
        return Response({'message': 'invalid data'}, status=400)
    try:
        game = GameDb.objects.get(id=game_id, is_active=True)
    except GameDb.DoesNotExist:
        return Response({'message': 'no active game found between the two provided players'}, status=404)
    players_ids = [game.player1_id, game.player2_id]
    if player1_id not in players_ids or player2_id not in players_ids:
        return Response({'message': 'invalid player id'}, status=400)
    game.player1_score = player1_score if game.player1_id == player1_id else player2_score
    game.player2_score = player2_score if game.player2_id == player2_id else player1_score
    game.is_active = False
    game.save()
    return Response({'message': 'game score added'}, status=200)

@api_view(['GET'])
def get_game_history(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    auth_check_response = check_auth(AUTH_HEADER)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    user_id = auth_check_response.json()['user_data']['id']
    games = GameDb.objects.filter(Q(player1_id=user_id) | Q(player2_id=user_id), is_active=False)
    serializer = GameDbSerialiser(games, many=True)
    return Response({serializer.data}, status=200)
    