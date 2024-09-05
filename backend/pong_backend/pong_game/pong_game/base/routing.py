from django.urls import re_path

# from .player_consumer import PlayerConsumer
# from .game_consumer import GameConsumer
from .consumers import GameConsumer
from django.urls import path

websocket_urlpatterns = [
    # re_path(r"ws/game/(?P<room_name>\w+)/$", PlayerConsumer.as_asgi()),
    # re_path(r"ws/game/(?P<room_name>\w+)/$", GameConsumer.as_asgi()),
    path('ws/pong_game/', GameConsumer.as_asgi()),
]