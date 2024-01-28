import argparse
from pathlib import Path
import django
import os
import random
import csv
from django.db import connection
from mongoengine.connection import _get_db
from dotenv import load_dotenv

load_dotenv()

BASE_PROJECT_DIR = Path(os.getenv("BASE_PROJECT_DIR"))
DB_SIZES_FILE = BASE_PROJECT_DIR / os.getenv("DB_SIZES_FILE")

POSTGRESQL_DB_SIZE_QUERY = "SELECT pg_database_size(current_database())"


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
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "{app_name}.settings".format(app_name=app_name))
    django.setup()


def generate_random_coordinates():
    longitude = random.uniform(-180, 180)
    latitude = random.uniform(-90, 90)

    return [longitude, latitude]


def get_database_size_in_bytes():
    with connection.cursor() as cursor:
        cursor.execute(POSTGRESQL_DB_SIZE_QUERY)
        size_in_bytes = cursor.fetchone()[0]
    return size_in_bytes

def get_mongo_database_size_in_bytes():
    return _get_db().command("dbStats")['dataSize']

def save_database_size_to_file(app_name, locations_total, db_size_bytes):
    file_exists = os.path.exists(DB_SIZES_FILE)
    headers = ["app_name", "locations_total", "db_size_bytes"]
    with open(DB_SIZES_FILE, 'a', newline='') as csv_file:
        writer = csv.writer(csv_file)

        if not file_exists:
            writer.writerow(headers)

        writer.writerow([app_name, locations_total, db_size_bytes])