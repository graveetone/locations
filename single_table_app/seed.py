# from django.conf import settings
import django
import random
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "single_table_app.settings")

django.setup()

from core.models import Location
from faker import Faker
from faker.providers.geo import Provider as GeoProvider
from django.contrib.gis.geos import Point
fake = Faker()
fake.add_provider(GeoProvider)

def generate_random_point():
        latitude = random.uniform(-90, 90)
        longitude = random.uniform(-180, 180)

        return Point(longitude, latitude)

models_to_reset = [Location]
print(f"Resetting {models_to_reset}")
for model in models_to_reset:
    model.objects.all().delete()

resources_n = 5
locations_n = 10

for i in range(resources_n):    
    for j in range(locations_n):      
        point = generate_random_point()
        Location.objects.create(point=point, resource_id=i)

print('Seed completed!')            

