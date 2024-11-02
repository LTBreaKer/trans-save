from django.db.models import Q
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view
from base.models import TagGameDb
from base.serializers import TagGameDbSerialiser
from .helpers import check_auth, get_user_info, is_user_authenticated, get_user
import base.global_vars as global_vars
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from base.validators import CustomUsernameValidator
from django.core.exceptions import ValidationError


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

    if TagGameDb.objects.filter(
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
        'avatar': avatar,
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

    validator = CustomUsernameValidator()
    try:
        validator(player2_name)
    except ValidationError:
        return Response({'message': 'Invalid player name'}, status=400)
    if len(player2_name) > 9:
        return Response({'message': 'Invalid player name'}, status=400)
        
    serializer = TagGameDbSerialiser(data={
            'player1_name': user_availablity['username'],
            'player2_name': player2_name,
            'is_remote': False,
            'player1_id': user_availablity['player_id'],
            'player2_id': -1,
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

        serializer = TagGameDbSerialiser(data={
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
                        "player1_id": instance.player1_id,
                        "player2_id": instance.player2_id,
                        "player1_name": instance.player1_name,
                        "player2_name": instance.player2_name,
                    }
                }
            )
            async_to_sync(channel_layer.group_send)(
                f"player_{player2_id}",
                {
                    "type": "remote_game_created",
                    "game": {
                        "id": instance.id,
                        "player1_id": instance.player1_id,
                        "player2_id": instance.player2_id,
                        "player1_name": instance.player1_name,
                        "player2_name": instance.player2_name,
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
            return Response({'message': 'invalid data'}, status=400)
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
        game = TagGameDb.objects.get(id=game_id, is_active=True, is_connected=True)
    except TagGameDb.DoesNotExist:
        return Response({'message': 'no active game found with the provided game_id'}, status=404)
    if game.is_remote:
        winner_id = request.data.get('winner_id')
        if not winner_id:
            return Response({'message': 'winner_id required'}, status=400)
        winner_id = int(winner_id)
        if winner_id != game.player1_id and winner_id != game.player2_id:
            return Response({'message': 'no player in this game with the provided id'}, status=400)
        game.winner_id = winner_id
    else:
        winner_name = request.data.get('winner_name')
        if not winner_name:
            return Response({'message': 'winner_name required'}, status=400)
        if winner_name != game.player1_name and winner_name != game.player2_name and winner_name != "unknown":
            return Response({'message': 'no player in this game with the provided name'}, status=400)
        game.winner_name = winner_name
        
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
    games = TagGameDb.objects.filter(Q(player1_id=user_id) | Q(player2_id=user_id), is_active=False)
    serializer = TagGameDbSerialiser(games, many=True)
    return Response({'games' : serializer.data}, status=200)

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
    user_reponse = get_user(username=username, auth_header=AUTH_HEADER, session_id=session_id)
    if user_reponse.status_code != 200:
        return Response({'message': 'invalid username'}, status=400)
    user_id = user_reponse.json()['user_data']['id']
    games = TagGameDb.objects.filter(
        Q(is_active=False) & (
            (Q(is_remote=True) & (Q(player1_id=user_id) | Q(player2_id=user_id))) |
            (Q(is_remote=False) & Q(player1_id=user_id))
        )
    )
    serializer = TagGameDbSerialiser(games, many=True)
    return Response({'games': serializer.data}, status=200)

@api_view(['POST'])
def connect_game(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    game_id = request.data.get('game_id')
    if not game_id:
        return Response({'message': 'game_id is required'}, status=400)

    try:
        game = TagGameDb.objects.get(id=game_id, is_active=True, is_connected=False)
    except TagGameDb.DoesNotExist:
        return Response({'message': 'Can\'t connect game'}, status=400)

    game.is_connected = True
    game.save()
    return Response({'message': 'game connected'}, status=200)

@api_view(['DELETE'])
def remove_zombie_games(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    user_id = auth_check_response.json()['user_data']['id']

    games = TagGameDb.objects.filter(Q(player1_id=user_id) | Q(player2_id=user_id), is_active=True, is_connected=False)
    deleted_count, _ = games.delete()
    return Response({'message': f'deleted {deleted_count} zombie games'}, status=200)

@api_view(['POST'])
def update_username(request):
    import sys
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    id = auth_check_response.json()['user_data']['id']
    new_username = request.data.get('new_username')

    if not new_username:
        return Response({'message': 'new_username is required'}, status=400)
    print("new_username = ", new_username, file=sys.stderr)
    games = TagGameDb.objects.filter(
        Q(is_active=False) & (
            (Q(is_remote=True) & (Q(player1_id=id) | Q(player2_id=id))) |
            (Q(is_remote=False) & Q(player1_id=id))
        )
    )
    for game in games:
        if game.player1_id == id:
            game.player1_name = new_username
        elif game.player2_id == id:
            game.player2_name == new_username
        game.save()
    return Response({'message': 'ok'}, status=200)