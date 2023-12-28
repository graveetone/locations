from .models import Location
from .serializers import LocationSerializer
from datetime import datetime, timedelta
from django.contrib.gis.geos import Point
import json
from django.contrib.gis.measure import D


class ResourcesService:
    def __init__(self, resource_id):
        self.resource_id = resource_id

    def get_location(self):
        # first should always be the last location by timestamp!
        if location := Location.objects.filter(resource_id=self.resource_id).first():
            return LocationSerializer(location).to_json()

    def get_track(self):
        locations = Location.objects.filter(resource_id=self.resource_id).all()

        return LocationSerializer(locations, many=True).to_json()

    def add_location(self, **kwargs):
        coordinates = kwargs.get('coordinates')

        point = Point(
            x=coordinates['longitude'],
            y=coordinates['latitude']
        )

        Location.objects.create(
            point=point,
            resource_id=self.resource_id
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
            point__distance_lte=(Point(x=longitude, y=latitude), D(m=radius))
        )

        result_resources = [location.resource_id for location in locations]

        return json.dumps(result_resources)
