import re
import pandas as pd
from .jmeter_report_analyser import JMeterReportAnalyser

BASE_PATH = "/home/graveetone/code/locations/automation" 

REQUESTS_MAPPING = {
    "OpenConnection": "Resource 5 | Open Connection",
    "PingPong": "Resource 5 | PingPong Request",
    "GetLocation": "Resource 5 | GetLocation",
    "AddLocation": "Resource 5 | AddLocation",
    "GetTrack": "Resource 5 | GetTrack",
    "FindResourcesNearby": "Location | GetResourcesNearby",
    "CloseConnection": "Resource 5 | CloseConnection"
}

def build_path_to_file(app, resources, locations):
    return "{}/reports/{}/{}-{}/result.csv".format(BASE_PATH, app, resources, locations)

def get_result(app, resources, locations):
    path_to_file = build_path_to_file(app, resources, locations)
    jmra = JMeterReportAnalyser(path_to_file)

    return jmra.analyze()

def get_path_to_app(app):
    return re.sub(r'(?<!^)(?=[A-Z])', '_', app).lower()

def convert_requests(requests):
    return [REQUESTS_MAPPING.get(request) for request in requests]

def compose_row(app, resources, locations, requests=None):
    path_to_app = get_path_to_app(app)
    result = get_result(path_to_app, resources, locations)
    locations_total = resources * locations 

    total_success = result["summary"]["success"]
    total_apdex = result["summary"]["apdex"]
    if requests:
        requests = convert_requests(requests)
        total_success = sum(result[request]["success"] for request in requests)/len(requests)
        total_apdex = sum(result[request]["apdex"] for request in requests)/len(requests)

    return {
        "Додаток": app,
        "Кількість локацій": locations_total,
        "Розмір бази": get_db_size(app, locations_total),
        "Кількість успішних запитів": total_success,
        "APDEX індекс": total_apdex,
    }

def get_db_size(app, locations_total):
    file = BASE_PATH + "/reports/db_sizes.csv"
    db_sizes = pd.read_csv(file)
    app = get_path_to_app(app)
    filter = (db_sizes.app_name == app) & (db_sizes.locations_total == locations_total)
    
    return db_sizes[filter].iloc[0].db_size_bytes
