from django.urls import path
from .consumers import RemoteGame

websocket_urlpatterns = [
    path('ws/tag-game-db/', RemoteGame.as_asgi(), name="ws/tag-game-db")
]