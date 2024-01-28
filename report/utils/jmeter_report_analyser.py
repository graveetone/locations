import pandas as pd


class JMeterReportAnalyser:
    def __init__(self, csv_filename):
        self.data = pd.read_csv(csv_filename)
        self.labels = self.data["label"].unique()
        self._prepare_results_template()

    def analyze(self):
        self.analyze_requests()
        self.calculate_apdex()
        self.calculate_mean_elapsed_time()

        return self.results
    
    def _prepare_results_template(self):
        self.results = {label: {} for label in [*self.labels, "summary"]}
            
    def analyze_requests(self):
        success_count = len(
            self.data[self.data['success'] == True]) / len(self.data)

        self.results["summary"].update({
            "success": success_count * 100,
            "failure": (1 - success_count) * 100
        })

        #  potentially redundant functionality if jmeter csv reports is generated for each request separetely
        #  but this code can be used for backward compatibility for use case when csv report can contain data about several requests
        for label in self.labels:
            data = self._get_request_data_by_label(label)
            success_count = len(data[data['success'] == True]) / len(data)

            self.results[label].update({
                "success": success_count * 100,
                "failure": (1 - success_count) * 100
            })

    def calculate_apdex(self, tt=500, ft=1500):
        count_satisfied = lambda data: len(data[(data['elapsed'] <= tt) & (data['success'] == True)]) 
        count_tolerant = lambda data: len(data[(data['elapsed'] >= tt) & (data['elapsed'] <= ft) & (data['success'] == True)])         

        apdex = (count_satisfied(self.data) + count_tolerant(self.data) * 0.5) / len(self.data)
        self.results["summary"].update({
            "apdex": apdex,
        })

        for label in self.labels:
            data = self._get_request_data_by_label(label)

            apdex = (count_satisfied(data) + count_tolerant(data) * 0.5) / len(data)
            self.results[label].update({
                "apdex": apdex,
            })

    def calculate_mean_elapsed_time(self):
        self.results["summary"].update({
            "elapsed": self.data['elapsed'].mean(),
        })

        for label in self.labels:
            data = self._get_request_data_by_label(label)

            self.results[label].update({
                "elapsed": data['elapsed'].mean(),
            })

    def _get_request_data_by_label(self, label):
        return self.data[self.data["label"] == label]
