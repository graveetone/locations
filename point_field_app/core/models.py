from django.db import models
from django.contrib.gis.db import models as gis_models


class Resource(models.Model):
    def __str__(self):
        return f"Resource {self.id}"


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