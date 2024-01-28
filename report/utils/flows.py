from .helpers import camel_to_snake_case_converter, read_csv_file
from .constants import DB_SIZES_REPORT_FILE, REPORT_FILES_DIR
from .jmeter_report_analyser import JMeterReportAnalyser


def build_path_to_file(app, test_plan, resources, locations):
    file_path = "{app}/{test_plan}/{resources}-{locations}.csv".format(app=app, test_plan=test_plan, resources=resources, locations=locations)
    
    return REPORT_FILES_DIR / file_path


def get_result(app, test_plan, resources, locations):
    path_to_file = build_path_to_file(app, test_plan, resources, locations)
    jmra = JMeterReportAnalyser(path_to_file)

    return jmra.analyze()


def compose_row(app, param, requests=None):
    total_success, total_apdex, total_elapsed_time = 0, 0, 0

    path_to_app = camel_to_snake_case_converter(app)

    for request in requests:
        result = get_result(path_to_app, request, param.resources, param.locations_per_resource)
        total_success += result["summary"]["success"]
        total_apdex += result["summary"]["apdex"]
        total_elapsed_time += result["summary"]["elapsed"]

    total_success_normalized = total_success / len(requests)
    total_apdex_normalized = total_apdex / len(requests)
    total_elapsed_time_normalized = total_elapsed_time / len(requests)


    return {
        "Кількість локацій": param.locations_total,
        "Розмір бази": get_db_size(app, param.locations_total),
        "Кількість успішних запитів": total_success_normalized,
        "APDEX індекс": total_apdex_normalized,
        "Середній час відповіді": total_elapsed_time_normalized
    }


def get_db_size(app, locations_total):
    db_sizes = read_csv_file(DB_SIZES_REPORT_FILE)
    app = camel_to_snake_case_converter(app)

    filter = (db_sizes.app_name == app) & (
        db_sizes.locations_total == locations_total)

    return db_sizes[filter].iloc[0].db_size_bytes
