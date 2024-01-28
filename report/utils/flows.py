from .helpers import camel_to_snake_case_converter, read_csv_file
from .constants import DB_SIZES_FILE_PATH, REPORT_FILE_PATH_TEMPLATE
from .jmeter_report_analyser import JMeterReportAnalyser


def build_path_to_file(app, test_plan, resources, locations):
    return REPORT_FILE_PATH_TEMPLATE.format(app=app, test_plan=test_plan, resources=resources, locations=locations)


def get_result(app, test_plan, resources, locations):
    path_to_file = build_path_to_file(app, test_plan, resources, locations)
    jmra = JMeterReportAnalyser(path_to_file)

    return jmra.analyze()


def compose_row(app, param, requests=None):
    total_success, total_apdex = 0, 0

    path_to_app = camel_to_snake_case_converter(app)

    for request in requests:
        result = get_result(path_to_app, request, param.resources, param.locations_per_resource)
        total_success += result["summary"]["success"]
        total_apdex += result["summary"]["apdex"]

    total_success_normalized = total_success / len(requests)
    total_apdex_normalized = total_apdex / len(requests)

    return {
        "Додаток": app,
        "Кількість локацій": param.locations_total,
        "Розмір бази": get_db_size(app, param.locations_total),
        "Кількість успішних запитів": total_success_normalized,
        "APDEX індекс": total_apdex_normalized,
    }


def get_db_size(app, locations_total):
    db_sizes = read_csv_file(DB_SIZES_FILE_PATH)
    app = camel_to_snake_case_converter(app)

    filter = (db_sizes.app_name == app) & (
        db_sizes.locations_total == locations_total)

    return db_sizes[filter].iloc[0].db_size_bytes
