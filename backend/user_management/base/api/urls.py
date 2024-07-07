from django.urls import path
from . import views

urlpatterns = [
    path('create_profile/', views.create_profile, name='create_profile'),
    path('send_friend_request/', views.sendFriendRequest, name='send_friend_request'),
    path('get_friend_requests/', views.get_friend_requests, name='get_friend_requests'),
    path('accept_friend_request/', views.accept_friend_request, name='accept_friend_request'),
]
