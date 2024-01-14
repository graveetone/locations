from mongoengine import (Document, EmbeddedDocument, PointField, DateTimeField,
                         EmbeddedDocumentField, SequenceField, IntField, SortedListField, ObjectIdField, Q)
from bson.objectid import ObjectId
from datetime import datetime, timedelta


class Location(EmbeddedDocument):
    id = ObjectIdField(required=True, default=ObjectId)
    point = PointField(required=True)
    resource_id = IntField()
    timestamp = DateTimeField(default=datetime.utcnow)


class Resource(Document):
    resource_id = SequenceField()
    locations = SortedListField(EmbeddedDocumentField(Location),
                                ordering="timestamp", reverse=True)
    meta = {
        'indexes': [
            {
                'fields': [('locations.point', '2dsphere')],
                'sparse': False,
            }
        ]
    }

    def add_location(self, point):
        self.add_locations([point])

    def add_locations(self, points):
        locations = [Location(point=point, resource_id=self.resource_id)
                     for point in points]
        self.locations.extend(locations)
        self.save().reload()

    def get_last_location(self):
        return self.locations[0] if self.locations else []

    def get_track(self):
        return self.locations

    @classmethod
    def get_resources_nearby(cls, threshold, coordinates, radius):
        query_time = datetime.utcnow() - timedelta(seconds=threshold)
        latitude = coordinates.get('latitude')
        longitude = coordinates.get('longitude')
        point = [longitude, latitude]

        timestamp_condition = Q(locations__timestamp__gte=query_time)

        location_within_radius = Q(locations__point__near=point,
                                   locations__point__max_distance=radius)  # meters

        query = timestamp_condition & location_within_radius
        resources_nearby = Resource.objects(query).all()

        return resources_nearby
