import json
from channels.generic.websocket import WebsocketConsumer

from .locations_service import ResourcesService, LocationsService
from .models import Location


class ResourceConsumer(WebsocketConsumer):
    def connect(self):
        self.resource_id = self.scope['url_route']['kwargs']['id']
        if not self.resource_id:
            return

        print(self.resource_id)
        self.accept()
        try:
            self.resource_service = ResourcesService(self.resource_id)
        except Location.DoesNotExist:
            self.send(json.dumps(
                {'error': f'No resource with id {self.resource_id}'}))
            self.close()

    def disconnect(self, *args, **kwargs):
        ...

    def receive(self, text_data):
        payload = json.loads(text_data)
        print(payload)
        action = payload.get('action')

        if not action:
            return

        def handle_get_location():
            self.send(self.resource_service.get_location())

        def handle_get_track():
            self.send(self.resource_service.get_track())

        def handle_add_location(**kwargs):
            self.resource_service.add_location(**kwargs)
            handle_get_location()

        match action:
            case 'get-location':
                handle_get_location()
            case 'get-track':
                handle_get_track()
            case 'add-location':
                handle_add_location(**payload)


class LocationConsumer(WebsocketConsumer):
    def connect(self):
        self.locations_service = LocationsService()
        self.accept()

    def disconnect(self, *args, **kwargs):
        ...

    def receive(self, text_data):
        payload = json.loads(text_data)

        resources = self.locations_service.get_resources_nearby(**payload)
        self.send(resources)


class PingConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.send('pong')
        self.close()
