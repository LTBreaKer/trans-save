from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('create-game/', views.create_game, name='create-game'),
]