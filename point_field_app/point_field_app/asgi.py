import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

from core.urls import websocket_urlpatterns

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "point_field_app.settings")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        'websocket': AllowedHostsOriginValidator(
            AuthMiddlewareStack(
                URLRouter(
                    websocket_urlpatterns
                )
            )
        )
    }
)
