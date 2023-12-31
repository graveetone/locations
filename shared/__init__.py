import argparse
import django
import os
import random


def get_seed_args():
    parser = argparse.ArgumentParser()

    parser.add_argument('--resources', type=int, help='Count of resources')
    parser.add_argument('--locations', type=int, help='Locations per resource')

    args = parser.parse_args()

    resources_count = args.resources
    locations_count = args.locations

    if any([resources_count is None, locations_count is None]):
        raise Exception('Wrong seed args!')

    return resources_count, locations_count


def setup_django_for_app(app_name):
    os.environ.setdefault("DJANGO_SETTINGS_MODULE",
                          "{app_name}.settings".format(app_name=app_name))
    django.setup()


def generate_random_coordinates():
    longitude = random.uniform(-180, 180)
    latitude = random.uniform(-90, 90)

    return [longitude, latitude]
