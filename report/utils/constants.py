from .helpers import SeedParam


BASE_PATH = "/home/graveetone/code/locations/report"
DB_SIZES_FILE_PATH = BASE_PATH + "/data/db_sizes.csv"
REPORT_FILE_PATH_TEMPLATE = BASE_PATH + \
    "/data/{app}/{test_plan}/{resources}-{locations}.csv"

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
    "Додаток",
    "Кількість локацій",
    "Розмір бази",
    "Кількість успішних запитів",
    "APDEX індекс",
]

APP_SUCCESS_KEY = "{app} success"
APP_APDEX_KEY = "{app} apdex"
APP_DB_SIZE_KEY = "{app} db_size"
