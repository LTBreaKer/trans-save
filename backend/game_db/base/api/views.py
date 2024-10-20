from django.db.models import Q
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view
from base.models import GameDb
from base.serializers import GameDbSerialiser
from .helpers import check_auth, get_user, is_user_authenticated
import base.global_vars as global_vars
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

game_queue = global_vars.game_queue

def check_user_availablity(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return {
            'is_available': False,
            'res': Response(data=auth_check_response.json(), status=auth_check_response.status_code)
            }
    user_data = auth_check_response.json()['user_data']
    player_id = user_data['id']
    username = user_data['username']
    avatar = user_data['avatar']
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
        'username': username,
        'avatar': avatar
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
    print(user_availablity['avatar'])
    serializer = GameDbSerialiser(data={
            'player1_id': user_availablity['player_id'],
            'player2_id': -1,
            'is_remote': False,
            'player2_name': player2_name,
            'player1_name': user_availablity['username'],
            'player1_avatar': user_availablity['avatar'],
        })
    if serializer.is_valid():
        instance = serializer.save()
        return Response({
                'message': 'game created',
                'game_id': instance.id,
                'player1_name': instance.player1_name,
                'player2_name': player2_name,
            },
            status=201
            )
    return Response({'message': serializer.errors}, status=400)

@api_view(['POST'])
def create_remote_game(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    user_availablity = check_user_availablity(request)
    if not user_availablity['is_available']:
        return user_availablity['res']
    player_id = user_availablity['player_id']
    game_queue.append(player_id)
    if len(game_queue) >= 2:
        player1_id = game_queue.pop()
        player2_id = game_queue.pop()
        player2_data = get_user(user_id=player2_id, auth_header=AUTH_HEADER, session_id=session_id).json()

        player1_avatar = user_availablity['avatar']
        player2_avatar = player2_data['user_data']['avatar']
        player1_name = user_availablity['username']
        player2_name = player2_data['user_data']['username']

        serializer = GameDbSerialiser(data={
            'player1_id': player1_id,
            'player2_id': player2_id,
            'player1_avatar': player1_avatar,
            'player2_avatar': player2_avatar,
            'player1_name': player1_name,
            'player2_name': player2_name,
            })
        if serializer.is_valid():
            instance = serializer.save()
            channel_layer = get_channel_layer()
            player2_data = get_user(user_id=player2_id, auth_header=AUTH_HEADER, session_id=session_id).json()
            async_to_sync(channel_layer.group_send)(
                f"player_{player1_id}",
                {
                    "type": "remote_game_created",
                    "game": {
                        "id": instance.id,
                        "player1_id": player1_id,
                        "player2_id": player2_id,
                        "player1_name": user_availablity['username'],
                        "player2_name": player2_data['user_data']['username']
                    }
                }
            )
            async_to_sync(channel_layer.group_send)(
                f"player_{player2_id}",
                {
                    "type": "remote_game_created",
                    "game": {
                        "id": instance.id,
                        "player1_id": player1_id,
                        "player2_id": player2_id,
                        "player1_name": user_availablity['username'],
                        "player2_name": player2_data['user_data']['username']
                    }
                }
            )
            return Response({
                    'message': 'game created',
                    'game_data': {
                        'id': instance.id,
                        'player1_id': instance.player1_id,
                        'player2_id': instance.player2_id,
                        'player1_name': instance.player1_name,
                        'player2_name': instance.player2_name
                    }},
                    status=201
                )
        else:
            return Response({'message': serializer.errors}, status=400)
    else:
        return Response({'message': 'waiting for second player to join'}, status=200)
    
@api_view(['POST'])
def cancel_remote_game_creation(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
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
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    game_id = request.data.get('game_id')
    if not game_id:
        return Response({'message': 'game_id required'}, status=400)
    try:
        game = GameDb.objects.get(id=game_id, is_active=True)
    except GameDb.DoesNotExist:
        return Response({'message': 'no active game found between the two provided players'}, status=404)
    if not game.is_remote:
        player1_name = request.data.get('player1_name')
        player2_name = request.data.get('player2_name')
        player1_score = request.data.get('player1_score')
        player2_score = request.data.get('player2_score')
        if not player1_name or not player2_name or not player1_score or not player2_score:
            return Response({'message': 'player1_name , player2_name, player1_score and player2_score are required'}, status=400)
        player_names = [game.player1_name, game.player2_name]
        if player1_name not in player_names or player2_name not in player_names:
            return Response({'message': 'invalid player names'}, status=400)
        game.player1_score = player1_score if game.player1_name == player1_name else player2_score
        game.player2_score = player2_score if game.player2_name == player2_name else player1_score
    else:
        player1_id = request.data.get('player1_id')
        player2_id = request.data.get('player2_id')
        player1_score = request.data.get('player1_score')
        player2_score = request.data.get('player2_score')
        if not player1_id or not player2_id or not player1_score or not player2_score:
            return Response({'message': 'player1_id , player2_id, player1_score and player2_score are required'}, status=400)
        player1_id = int(player1_id)
        player2_id = int(player2_id)
        player_ids = [game.player1_id, game.player2_id]
        if player1_id not in player_ids or player2_id not in player_ids:
            return Response({'message': 'invalid player ids'}, status=400)
        game.player1_score = player1_score if game.player1_id == player1_id else player2_score
        game.player2_score = player2_score if game.player2_id == player2_id else player1_score
    game.is_active = False
    game.save()
    return Response({'message': 'game score added'}, status=200)

@api_view(['GET'])
def get_game_history(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    user_id = auth_check_response.json()['user_data']['id']
    games = GameDb.objects.filter(Q(player1_id=user_id) | Q(player2_id=user_id), is_active=False)
    serializer = GameDbSerialiser(games, many=True)
    return Response({'games': serializer.data}, status=200)

@api_view(['POST'])
def get_game_history_by_username(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status = auth_check_response.status_code)
    username = request.data.get('username')
    if not username:
        return Response(data={'message': 'username is required'}, status=400)
    games = GameDb.objects.filter(
        Q(is_active=False) & (
            (Q(is_remote=True) & (Q(player1_name=username) | Q(player2_name=username))) |
            (Q(is_remote=False) & Q(player1_name=username))
        )
    )
    serializer = GameDbSerialiser(games, many=True)
    return Response({'games': serializer.data}, status=200)
    

@api_view(['GET'])
def is_available(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    id = request.data.get('id')
    if GameDb.objects.filter(
        Q(player1_id=id) | Q(player2_id=id),
        is_active=True
    ).exists():
        return {
            'is_available': False,
            'res': Response({'message': 'player is already in a game'}, status=400)
            }
    if id in game_queue:
        return {
            'is_available': False,
            'res': Response({'message': 'player already in queue'}, status=400)
            }
    return Response({'message': 'user is available'}, status=200)