from django.urls import path
from . import views

urlpatterns = [
    path('create-profile/', views.create_profile, name='create-profile'),
    path('send-friend-request/', views.sendFriendRequest, name='send-friend-request'),
    path('get-friend-requests/', views.get_friend_requests, name='get-friend-requests'),
    path('accept-friend-request/', views.accept_friend_request, name='accept-friend-request'),
    path('deny-friend-request/', views.deny_friend_request, 'deny-friend-request'),
    path('remove-friend/', views.delete_friend, "remove-friend")
]
