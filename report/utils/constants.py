APPS_TITLES = ["PointFieldApp", "SingleTableApp", "DynamicTableApp",
               "MongoApp"
               ]


SEED_PARAMS = [
    (10, 100),  # number of resources, number of locations per resource
    (100, 100),
    (100, 1_000),
    (1_000, 1_000),
    (1_000, 10_000)
]

REQUESTS_TITLES = [
    "OpenConnection", "PingPong", "GetLocation"
    "AddLocation", "GetTrack", "FindResourcesNearby",
    "CloseConnection"
]

TABLE_HEADERS = [
    "Додаток", "Кількість локацій", "Розмір бази",
    "Кількість успішних запитів", "APDEX індекс"
]

APP_SUCCESS_KEY = "{app} success"
APP_APDEX_KEY = "{app} apdex"
APP_DB_SIZE_KEY = "{app} db_size"
