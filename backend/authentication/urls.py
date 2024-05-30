
from django.urls import path
from .views import loginView, registerView, userView, logoutView, login_42, callback
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('login/', loginView, name='login'),
    path('logout/', logoutView, name='logout'),
    path('register/', registerView, name='register'),
    path('user/', userView, name='user'),
    path('login_42/', login_42, name='login_42'),
    path('callback/', callback, name='callback'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)