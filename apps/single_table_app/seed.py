import os
import random
import sys
import time

current_app_name = "single_table_app"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from shared import generate_random_coordinates, get_database_size_in_bytes, get_seed_args, save_database_size_to_file, setup_django_for_app
setup_django_for_app(current_app_name)

from django.contrib.gis.geos import Point
from core.models import Location

RESOURCES_NUMBER, LOCATIONS_NUMBER_PER_RESOURCE = get_seed_args()
print('Seeding: {} resources | {} locations per resource | {} locations'.format(RESOURCES_NUMBER, LOCATIONS_NUMBER_PER_RESOURCE, RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE))
start_time = time.time()
models_to_reset = [Location]
print(f"Destroying: {models_to_reset}")
for model in models_to_reset:
    model.objects.all().delete()
print(f"Destroyed: {models_to_reset}")

not_full_resources = list(range(1, RESOURCES_NUMBER + 1))
resource_location_count_mapping = {
    resource_id: 0 for resource_id in not_full_resources
}
def get_random_not_full_resource_id():
    random_resource_id = random.choice(not_full_resources)
    resource_location_count_mapping[random_resource_id] += 1
    if resource_location_count_mapping[random_resource_id] >= LOCATIONS_NUMBER_PER_RESOURCE:
        not_full_resources.remove(random_resource_id)
        
    return random_resource_id
    
for i in range(1, RESOURCES_NUMBER + 1):
    locations = [Location(point=Point(*generate_random_coordinates()), resource_id=get_random_not_full_resource_id())
                 for _ in range(LOCATIONS_NUMBER_PER_RESOURCE)]
    Location.objects.bulk_create(locations)
    progress = int(100 * (i * LOCATIONS_NUMBER_PER_RESOURCE) / (RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE))
    print("Seeding in progress: {}% {}".format(progress, "|" * progress), end="\r")
    
print('\nSeed completed!')
print("--- %s seconds ---" % (time.time() - start_time))
          
save_database_size_to_file(
    app_name=current_app_name, 
    locations_total=RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE,
    db_size_bytes=get_database_size_in_bytes())