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
            '-t', self.test_plan_path,  # Path to the JMeter test plan
            '-l', self.output_file,  # Path to the file to store results
        ]


if __name__ == "__main__":
    jmeter_bin_path = '/home/graveetone/Desktop/apache-jmeter-5.6.2/bin/jmeter'
    test_plan_path = '/home/graveetone/Desktop/apache-jmeter-5.6.2/bin/LocationsWsTestPlan.jmx'

    runner = JMeterRunner(test_plan_path=test_plan_path,
                          jmeter_path=jmeter_bin_path,
                          output_file="results1.csv"
                          )
    runner.run()
