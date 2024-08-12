from base.models import UserProfile, FriendRequest
from rest_framework.response import Response
from rest_framework.decorators import api_view
from base.serializers import UserProfileSerializer, FriendRequestSerializer
from .helpers import check_auth, get_user
import json
import requests
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@api_view(['POST'])
def create_profile(request, *args, **kwargs):
    print(request.data)
    print('typeof', type(request.data.get('user_id')))
    serializer = UserProfileSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User profile created'}, status=201)
    return Response({'message':serializer.errors}, status=400)

@api_view(['POST'])
def sendFriendRequest(request, *args, **kwargs):
    response = check_auth(request.META.get('HTTP_AUTHORIZATION'))
    if response.status_code != 200:
        return Response(data=response.json(), status=response.status_code)
    from_user_data = response.json()['user_data']
    from_user_id = from_user_data['id']
    from_user_profile = UserProfile.objects.get(user_id = from_user_id)
    to_user_id = request.data.get('to_user_id')

    if not to_user_id:
        return Response({'message': 'to_user_id is required'}, status=400)
    
    response = get_user(to_user_id, request.META.get('HTTP_AUTHORIZATION'))

    if int(to_user_id) == int(from_user_id):
        return Response({'message': 'Cannot send friend request to self'}, status=400)
    
    if response.status_code != 200:
        return Response(data=response.json(), status=response.status_code)
    
    if from_user_profile.friends.filter(user_id=to_user_id).exists():
        return Response({'message': 'Already friends'}, status=400)
    
    if FriendRequest.objects.filter(from_user_id=from_user_id, to_user_id=to_user_id).exists():
        return Response({'message': 'Friend request already sent'}, status=400)
    
    if FriendRequest.objects.filter(from_user_id=to_user_id, to_user_id=from_user_id).exists():
        return Response({'message': 'Already have a pending friend request from this user'}, status=400)
    friend_request = FriendRequest.objects.create(from_user_id=from_user_id, to_user_id=to_user_id)

    channel_layer = get_channel_layer()
    
    async_to_sync(channel_layer.group_send)(
        f"friends_{to_user_id}",
        {
            "type": "friend_request_received",
            "friend_request": {
                "id": friend_request.id,
                "sender_data": from_user_data,
                "message": f"{from_user_data['username']} has sent you a friend request."
            }
        }
    )

    return Response(data={'message': 'Friend request sent'}, status=201)

@api_view(['GET'])
def get_friend_requests(request, *args, **kwargs):
    response = check_auth(request.META.get('HTTP_AUTHORIZATION'))
    if response.status_code != 200:
        return Response(data=response.json(), status=response.status_code)
    user_id = response.json()['user_data']['id']
    friend_requests = FriendRequest.objects.filter(to_user_id=user_id)
    print(friend_requests)
    serializer = FriendRequestSerializer(friend_requests, many=True)
    return Response(data=serializer.data, status=200)

@api_view(['POST'])
def accept_friend_request(request, *args, **kwargs):
    response = check_auth(request.META.get('HTTP_AUTHORIZATION'))
    if response.status_code != 200:
        return Response(response.json(), status=response.status_code)
    user_id = response.json()['user_data']['id']
    id = request.data.get('id')
    if not id:
        return Response({'message': 'id is required'}, status=400)
    
    try:
        friend_request = FriendRequest.objects.get(id=id)
    except FriendRequest.DoesNotExist:
        return Response({'message': 'Friend request not found'}, status=404)
    
    if friend_request.to_user_id != user_id:
        return Response({'message': 'Unauthorized'}, status=401)
    
    from_user_id = friend_request.from_user_id
    try:
        from_user_profile = UserProfile.objects.get(user_id=from_user_id)
    except UserProfile.DoesNotExist:
        return Response({'message': 'User no longer exists'}, status=404)
    
    user_profile = UserProfile.objects.get(user_id=user_id)
    user_profile.friends.add(from_user_profile)
    friend_request.delete()
    return Response({'message': 'Friend request accepted'}, status=200)
    
@api_view(['DELETE'])
def deny_friend_request(request, *args, **kwargs):
    response = check_auth(request.META.get('HTTP_AUTHORIZATION'))
    if response.status_code != 200:
        return Response(response.json(), status=response.status_code)
    user_id = response.json()['user_data']['id']
    id = request.data.get('id')
    if not id:
        return Response({'message': 'id is required'}, status=400)
    
    try:
        friend_request = FriendRequest.objects.get(id=id)
    except FriendRequest.DoesNotExist:
        return Response({'message': 'Friend request not found'}, status=404)
    
    if friend_request.to_user_id != user_id:
        return Response({'message': 'Unauthorized'}, status=401)
    
    friend_request.delete()
    return Response({'message': 'Friend request denied'}, status=200)

@api_view(['DELETE'])
def delete_friend(request, *args, **kwargs):
    response = check_auth(request.META.get('HTTP_AUTHORIZATION'))
    if response.status_code != 200:
        return Response(response.json(), status=response.status_code)
    
    user_id = response.json()['user_data']['id']

    friend_id = request.data.get('friend_id')
    if not friend_id:
        return Response({'message': 'friend_id required'}, status=400)
    
    try:
        friend_profile = UserProfile.objects.get(user_id=friend_id)
    except UserProfile.DoesNotExist:
        return Response({'message': 'User no longer exists'}, status=404)
    
    user_profile = UserProfile.objects.get(user_id=user_id)
    if not user_profile.friends.filter(user_id=friend_id).exists():
        return Response({'message': 'User not found in friend list'}, status=404)
    
    user_profile.friends.remove(friend_profile)
    return Response({'message': 'Friend removed'}, status=200)

@api_view(['GET'])
def get_friend_list(request):
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    response = check_auth(AUTH_HEADER)
    if response.status_code != 200:
        return Response(response.json(), status=response.status_code)
    
    user_id = response.json()['user_data']['id']

    user_profile = UserProfile.objects.get(user_id=user_id)

    friends = user_profile.friends.all()

    data = {
        'friend_list': {
            friend.id: get_user(friend.user_id, AUTH_HEADER).json()['user_data'] for friend in friends
        }
    }

    return Response(data, status=200)