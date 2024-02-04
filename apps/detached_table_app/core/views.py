import json
from channels.generic.websocket import WebsocketConsumer

from .controllers import LocationController, ResourceController
from .models import DoesNotExist


class ResourceConsumer(WebsocketConsumer):
    def connect(self):
        self.resource_id = int(self.scope['url_route']['kwargs']['id'])
        self.accept()
        try:
            self.controller = ResourceController(self.resource_id)
        except DoesNotExist:
            response = ResourceController.handle_no_resource_found(
                self.resource_id)
            self.send(response)
            self.close()

    def disconnect(self, *args, **kwargs):
        ...

    def receive(self, text_data):
        payload = json.loads(text_data)
        action = payload.pop('action')

        if not action:
            return

        match action:
            case 'get-location':
                response = self.controller.get_location()
            case 'get-track':
                response = self.controller.get_track()
            case 'add-location':
                response = self.controller.add_location(**payload)

        self.send(response)


class LocationConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.controller = LocationController()

    def disconnect(self, *args, **kwargs): ...

    def receive(self, text_data):
        payload = json.loads(text_data)
        response = self.controller.get_resources_nearby(**payload)
        self.send(response)


class PingConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.send('pong')
        self.close()
