from datetime import datetime, timedelta
from django.db import models
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D

class Resource(models.Model):
    def __str__(self):
        return f"Resource {self.id}"
    
    def get_last_location(self):
        return self.locations.first()
    
    def get_track(self):
        return self.locations.all()
    
    def add_location(self, coordinates):
        point = Point(
            x=coordinates['longitude'],
            y=coordinates['latitude']
        )

        self.locations.create(point=point)

    @classmethod
    def get_resources_nearby(cls, threshold, coordinates, radius):
        query_time = datetime.utcnow() - timedelta(seconds=threshold)
        latitude = coordinates.get('latitude')
        longitude = coordinates.get('longitude')
        point = Point(x=longitude, y=latitude)

        locations = Location.objects.filter(
            timestamp__gte=query_time,
            point__distance_lte=(point, D(m=radius))
        )

        resource_ids = locations.values_list('resource_id', flat=True)
        result_resources = [r.id for r in cls.objects.filter(id__in=resource_ids)]

        return result_resources

class Location(models.Model):
    point = gis_models.PointField()
    timestamp = models.DateTimeField(
        auto_now_add=True
    )
    resource = models.ForeignKey(
        to=Resource,
        related_name='locations',
        on_delete=models.CASCADE,
        db_index=True
    )

    def __str__(self):
        return f"{self.point} for resource {self.resource.id}"

    class Meta:
        ordering = ['-timestamp']