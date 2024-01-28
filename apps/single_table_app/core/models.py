from django.db import models
from django.contrib.gis.db import models as gis_models
from datetime import datetime, timedelta
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.contrib.gis.db.models import Index

class Location(models.Model):
    resource_id = models.IntegerField(db_index=True)

    point = gis_models.PointField()
    timestamp = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )

    def __str__(self):
        return f"{self.point} for resource {self.resource_id}"

    class Meta:
        ordering = ['-timestamp']
        indexes = [Index(fields=['point'])]

    @classmethod
    def get_last_location(cls, resource_id):
        return cls.objects.filter(resource_id=resource_id).first()

    @classmethod
    def get_track(cls, resource_id):
        return cls.objects.filter(resource_id=resource_id).all()

    @classmethod
    def add_location(cls, resource_id, **kwargs):
        coordinates = kwargs.get('coordinates')

        point = Point(
            x=coordinates['longitude'],
            y=coordinates['latitude']
        )

        cls.objects.create(
            point=point,
            resource_id=resource_id
        )

    @classmethod
    def get_resources_nearby(cls, threshold, radius, coordinates):
        query_time = datetime.utcnow() - timedelta(seconds=threshold)
        longitude = coordinates.get('longitude')
        latitude = coordinates.get('latitude')

        locations = cls.objects.filter(
            timestamp__gte=query_time).filter(
                point__distance_lte=(Point(x=longitude, y=latitude), D(m=radius))
        )

        resources_nearby = list(set(locations.values_list("resource_id", flat=True)))
        return resources_nearby
