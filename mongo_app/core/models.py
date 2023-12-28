from mongoengine import (
    Document, ListField, EmbeddedDocument,
    PointField, DateTimeField,
    EmbeddedDocumentField, SequenceField, IntField
)
from datetime import datetime


class Location(EmbeddedDocument):
    id = SequenceField()
    point = PointField(required=True)
    timestamp = DateTimeField(default=datetime.utcnow)
    resource_id = IntField(required=True)
    


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
