from django.urls import path
from .consumers import RemoteGame

websocket_urlpatterns = [
    path('ws/game-db/', RemoteGame.as_asgi(), name="ws/game-db")
]