from django.urls import path
from .consumers import remoteGame

websocket_urlpatterns = [
    path('ws/game-db/', remoteGame.as_asgi(), name="ws/game-db")
]