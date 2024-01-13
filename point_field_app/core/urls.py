from django.urls import re_path, path
from .views import LocationConsumer, ResourceConsumer

websocket_urlpatterns = [
    path("ws/locations/get-nearby-resources/", LocationConsumer.as_asgi()),
    re_path(r"ws/resources/(?P<id>\d+)/$", ResourceConsumer.as_asgi()),
]
