from mongoengine import (
    Document, ListField, EmbeddedDocument,
    PointField, DateTimeField,
    EmbeddedDocumentField, SequenceField
)
from datetime import datetime


class Location(EmbeddedDocument):
    coordinates = PointField(required=True)
    timestamp = DateTimeField(default=datetime.utcnow)


class Resource(Document):
    resource_id = SequenceField()
    locations = ListField(EmbeddedDocumentField(Location))

    meta = {
        'indexes': [
            {
                'fields': [('locations.coordinates', '2dsphere')]
            }
        ]
    }
