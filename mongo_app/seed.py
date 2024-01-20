import os
import sys
import time

current_app_name = "mongo_app"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
from mongoengine.connection import _get_db
from shared import generate_random_coordinates, get_mongo_database_size_in_bytes, get_seed_args, save_database_size_to_file, setup_django_for_app
setup_django_for_app(current_app_name)

from core.models import Resource, Location

RESOURCES_NUMBER, LOCATIONS_NUMBER_PER_RESOURCE = get_seed_args()
print('Seeding: {} resources | {} locations per resource | {} locations'.format(RESOURCES_NUMBER, LOCATIONS_NUMBER_PER_RESOURCE, RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE))
start_time = time.time()
models_to_reset = [Resource]

print(f"Resetting: {models_to_reset}")
for model in models_to_reset:
    model.drop_collection()
print(f"Destroyed: {models_to_reset}")

counters_collection = "mongoengine.counters"
print(f'Destroying: {counters_collection}')
_get_db().drop_collection(counters_collection)
print(f"Destroyed: {counters_collection}")


for i in range(1, RESOURCES_NUMBER+1):
    resource = Resource()
    resource.save()

    points = [generate_random_coordinates() for _ in range(LOCATIONS_NUMBER_PER_RESOURCE)]
    resource.add_locations(points)
    print("Locations created: {}/{}".format(i * LOCATIONS_NUMBER_PER_RESOURCE, RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE), end="\r")

print('\nSeed completed!')
print("--- %s seconds ---" % (time.time() - start_time))

save_database_size_to_file(
    app_name=current_app_name, 
    locations_total=RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE,
    db_size_bytes=get_mongo_database_size_in_bytes())