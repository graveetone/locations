from .serializers import LocationSerializer
from .models import Location
import json


def json_response(func):
    def wrapper(*args, **kwargs):
        response = func(*args, **kwargs)

        return response if type(response) is str else json.dumps(response)

    return wrapper


class ResourceController:
    def __init__(self, resource_id):
        if Location.objects.filter(resource_id=resource_id).count() < 1:
            raise Location.DoesNotExist

        self.resource_id = resource_id

    @json_response
    def get_location(self):
        last_location = Location.get_last_location(self.resource_id)
        return LocationSerializer(last_location).to_dict()

    @json_response
    def get_track(self, ):
        locations = Location.get_track(self.resource_id)
        return LocationSerializer(locations, many=True).to_dict()

    @json_response
    def add_location(self, **kwargs):
        Location.add_location(self.resource_id, **kwargs)
        return self.get_location()

    @json_response
    @staticmethod
    def handle_no_resource_found(resource_id):
        return {"error": "No resource with id {}".format(resource_id)}


class LocationController:
    @json_response
    def get_resources_nearby(self, payload):
        return Location.get_resources_nearby(**payload)
