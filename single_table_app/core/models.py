from django.db import models
from django.contrib.gis.db import models as gis_models


class Location(models.Model):
    resource_id = models.IntegerField()
    
    point = gis_models.PointField()
    timestamp = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.point} for resource {self.resource_id}"

    class Meta:
        ordering = ['-timestamp'] 