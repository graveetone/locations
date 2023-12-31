import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from shared import generate_random_coordinates, get_seed_args, setup_django_for_app
setup_django_for_app('dynamic_table_app')

from django.contrib.gis.geos import Point
from core.models import TableManager

RESOURCES_NUMBER, LOCATIONS_NUMBER_PER_RESOURCE = get_seed_args()
print('Seeding: {} resources | {} locations per resource | {} resources'.format(RESOURCES_NUMBER, LOCATIONS_NUMBER_PER_RESOURCE, RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE))

tables_to_destroy = TableManager.get_dynamic_tables()
print(f"Destroying: {tables_to_destroy}")
for table in tables_to_destroy:
    TableManager.destroy_table(table)
print(f"Destroyed: {tables_to_destroy}")

for i in range(RESOURCES_NUMBER):
    LocationsForResource = TableManager().create_table()
    for j in range(LOCATIONS_NUMBER_PER_RESOURCE):
        coordinates = generate_random_coordinates()
        LocationsForResource.objects.create(point=Point(*coordinates))

print('Seed completed!')
