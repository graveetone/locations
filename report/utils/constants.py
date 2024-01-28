from pathlib import Path
from .helpers import SeedParam
import os
from dotenv import load_dotenv

load_dotenv()

BASE_APP_DIR = Path(os.getcwd()).parent
DB_SIZES_REPORT_FILE = BASE_APP_DIR / os.getenv("DB_SIZES_REPORT_FILE")

REPORT_FILES_DIR = BASE_APP_DIR / os.getenv("REPORT_FILES_DIR") 
IMAGE_PATH = BASE_APP_DIR / os.getenv("IMAGE_PATH")

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

TABLE_HEADERS_WITH_UNITS = [
    "Кількість локацій",
    "Розмір бази, байт",
    "Кількість успішних запитів, %",
    "APDEX індекс",
    "Середній час відповіді, мс"
]
APP_SUCCESS_KEY = "{app} success"
APP_APDEX_KEY = "{app} apdex"
APP_DB_SIZE_KEY = "{app} db_size"
APP_ELAPSED_TIME_KEY = "{app} elapsed"