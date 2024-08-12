from django.urls import path
from .consumers import OnlineStatusConsumer, FriendRequestConsumer

websocket_urlpatterns = [
    path('ws/online-status/', OnlineStatusConsumer.as_asgi(), name="ws/online-status"),
    path('ws/friend-requests/', FriendRequestConsumer.as_asgi(), name='ws/friend-requests'),
]