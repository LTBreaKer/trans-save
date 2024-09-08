from django.urls import path
from . import views

urlpatterns = [
    path('create-tournament/', views.create_tournament),
    path('start-match/', views.start_match),
]
