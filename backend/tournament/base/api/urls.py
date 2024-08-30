from django.urls import path
from . import views

urlpatterns = [
    path('create-tournament/', views.create_tournament)
]
