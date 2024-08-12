from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenBlacklistView
)

urlpatterns = [
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('register/', views.registerView, name='register-user'),
    path('logout/', views.LogoutView.as_view(), name='logout-user'),
    path('login-42/', views.login_42, name='login-42'),
    path('callback-42/', views.callback_42, name='callback-42'),
    path('verify-token/', views.verify_token, name='verify-token'),
    path('get-user/', views.get_user, name='get-user'),
    path('get-user-by-id/', views.get_user_by_id, name='get-user-by-id'),
    path('get-user-by-username/', views.get_user_by_username, name='get-user-by-username'),
    path('update-user/', views.update_user, name='update-user'),
    path('verify-otp/', views.verifyOtpView, name='verify-otp'),
    path('resend-otp/', views.resendOtpView, name='resend-otp'),
    path('test-token/', views.test_token, name='test-token'),
]