from .serializers import LocationSerializer
from .models import ResourceLocation, TableManager
from datetime import datetime, timedelta
from django.contrib.gis.geos import Point
import json
from django.contrib.gis.measure import D


def json_response(func):
    def wrapper(*args, **kwargs):
        response = func(*args, **kwargs)

        return response if type(response) is str else json.dumps(response)

    return wrapper


class ResourceController:
    def __init__(self, resource_id):
        self.resource = ResourceLocation(resource_id).model

    @json_response
    def get_location(self):
        last_location = self.resource.objects.first()
        return LocationSerializer(last_location).to_dict()

    @json_response
    def get_track(self):
        locations = self.resource.objects.all()
        return LocationSerializer(locations, many=True).to_dict()

    @json_response
    def add_location(self, **kwargs):
        coordinates = kwargs.get('coordinates')

        point = Point(
            x=coordinates['longitude'],
            y=coordinates['latitude']
        )

        self.resource.objects.create(point=point)
        return self.get_location()

    @json_response
    @staticmethod
    def handle_no_resource_found(resource_id):
        return {"error": "No resource with id {}".format(resource_id)}


class LocationController:
    @json_response
    def get_resources_nearby(self, threshold, radius, coordinates):
        query_time = datetime.utcnow() - timedelta(seconds=threshold)
        latitude = coordinates.get('latitude')
        longitude = coordinates.get('longitude')

        resource_ids = TableManager.get_resource_ids()
        resources_nearby = []
        for id in resource_ids:
            with ResourceLocation(id) as Location:
                locations = Location.objects.filter(
                    timestamp__gte=query_time,
                    point__distance_lte=(
                        Point(x=longitude, y=latitude), D(m=radius))
                )

                if locations.count() > 0:
                    resources_nearby.append(id)

        return resources_nearby
