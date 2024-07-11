from django.db.models import Q
from rest_framework.response import Response
from rest_framework.decorators import api_view
from base.models import GameDb
from base.serializers import GameDbSerialiser
from .helpers import check_auth, get_user

@api_view(['POST'])
def create_game(request, *args, **kwargs):
    response = check_auth(request.META.get('HTTPS_AUTHORIZATION'))
    if response.status_code != 200:
        return Response(data=response.json(), status=response.status_code)
    player1_id = request.data.get('player1_id')
    player2_id = request.data.get('player2_id')
    response = get_user(player1_id, request.META.get('HTTPS_AUTHORIZATION'))
    if response.status_code != 200:
        return Response(data=response.json(), status=response.status_code)
    response = get_user(player2_id, request.META.get('HTTPS_AUTHORIZATION'))
    if response.status_code != 200:
        return Response(data=response.json(), status=response.status_code)
    if GameDb.objects.filter(
        Q(player1_id=player1_id) | Q(player2_id=player1_id),
        is_active=True
    ).exists():
        return Response({'message': 'player1 is already in a game'}, status=400)
    if GameDb.objects.filter(
        Q(player1_id=player2_id) | Q(player2_id=player2_id),
        is_active=True
    ).exists():
        return Response({'message': 'player2 is already in a game'}, status=400)
    serializer = GameDbSerialiser(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'game created'}, status=200)
    else:
        return Response({'message': 'invalid data'}, status=400)
    