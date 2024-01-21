from .serializers import LocationSerializer
from .models import Resource
import json


def json_response(func):
    def wrapper(*args, **kwargs):
        response = func(*args, **kwargs)

        return response if type(response) is str else json.dumps(response)

    return wrapper


class ResourceController:
    def __init__(self, resource_id):
        self.resource = Resource.objects.get(resource_id=resource_id)

    @json_response
    def get_location(self):
        last_location = self.resource.get_last_location()
        return LocationSerializer(last_location).to_dict()

    @json_response
    def get_track(self):
        locations = self.resource.get_track()
        return LocationSerializer(locations, many=True).to_dict()

    @json_response
    def add_location(self, **kwargs):
        coordinates = kwargs.get('coordinates')

        point = [
            coordinates['longitude'],
            coordinates['latitude']
        ]

        self.resource.add_location(point)
        return self.get_location()

    @json_response
    @staticmethod
    def handle_no_resource_found(resource_id):
        return {"error": "No resource with id {}".format(resource_id)}


class LocationController:
    @json_response
    def get_resources_nearby(self, payload):
        resources_nearby = Resource.get_resources_nearby(**payload)
        resource_ids = resources_nearby.values_list('resource_id')
        resources_nearby_ids = [r.resource_id for r in Resource.objects.filter(resource_id__in=resource_ids)]
        return resources_nearby_ids
