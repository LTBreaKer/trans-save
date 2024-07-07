
from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # path('login/', views.loginView, name='login'),
    path('logout/', views.logoutView, name='logout'),
    path('register/', views.registerView, name='register'),
    path('user/', views.userView, name='user'),
    path('login_42/', views.login_42, name='login_42'),
    path('callback/', views.callback, name='callback'),
    path('update_user/', views.update_user, name='update_user'),
    path('send_friend_request/', views.send_friend_request, name='send_friend_request'),
    path('accept_friend_request/', views.accept_friend_request, name='accept_friend_request'),
    path('get_friends/', views.get_friends, name='get_friends'),
    path('get_friend_requests/', views.get_friend_requests, name='get_friend_requests'),
    path('deny_friend_request/', views.deny_friend_request, name='deny_friend_request'),
    path('delete_friend/', views.delete_friend, name='delete_friend'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]