import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from shared import generate_random_coordinates, get_seed_args, setup_django_for_app
setup_django_for_app('single_table_app')

from django.contrib.gis.geos import Point
from core.models import Location

RESOURCES_NUMBER, LOCATIONS_NUMBER_PER_RESOURCE = get_seed_args()
print('Seeding: {} resources | {} locations per resource | {} locations'.format(RESOURCES_NUMBER, LOCATIONS_NUMBER_PER_RESOURCE, RESOURCES_NUMBER * LOCATIONS_NUMBER_PER_RESOURCE))

models_to_reset = [Location]
print(f"Destroying: {models_to_reset}")
for model in models_to_reset:
    model.objects.all().delete()
print(f"Destroyed: {models_to_reset}")

for i in range(RESOURCES_NUMBER):    
    for j in range(LOCATIONS_NUMBER_PER_RESOURCE):      
        coordinates = generate_random_coordinates()
        Location.objects.create(point=Point(*coordinates), resource_id=i)

print('Seed completed!')            
