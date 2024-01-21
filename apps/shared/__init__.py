import argparse
import django
import os
import random
import csv
from django.db import connection
from django.conf import settings
from mongoengine.connection import _get_db


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


def get_database_size_in_bytes():
    with connection.cursor() as cursor:
        cursor.execute("SELECT pg_database_size(current_database())")
        size_in_bytes = cursor.fetchone()[0]
    return size_in_bytes

def get_mongo_database_size_in_bytes():
    return _get_db().command("dbStats")['dataSize']

def save_database_size_to_file(app_name, locations_total, db_size_bytes):
    base_dir = settings.BASE_DIR.parent.parent
    file_path = "{base_dir}/automation/reports/db_sizes.csv".format(base_dir=base_dir)

    file_exists = os.path.exists(file_path)
    headers = ["app_name", "locations_total", "db_size_bytes"]
    with open(file_path, 'a', newline='') as csv_file:
        writer = csv.writer(csv_file)

        if not file_exists:
            writer.writerow(headers)

        writer.writerow([app_name, locations_total, db_size_bytes])