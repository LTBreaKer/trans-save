from django.urls import path
from . import views

urlpatterns = [
    path('create-tournament/', views.create_tournament),
    path('start-match/', views.start_match),
    path('add-match-score/', views.add_match_score),
    path('get-next-stage/', views.get_next_stage)
]
