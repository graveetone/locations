import subprocess


class JMeterRunner:
    def __init__(self, jmeter_path, test_plan_path, output_file):
        self.jmeter_path = jmeter_path
        self.test_plan_path = test_plan_path
        self.output_file = output_file

    def run(self):
        command = self.build_command()
        print("JMeter run started")

        subprocess.run(command)

        print("JMeter run finished!")

    def build_command(self):
        return [
            self.jmeter_path,
            '-n',  # Non-GUI mode
            '-t', self.test_plan_path,
            '-l', self.output_file,
        ]
