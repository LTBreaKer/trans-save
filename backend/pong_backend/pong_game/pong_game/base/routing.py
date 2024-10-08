from django.urls import re_path

# from .player_consumer import PlayerConsumer
# from .game_consumer import GameConsumer
from .consumers import LocalGameConsumer
from .player_consumer import PlayerConsumer
from .game_consumer import GameConsumer
from django.urls import path

websocket_urlpatterns = [
    # re_path(r"ws/game/(?P<room_name>\w+)/$", PlayerConsumer.as_asgi()),
    # re_path(r"ws/game/(?P<room_name>\w+)/$", GameConsumer.as_asgi()),
    path('ws/local_pong_game/', LocalGameConsumer.as_asgi()),
    path('ws/paddle_pong_game/', PlayerConsumer.as_asgi()),
    path('ws/remote_pong_game/', GameConsumer.as_asgi()),
]