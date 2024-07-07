from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenBlacklistView
)

urlpatterns = [
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.registerView, name='register_user'),
    path('logout/', views.LogoutView.as_view(), name='logout_user'),
    path('login_42/', views.login_42, name='login_42'),
    path('callback_42/', views.callback_42, name='callback_42'),
    path('verify_token/', views.verify_token, name='verify_token'),
    path('get_user/', views.get_user, name='get_user'),
    path('get_user_by_id/', views.get_user_by_id, name='get_user_by_id'),
    path('update_user/', views.update_user, name='update_user'),
    path('verify_otp/', views.verifyOtpView, name='verify_otp'),
    path('resend_otp/', views.resendOtpView, name='resend_otp'),
]