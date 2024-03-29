import os
import random
import sys
import time

from django.db import connection

current_app_name = "point_field_app"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from shared import generate_random_coordinates, get_database_size_in_bytes, get_seed_args, save_database_size_to_file, setup_django_for_app
setup_django_for_app(current_app_name)

from django.contrib.gis.geos import Point
from core.models import Resource, Location

RESOURCES_NUMBER, LOCATIONS_NUMBER_PER_RESOURCE = get_seed_args()
print('Seeding: {} resources | {} locations per resource | {} locations'.format(RESOURCES_NUMBER, LOCATIONS_NUMBER_PER_RESOURCE, RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE))
start_time = time.time()
models_to_reset = [Resource, Location]
print(f"Destroying: {models_to_reset}")
for model in models_to_reset:
    model.objects.all().delete()
    
    table_name = model._meta.db_table
    sequence_name = f"{table_name}_id_seq"

    with connection.cursor() as cursor:
        cursor.execute(f"SELECT setval('{sequence_name}', COALESCE((SELECT MAX(id)+1 FROM {table_name}), 1), false);")

print(f"Destroyed: {models_to_reset}")


def get_random_not_full_resource():
    random_resource = random.choice(not_full_resources)
    resource_location_count_mapping[random_resource] += 1
    if resource_location_count_mapping[random_resource] >= LOCATIONS_NUMBER_PER_RESOURCE:
        not_full_resources.remove(random_resource)
    
    return random_resource
    

resources = [Resource.objects.create() for i in range(1, RESOURCES_NUMBER + 1)]

not_full_resources = resources

resource_location_count_mapping = {
    resource_id: 0 for resource_id in not_full_resources
}

for i in range(1, RESOURCES_NUMBER + 1):
    locations = [Location(point=Point(*generate_random_coordinates()), resource=get_random_not_full_resource()) for j in range(LOCATIONS_NUMBER_PER_RESOURCE)]      
    Location.objects.bulk_create(locations)
    
    progress = int(100 * (i * LOCATIONS_NUMBER_PER_RESOURCE) / (RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE))
    print("Seeding in progress: {}% {}".format(progress, "|" * progress), end="\r")

print('\nSeed completed!')
print("--- %s seconds ---" % (time.time() - start_time))
save_database_size_to_file(
    app_name=current_app_name, 
    locations_total=RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE,
    db_size_bytes=get_database_size_in_bytes())