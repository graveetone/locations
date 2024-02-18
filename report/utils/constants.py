from pathlib import Path
from .helpers import SeedParam
import os
from dotenv import load_dotenv

load_dotenv()

BASE_APP_DIR = Path(os.path.abspath(os.path.dirname(__file__))).parent
DB_SIZES_REPORT_FILE = BASE_APP_DIR / os.getenv("DB_SIZES_REPORT_FILE")

REPORT_FILES_DIR = BASE_APP_DIR / os.getenv("REPORT_FILES_DIR") 
IMAGE_PATH = BASE_APP_DIR / os.getenv("IMAGE_PATH")

APPS_TITLES = [
    "PointFieldApp",
    "SingleTableApp",
    "DetachedTableApp",
    "MongoApp",
]


SEED_PARAMS = [
    SeedParam(resources=10, locations_per_resource=100),
    SeedParam(resources=100, locations_per_resource=100),
    SeedParam(resources=100, locations_per_resource=1_000),
    SeedParam(resources=1_000, locations_per_resource=1_000),
    SeedParam(resources=1_000, locations_per_resource=10_000),
]


REQUESTS_TITLES = [
    "GetLocation",
    "GetTrack",
    "AddLocation",
    "GetResourcesNearby",
]

TABLE_HEADERS = [
    "Додаток",
    "Кількість точок",
    "Розмір бази",
    "Кількість успішних запитів",
    "APDEX індекс",
    "Середній час відповіді",
    "Пропускна здатність"
]

TABLE_HEADERS_WITH_UNITS = [
    "Кількість точок",
    "Розмір бази, байт",
    "Кількість успішних запитів, %",
    "APDEX індекс",
    "Середній час відповіді, мс"
]
