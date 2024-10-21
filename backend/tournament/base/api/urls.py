from django.urls import path
from . import views

urlpatterns = [
    path('create-tournament/', views.create_tournament),
    path('start-match/', views.start_match),
    path('add-match-score/', views.add_match_score),
    path('get-next-stage/', views.get_next_stage),
    path('check-tournament/', views.check_tournament),
    path('get-tournament-history/', views.get_tournament_history),
    path('get-tournament-by-id/', views.get_tournament_by_id),
]
