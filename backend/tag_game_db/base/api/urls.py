from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('create-remote-game/', views.create_remote_game, name='create-remote-game'),
    path('get-game-history/', views.get_game_history, name='get-game-history'),
]
