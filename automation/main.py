import os
from pathlib import Path
import shutil
import subprocess
import time
from utils import ColorPrint
from config import APPS, TEST_PLANS, SEED_PARAMS

from jmeter_runner import JMeterRunner
from dotenv import load_dotenv
load_dotenv()

BASE_PROJECT_DIR = Path(os.getenv("BASE_PROJECT_DIR")) 
JMETER_BIN_PATH = Path(os.getenv("JMETER_BIN_PATH"))
TEST_PLANS_DIR = BASE_PROJECT_DIR / os.getenv("TEST_PLANS_DIR")
APPS_DIR = BASE_PROJECT_DIR / 'apps'


class LocationsFlow:
    def __init__(self, app, resources_count, locations_count):
        self.app = app
        self.path_to_app = APPS_DIR / app
        self.resources_count = resources_count
        self.locations_count = locations_count

    def build_command(self, key):
        COMMANDS = {
            "seed": [
                'python3',
                self.path_to_app / "seed.py",
                '--resources={}'.format(self.resources_count),
                '--locations={}'.format(self.locations_count),
            ],
            "test_seed": [
                'python3',
                self.path_to_app / "seed.py",
                '--resources={}'.format(5),
                '--locations={}'.format(5),
            ],
            "runserver": [
                'python3',
                self.path_to_app / "manage.py",
                "runserver",
            ],
            "tests": [
                "pytest",
                "-vs",
                Path.cwd().parent / "tests" / "test.py",
            ]
        }

        return COMMANDS.get(key)

    def run_seed(self):
        command = self.build_command("seed")
        self.claim_command(str(command))
        subprocess.run(command)

    def run_test_seed(self):
        command = self.build_command("test_seed")
        self.claim_command(str(command))
        subprocess.run(command)

    def run_server(self):
        command = self.build_command("runserver")
        self.claim_command(str(command))
        process = subprocess.Popen(command)
        time.sleep(5)  # wait for server to start

        return process

    def run_tests(self):
        command = self.build_command("tests")
        self.claim_command(str(command))
        subprocess.run(command)

    def compose_file_path(self, request):
        folder_path = Path("reports") / app / request
        
        file_path = "{resources_count}-{locations_count}.csv".format(
            resources_count=self.resources_count,
            locations_count=self.locations_count,
        )

        os.makedirs(folder_path, exist_ok=True)

        return folder_path / file_path

    @staticmethod
    def reset_reports_folder():
        folder_path = "reports"  # wtf
        try:
            shutil.rmtree(folder_path)
        except FileNotFoundError:
            print(f"Folder '{folder_path}' not found.")

        try:
            os.makedirs(folder_path)
        except OSError as e:
            print(f"Failed to create folder '{folder_path}': {e}")

    def run_test_flow(self):
        # seeding for tests
        self.claim_current_app()
        with ColorPrint("cyan") as print:
            print("Test seeding")

        self.run_test_seed()

        # run server
        self.claim_current_app()
        with ColorPrint("green") as print:
            print("Running server")

        self.server_process = self.run_server()

        # run tests
        self.claim_current_app()
        with ColorPrint("blue") as print:
            print("Running tests")

        self.run_tests()

        # terminate server
        self.claim_current_app()
        with ColorPrint("red") as print:
            print("Turning server off")

        self.server_process.terminate()

    def run_prod_flow(self):
        # "prod" seeding
        self.claim_current_app()
        with ColorPrint("cyan") as print:
            print("Seeding") # turn it into docstring with @verbose decorator

        self.run_seed()

        # run server
        self.claim_current_app()
        with ColorPrint("green") as print:
            print("Running server")

        self.server_process = self.run_server()

        # run jmeter
        for test_plan in TEST_PLANS:
            self.claim_current_app()
            with ColorPrint("yellow") as print:
                print("Running JMeter test plan {}".format(test_plan))

            jmeter = JMeterRunner(jmeter_path=JMETER_BIN_PATH,
                                  test_plan_path=TEST_PLANS_DIR / "{}.jmx".format(test_plan),
                                  output_file=self.compose_file_path(test_plan))
            jmeter.run()

        # terminate server
        self.claim_current_app()
        with ColorPrint("red") as print:
            print("Turning server off")

        self.server_process.terminate()

    def claim_current_app(self):
        with ColorPrint(background='red', color='black'):
            print(self.app, end='')
        
    def claim_command(self, command):
        with ColorPrint(color="magenta") as print:
            print(str(command))
        print()

    def run_full_flow(self): # add docstring
        self.run_test_flow()
        self.run_prod_flow()


LocationsFlow.reset_reports_folder()  # do not reset this folder, generate folder with name as timestamp to be able to store different versions of reports
for app in APPS:
    for resources, locations_per_resource in SEED_PARAMS:
        lflow = LocationsFlow(app=app, resources_count=resources, locations_count=locations_per_resource)

        try:
            # lflow.run_test_flow()
            lflow.run_prod_flow()
        except Exception as e:
            print(e)
            if hasattr(lflow, "server_process"):
                # turn off server if server started and error occurred
                lflow.claim_current_app()
                with ColorPrint("red") as print:
                    print("Turning server off due to error")
                lflow.server_process.terminate()
