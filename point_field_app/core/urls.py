from django.urls import re_path, path
from .views import LocationConsumer, ResourceConsumer

websocket_urlpatterns = [
    path("ws/location/get-nearby-resources/", LocationConsumer.as_asgi()),
    re_path(r"ws/resource/(?P<id>\d+)/$", ResourceConsumer.as_asgi()),
]
