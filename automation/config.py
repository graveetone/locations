APPS = [
    "mongo_app",
    "single_table_app",
    "point_field_app",
    "detached_table_app"
]

SEED_PARAMS = [
    (10, 100),
    (100, 100),
    (100, 1_000),
    (1_000, 1_000),
    (1_000, 10_000)
]

TEST_PLANS = [
    "GetLocation",
    "AddLocation",
    "GetTrack",
    "GetResourcesNearby"
]
