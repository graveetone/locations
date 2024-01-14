import json


class LocationSerializer:
    def __init__(self, serializable, many=False):
        self.serializable = serializable
        self.many = many

    def to_dict(self):
        if self.many:
            return json.dumps([
                self._to_dict(obj)
                for obj in self.serializable
            ])

        return json.dumps(self._to_dict(self.serializable))

    def _to_dict(self, object):
        return {
            "id": str(object.id),
            "coordinates": {
                "longitude": object.point['coordinates'][0],
                "latitude": object.point['coordinates'][1]
            },
            "timestamp": str(object.timestamp)
        }
