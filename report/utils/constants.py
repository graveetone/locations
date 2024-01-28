from pathlib import Path
from .helpers import SeedParam
import os
from dotenv import load_dotenv

load_dotenv()

BASE_PROJECT_DIR = Path(os.getenv("BASE_PROJECT_DIR"))
DB_SIZES_REPORT_FILE = BASE_PROJECT_DIR / os.getenv("DB_SIZES_REPORT_FILE")

REPORT_FILES_DIR = BASE_PROJECT_DIR / os.getenv("REPORT_FILES_DIR") 

APPS_TITLES = [
    "PointFieldApp",
    "SingleTableApp",
    "DynamicTableApp",
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
    "Кількість локацій",
    "Розмір бази",
    "Кількість успішних запитів",
    "APDEX індекс",
    "Середній час відповіді"
]

APP_SUCCESS_KEY = "{app} success"
APP_APDEX_KEY = "{app} apdex"
APP_DB_SIZE_KEY = "{app} db_size"
APP_ELAPSED_TIME_KEY = "{app} elapsed"