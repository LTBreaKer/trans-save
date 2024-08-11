"""
ASGI config for user_management project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from base.api import routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'user_management.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket":URLRouter(routing.websocket_urlpatterns),
})