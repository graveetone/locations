from .models import Resource, Location
from .serializers import LocationSerializer
from datetime import datetime, timedelta
from django.contrib.gis.geos import Point
import json
from django.contrib.gis.measure import D




class ResourcesService:
    def __init__(self, resource__id):
        self.resource = Resource.objects.get(pk=resource__id)

    def get_location(self):
        if location := self.resource.locations.first():  # first should always be the last location by timestamp!
            return LocationSerializer(location).to_json()

    def get_track(self):
        locations = self.resource.locations.all()

        return LocationSerializer(locations, many=True).to_json()

    def add_location(self, **kwargs):
        coordinates = kwargs.get('coordinates')

        point = Point(
            x=coordinates['longitude'],
            y=coordinates['latitude']
        )

        self.resource.locations.create(
            point=point
        )


class LocationsService:
    def __init__(self):
        ...

    def get_resources_nearby(self, threshold, radius, coordinates):
        query_time = datetime.utcnow() - timedelta(seconds=threshold)
        latitude = coordinates.get('latitude')
        longitude = coordinates.get('longitude')

        locations = Location.objects.filter(
            timestamp__gte=query_time,
            point__distance_lte=(Point(x=latitude, y=longitude), D(m=radius))
        )

        resource_ids = locations.values_list('resource_id', flat=True)
        result_resources = [r.id for r in Resource.objects.filter(id__in=resource_ids)]

        return json.dumps(result_resources)
