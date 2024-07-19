from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('create-game/', views.create_game, name='create-game'),
    path('get-game-history/', views.get_game_history, name='get-game-history'),
]
