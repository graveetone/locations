import json


class LocationSerializer:
    def __init__(self, serializable, many=False):
        self.serializable = serializable
        self.many = many

    def to_json(self):
        if self.many:
            return json.dumps([
                self.to_dict(obj)
                for obj in self.serializable
            ])

        return json.dumps(self.to_dict(self.serializable))

    def to_dict(self, object):
        # breakpoint()
        return {
            "id": object.id,
            # "coordinates": {
            #     "longitude": object.point['coordinates'][0],
            #     "latitude": object.point['coordinates'][1]
            # },
            "coordinates": {
                "longitude": object.point[0],
                "latitude": object.point[1]
            },
            "timestamp": str(object.timestamp)
        }
