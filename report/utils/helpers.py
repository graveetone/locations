from collections import namedtuple
import re
import pandas as pd


def camel_to_snake_case_converter(string):
    pattern = r"(?<!^)(?=[A-Z])"

    return re.sub(pattern, "_", string).lower()


def read_csv_file(file_path):
    return pd.read_csv(file_path)


class SeedParam(namedtuple('SeedParam', ['resources', 'locations_per_resource'])):
    def __new__(cls, resources, locations_per_resource):
        param = super(SeedParam, cls).__new__(cls, resources=resources, locations_per_resource=locations_per_resource)
        param.locations_total = resources * locations_per_resource

        return param
    
    def __str__(self):
        return "{}: {} ресурсів по {} точок".format(self.locations_total, self.resources, self.locations_per_resource)
