# from django.conf import settings
import django
import random
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mongo_app.settings")

django.setup() # to run connect method and establish connection to mongo database

from core.models import Resource, Location
from faker import Faker
from faker.providers.geo import Provider as GeoProvider
fake = Faker()
fake.add_provider(GeoProvider)

def generate_random_coordinates():
        latitude = random.uniform(-90, 90)
        longitude = random.uniform(-180, 180)

        return longitude, latitude

models_to_reset = [Resource]

print(f"Resetting {models_to_reset}")
for model in models_to_reset:
    model.drop_collection()
print(f"Destroyed {models_to_reset}")


resources_n = 5
locations_n = 10

for i in range(resources_n):
    resource = Resource.objects.create()
    
    for j in range(locations_n):      
        location = Location(coordinates=generate_random_coordinates())
        resource.locations.append(location)
    
    resource.save()

print('Seed completed!')            
