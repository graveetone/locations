from .models import Resource, Location
from .serializers import LocationSerializer
from datetime import datetime, timedelta
from django.contrib.gis.geos import Point
import json
from django.contrib.gis.measure import D




class ResourcesService:
    def __init__(self, resource_id):
        self.resource = Resource.objects.get(resource_id=resource_id)

    def get_location(self):
        if locations := self.resource.locations:  # [0] should always be the last location by timestamp!
            return LocationSerializer(locations[0]).to_json()

    def get_track(self):
        locations = self.resource.locations

        return LocationSerializer(locations, many=True).to_json()

    def add_location(self, **kwargs):
        coordinates = kwargs.get('coordinates')

        point = [
            coordinates['longitude'],
            coordinates['latitude']
        ]

        self.resource.add_location(point)


class LocationsService:
    def __init__(self):
        ...

    def get_resources_nearby(self, threshold, radius, coordinates):
        found_resources = Resource.get_resources_near_point(
            point=[coordinates['longitude'], coordinates['latitude']],
            radius=radius,
            seconds=threshold
        ).all()

        resource_ids = found_resources.values_list('resource_id')
        result_resources = [r.resource_id for r in Resource.objects.filter(resource_id__in=resource_ids)]

        return json.dumps(list(result_resources))
