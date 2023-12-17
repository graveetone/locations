import random
import os

import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dynamic_table_app.settings")
django.setup()

from django.contrib.gis.geos import Point
from core.models import (
     create_table_for_resource,
     get_dynamic_tables,
     destroy_dynamic_table
)

RESOURCES_NUMBER = 5
LOCATIONS_NUMBER_PER_RESOURCE = 10

def generate_random_point():
    latitude = random.uniform(-90, 90)
    longitude = random.uniform(-180, 180)

    return Point(longitude, latitude)

tables_to_destroy = get_dynamic_tables()
print(f"Destroying: {tables_to_destroy}")
for table in tables_to_destroy:
    destroy_dynamic_table(table)
print(f"Destroyed: {tables_to_destroy}")

for i in range(RESOURCES_NUMBER):
    LocationsForResource = create_table_for_resource()
    for j in range(LOCATIONS_NUMBER_PER_RESOURCE):
        point = generate_random_point()
        LocationsForResource.objects.create(point=point)

print('Seed completed!')            
