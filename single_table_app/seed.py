import random
import os

import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "single_table_app.settings")
django.setup()

from django.contrib.gis.geos import Point

from core.models import Location

RESOURCES_NUMBER = 5
LOCATIONS_NUMBER_PER_RESOURCE = 10

def generate_random_point():
        latitude = random.uniform(-90, 90)
        longitude = random.uniform(-180, 180)

        return Point(x=longitude, y=latitude)

models_to_reset = [Location]
print(f"Destroying: {models_to_reset}")
for model in models_to_reset:
    model.objects.all().delete()
print(f"Destroyed: {models_to_reset}")

for i in range(RESOURCES_NUMBER):    
    for j in range(LOCATIONS_NUMBER_PER_RESOURCE):      
        point = generate_random_point()
        Location.objects.create(point=point, resource_id=i)

print('Seed completed!')            

