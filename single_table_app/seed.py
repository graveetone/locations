import os
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

for i in range(1, RESOURCES_NUMBER + 1):
    locations = [Location(point=Point(*generate_random_coordinates()), resource_id=i)
                 for _ in range(LOCATIONS_NUMBER_PER_RESOURCE)]
    Location.objects.bulk_create(locations)        
    print("Locations created: {}/{}".format(i * LOCATIONS_NUMBER_PER_RESOURCE, RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE), end="\r")        

print('\nSeed completed!')
print("--- %s seconds ---" % (time.time() - start_time))
          
save_database_size_to_file(
    app_name=current_app_name, 
    locations_total=RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE,
    db_size_bytes=get_database_size_in_bytes())