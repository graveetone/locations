from django.db import models, connection
from django.contrib.gis.db import models as gis_models
from django.contrib import admin

'''
    This app uses approach to dynamically create separate table with Locations for each Resourse
'''

APP_NAME = 'core'
MODEL_NAME = "LocationsForResource{resource_id}"
TABLE_NAME = "locations_for_resource{resource_id}"


def get_dynamic_tables():
    all_tables = connection.introspection.table_names()
    dynamic_tables = [
        table_name for table_name in all_tables if table_name.startswith(TABLE_NAME.format(resource_id=''))]

    return dynamic_tables


def destroy_dynamic_table(table_name):
    with connection.cursor() as cursor:
        cursor.execute(f"DROP TABLE {table_name}")


def _get_new_id_for_resource():
    existing_dynamic_tables = get_dynamic_tables()
    resource_id = len(existing_dynamic_tables) + 1

    return resource_id


class BaseLocation(gis_models.Model):
    point = gis_models.PointField()
    timestamp = models.DateTimeField(auto_now_add=True)


def create_table_for_resource():
    resource_id = _get_new_id_for_resource()
    model_attributes = {
        "point": gis_models.PointField(),
        "timestamp": models.DateTimeField(auto_now_add=True),
        "Meta": type(
            "Meta",
            (),
            {
                "app_label": APP_NAME,
                "db_table": TABLE_NAME.format(resource_id=resource_id),

            }
        ),
        "__module__": "database.models"
    }

    NewLocationModel = type(
        MODEL_NAME.format(resource_id=resource_id),
        (models.Model,),
        model_attributes
    )

    with connection.schema_editor() as schema_editor:
        schema_editor.create_model(NewLocationModel)

    admin.site.register(NewLocationModel)  # side effect!

    return NewLocationModel


class LocationTableWithSpecificName:
    def __init__(self, resource_id):
        self.model = BaseLocation
        self.table_name = TABLE_NAME.format(resource_id=resource_id)
        self.original_table_name = self.model._meta.db_table

    def __enter__(self):
        self.model._meta.db_table = self.table_name

        return self.model

    def __exit__(self, exc_type, exc_value, traceback):
        self.model._meta.db_table = self.original_table_name

    def destroy_table(self):
        destroy_dynamic_table(self.table_name)
