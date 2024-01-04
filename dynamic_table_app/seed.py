import os
import sys
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from shared import generate_random_coordinates, get_seed_args, setup_django_for_app
setup_django_for_app('dynamic_table_app')

from django.contrib.gis.geos import Point
from core.models import TableManager

RESOURCES_NUMBER, LOCATIONS_NUMBER_PER_RESOURCE = get_seed_args()
print('Seeding: {} resources | {} locations per resource | {} locations'.format(RESOURCES_NUMBER, LOCATIONS_NUMBER_PER_RESOURCE, RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE))

start_time = time.time()
tables_to_destroy = TableManager.get_dynamic_tables()
print(f"Destroying: {tables_to_destroy}")
for table in tables_to_destroy:
    TableManager.destroy_table(table)
print(f"Destroyed: {tables_to_destroy}")

for i in range(RESOURCES_NUMBER):
    LocationsForResource = TableManager().create_table()
    locations = [LocationsForResource(point=Point(*generate_random_coordinates())) for _ in range(LOCATIONS_NUMBER_PER_RESOURCE)]
    LocationsForResource.objects.bulk_create(locations)
    print("Locations created: {}/{}".format((i + 1) * LOCATIONS_NUMBER_PER_RESOURCE, RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE), end="\r")

print('\nSeed completed!')
print("--- %s seconds ---" % (time.time() - start_time))
