
from django.urls import path
from .views import loginView, userView, logoutView, registerView, login_42, callback, update_user
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('login/', loginView, name='login'),
    path('logout/', logoutView, name='logout'),
    path('register/', registerView, name='register'),
    path('user/', userView, name='user'),
    path('login_42/', login_42, name='login_42'),
    path('callback/', callback, name='callback'),
    path('update_user/', update_user, name='update_user'),
]