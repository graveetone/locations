from .models import ResourceLocation, TableManager
from .serializers import LocationSerializer
from datetime import datetime, timedelta
from django.contrib.gis.geos import Point
import json
from django.contrib.gis.measure import D


class ResourcesService:
    def __init__(self, resource__id):
        self.resource_id = resource__id

    def get_location(self):
        with ResourceLocation(self.resource_id) as Location:
            location = Location.objects.first()

        return LocationSerializer(location).to_json()

    def get_track(self):
        with ResourceLocation(self.resource_id) as Location:
            locations = Location.objects.all()

        return LocationSerializer(locations, many=True).to_json()

    def add_location(self, **kwargs):
        coordinates = kwargs.get('coordinates')

        point = Point(
            x=coordinates['longitude'],
            y=coordinates['latitude']
        )

        with ResourceLocation(self.resource_id) as Location:
            Location.objects.create(
                point=point
            )


class LocationsService:
    def __init__(self):
        ...

    def get_resources_nearby(self, threshold, radius, coordinates):
        query_time = datetime.utcnow() - timedelta(seconds=threshold)
        latitude = coordinates.get('latitude')
        longitude = coordinates.get('longitude')

        resource_ids = TableManager.get_resource_ids()
        resources_nearby = []
        for id in resource_ids:
            # breakpoint()
            with ResourceLocation(id) as Location:
                locations = Location.objects.filter(
                    timestamp__gte=query_time,
                    point__distance_lte=(Point(x=longitude, y=latitude), D(m=radius))
                )

                if locations.count() > 0:
                    resources_nearby.append(id)

        return json.dumps(resources_nearby)
