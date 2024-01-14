import pandas as pd


class JMeterReportAnalyser:
    def __init__(self, csv_filename):
        self.csv_filename = csv_filename
        self.data = pd.read_csv("result.csv")
        self.labels = self.data["label"].unique()
        self._prepare_results_template()

    def analyze(self):
        self.analyze_requests()
        self.calculate_apdex()

        return self.results
    
    def _prepare_results_template(self):
        self.results = {label: {} for label in [*self.labels, "summary"]}
            
    def analyze_requests(self):
        success_count = len(
            self.data[self.data['success'] == True])/len(self.data)

        self.results["summary"].update({
            "sucess": success_count * 100,
            "failure": (1 - success_count) * 100
        })

        for label in self.labels:
            data = self._get_request_data_by_label(label)
            success_count = len(data[data['success'] == True])/len(data)

            self.results[label].update({
                "sucess": success_count * 100,
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

    def _get_request_data_by_label(self, label):
        return self.data[self.data["label"] == label]
