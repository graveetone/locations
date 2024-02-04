import os
import sys
import time

current_app_name = "detached_table_app"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from shared import (generate_random_coordinates,
                    get_seed_args,
                    setup_django_for_app,
                    get_database_size_in_bytes,
                    save_database_size_to_file)

setup_django_for_app(current_app_name)

from django.contrib.gis.geos import Point
from core.models import TableManager
from django.db import connection

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

    progress = int(100 * (i * LOCATIONS_NUMBER_PER_RESOURCE) / (RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE))
    print("Seeding in progress: {}% {}".format(progress, "|" * progress), end="\r")

print('\nSeed completed!')
print("--- %s seconds ---" % (time.time() - start_time))
save_database_size_to_file(
    app_name=current_app_name, 
    locations_total=RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE,
    db_size_bytes=get_database_size_in_bytes())