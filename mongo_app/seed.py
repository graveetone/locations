import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
from mongoengine.connection import _get_db
from shared import generate_random_coordinates, get_seed_args, setup_django_for_app
setup_django_for_app('mongo_app')

from core.models import Resource, Location

RESOURCES_NUMBER, LOCATIONS_NUMBER_PER_RESOURCE = get_seed_args()
print('Seeding: {} resources | {} locations per resource | {} locations'.format(RESOURCES_NUMBER, LOCATIONS_NUMBER_PER_RESOURCE, RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE))

models_to_reset = [Resource]

print(f"Resetting: {models_to_reset}")
for model in models_to_reset:
    model.drop_collection()
print(f"Destroyed: {models_to_reset}")

counters_collection = "mongoengine.counters"
print(f'Destroying: {counters_collection}')
_get_db().drop_collection(counters_collection)
print(f"Destroyed: {counters_collection}")


for i in range(RESOURCES_NUMBER):
    resource = Resource()
    resource.save()
    
    for j in range(LOCATIONS_NUMBER_PER_RESOURCE):      
        resource.add_location(generate_random_coordinates())
    

print('Seed completed!')
