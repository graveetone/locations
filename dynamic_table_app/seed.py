import django
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dynamic_table_app.settings")

django.setup()

from core.models import (
     create_table_for_resource,
     get_dynamic_tables,
     destroy_dynamic_table
)

import random
from faker import Faker
from faker.providers.geo import Provider as GeoProvider
from django.contrib.gis.geos import Point
fake = Faker()
fake.add_provider(GeoProvider)

def generate_random_point():
        latitude = random.uniform(-90, 90)
        longitude = random.uniform(-180, 180)

        return Point(longitude, latitude)

tables_to_destroy = get_dynamic_tables()

print(f"Destroying {tables_to_destroy}")
for table in tables_to_destroy:
    destroy_dynamic_table(table)

resources_n = 5
locations_n = 10

for i in range(resources_n):
    LocationsForResource = create_table_for_resource()
    for j in range(locations_n):
        point = generate_random_point()
        LocationsForResource.objects.create(point=point)

print('Seed completed!')            
