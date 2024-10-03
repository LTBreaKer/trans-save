"""
ASGI config for game_db project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/howto/deployment/asgi/
"""

import os
import logging

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from base.api import routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game_db.settings')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info(f"Registered WebSocket URL patterns: {routing.websocket_urlpatterns}")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter(routing.websocket_urlpatterns),
})
