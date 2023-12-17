import random
import os
from django.contrib.gis.geos import Point

import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "point_field_app.settings")
django.setup()

from core.models import Resource, Location

RESOURCES_NUMBER = 5
LOCATIONS_NUMBER_PER_RESOURCE = 10

def generate_random_point():
        latitude = random.uniform(-90, 90)
        longitude = random.uniform(-180, 180)

        return Point(longitude, latitude)

models_to_reset = [Resource, Location]
print(f"Destroying: {models_to_reset}")
for model in models_to_reset:
    model.objects.all().delete()
print(f"Destroyed: {models_to_reset}")

for i in range(RESOURCES_NUMBER):
    resource = Resource.objects.create()
    
    for j in range(LOCATIONS_NUMBER_PER_RESOURCE):      
        point = generate_random_point()
        resource.locations.create(point=point)

print('Seed completed!')            

