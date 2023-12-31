import random
import os
from mongoengine.connection import _get_db

import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mongo_app.settings")
django.setup() # to run connect method and establish connection to mongo database

from core.models import Resource, Location

RESOURCES_NUMBER = 5
LOCATIONS_NUMBER_PER_RESOURCE = 10

def generate_random_coordinates():
    latitude = random.uniform(-90, 90)
    longitude = random.uniform(-180, 180)

    return [longitude, latitude]

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
