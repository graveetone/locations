import json
from channels.generic.websocket import WebsocketConsumer

class ResourceConsumer(WebsocketConsumer):
    def connect(self):
        self.resource_id = self.scope['url_route']['kwargs']['id']

        print(self.resource_id)
        self.resource_mock = []

        self.accept()

    def disconnect(self, *args, **kwargs):
        ...

    def receive(self, text_data):
        payload = json.loads(text_data)

        print(payload)

        action = payload['action']

        def handle_get_location():
            self.send((self.resource_mock and json.dumps(self.resource_mock[-1])) or f'ERROR: where is this fucking resource with id {self.resource_id}?')

        def handle_get_track():
            self.send(json.dumps(self.resource_mock))

        def handle_add_location(**kwargs):
            longitude = kwargs.get('longitude')
            latitude = kwargs.get('latitude')

            timestamp = kwargs.get('timestamp', 'now')

            if longitude and latitude:
                self.resource_mock.append(
                    {
                        'latitude': latitude,
                        'longitude': longitude,
                        'timestamp': timestamp
                    }
                )

                handle_get_location()
            else:
                self.send('ERROR: no longitude or latitude!')

        match action:
            case 'get-location':
                handle_get_location()
            case 'get-track':
                handle_get_track()
            case 'add-location':
                handle_add_location(**payload)

class LocationConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, *args, **kwargs):
        print(args)
        print(kwargs)
        ...

    def receive(self, text_data):
        payload = json.loads(text_data)

        time_interval = payload.get('time_interval')
        radius = payload.get('radius')
        latitude = payload.get('latitude')
        longitude = payload.get('longitude')

        if all([time_interval, radius, latitude, longitude]):
            self.send(json.dumps([
                1, 4, 3
            ]))
        else:
            self.send('ERROR 400: no time_interval or radius or lat or lon!')
