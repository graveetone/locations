from django.db import models, connection
from django.contrib.gis.db import models as gis_models
from django.contrib import admin

'''
    This app uses approach to dynamically create separate table with Locations for each Resourse
'''


class DoesNotExist(Exception):
    pass


class ResourceLocation:
    def __init__(self, resource_id=None):
        if resource_id is not None and resource_id not in TableManager.get_resource_ids():
            raise DoesNotExist('No table with resource_id {resource_id}'.format(
                resource_id=resource_id))

        if resource_id is None:
            self.model = TableManager().create_table()
        else:
            self.model = TableManager(resource_id).get_model()

    def __enter__(self):
        return self.model

    def __exit__(self, *args, **kwargs): ...


class TableManager:
    APP_NAME = 'core'
    MODEL_NAME = "LocationsForResource{resource_id}"
    TABLE_NAME = "locations_for_resource{resource_id}"

    def __init__(self, resource_id=None):
        self.resource_id = resource_id

    def create_table(self):
        self.resource_id = TableManager._get_new_id_resource_id()

        LocationModel = self.get_model()

        with connection.schema_editor() as schema_editor:
            schema_editor.create_model(LocationModel)

        admin.site.register(LocationModel)

        return LocationModel

    def get_model(self):
        if not self.table_name:
            raise Exception(
                'No table name! Did you forget to specify id of the resource?')

        model_attributes = {
            "point": gis_models.PointField(),
            "timestamp": models.DateTimeField(auto_now_add=True),
            "Meta": type(
                "Meta",
                (),
                {
                    "app_label": TableManager.APP_NAME,
                    "db_table": self.table_name,
                    "ordering": ['-timestamp']

                }
            ),
            "__module__": "database.models"
        }

        LocationModel = type(
            self.model_name,
            (models.Model,),
            model_attributes
        )

        return LocationModel

    @staticmethod
    def destroy_table(table_name):
        with connection.cursor() as cursor:
            cursor.execute(f"DROP TABLE {table_name}")

    @property
    def table_name(self):
        if self.resource_id is not None:
            return TableManager.TABLE_NAME.format(resource_id=self.resource_id)

    @property
    def model_name(self):
        if self.resource_id is not None:
            return TableManager.MODEL_NAME.format(resource_id=self.resource_id)

    @staticmethod
    def get_dynamic_tables():
        all_tables = connection.introspection.table_names()
        dynamic_tables = [
            table_name for table_name in all_tables if table_name.startswith(TableManager.TABLE_NAME.format(resource_id=''))]

        return dynamic_tables

    @staticmethod
    def get_resource_ids():
        tables = TableManager.get_dynamic_tables()
        return [int(table.lstrip("locations_for_resource")) for table in tables]

    @staticmethod
    def _get_new_id_resource_id():
        existing_dynamic_tables = TableManager.get_dynamic_tables()
        resource_id = len(existing_dynamic_tables) + 1

        return resource_id
