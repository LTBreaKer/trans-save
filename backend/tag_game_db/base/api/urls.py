from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('create-remote-game/', views.create_remote_game, name='create-remote-game'),
    path('get-game-history/', views.get_game_history, name='get-game-history'),
    path('create-local-game/', views.create_local_game, name='create-local-game'),
    path('cancel-remote-game-creation/', views.cancel_remote_game_creation, name='cancel-remote-game-creation'),
    path('add-game-score/', views.add_game_score, name='add-game-score'),
    path('get-game-history/', views.get_game_history, name='get-game-history'),
    path('get-game-history-by-username/', views.get_game_history_by_username, name='get-game-history-by-username'),
    path('connect-game/', views.connect_game, name='connect-game'),
    path('delete-zombie-games/', views.remove_zombie_games, name='delete-zombie-games'),
    path('update-username/', views.update_username, name='update-username'),
]
