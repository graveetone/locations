import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from shared import generate_random_coordinates, get_seed_args, setup_django_for_app
setup_django_for_app('point_field_app')

from django.contrib.gis.geos import Point
from core.models import Resource, Location

RESOURCES_NUMBER, LOCATIONS_NUMBER_PER_RESOURCE = get_seed_args()
print('Seeding: {} resources | {} locations per resource | {} resources'.format(RESOURCES_NUMBER, LOCATIONS_NUMBER_PER_RESOURCE, RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE))

models_to_reset = [Resource, Location]
print(f"Destroying: {models_to_reset}")
for model in models_to_reset:
    model.objects.all().delete()
print(f"Destroyed: {models_to_reset}")

for i in range(RESOURCES_NUMBER):
    resource = Resource.objects.create()
    
    for j in range(LOCATIONS_NUMBER_PER_RESOURCE):      
        coordinates = generate_random_coordinates()
        resource.locations.create(point=Point(*coordinates))

print('Seed completed!')
