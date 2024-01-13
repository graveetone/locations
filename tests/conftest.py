import pytest


@pytest.fixture
def websocket_url():
    return "ws://localhost:8000"


@pytest.fixture
def test_resource_id():
    return 1  # ID=1 -> db should have at least one record


@pytest.fixture
def resources_url(websocket_url, test_resource_id):
    return "{}/ws/resource/{}/".format(websocket_url, test_resource_id)


@pytest.fixture
def locations_url(websocket_url):
    return "{}/ws/location/get-nearby-resources/".format(websocket_url)


@pytest.fixture
def get_location_payload():
    return {
        "action": "get-location",
    }


@pytest.fixture
def get_track_payload():
    return {
        "action": "get-track",
    }


@pytest.fixture
def add_location_payload():
    return {
        "action": "add-location",
        "coordinates": {
            "latitude": 42.12,
            "longitude": 12.42
        }
    }


@pytest.fixture
def get_resources_nearby_payload():
    return {
        "threshold": 100,
        "radius": 50_000,
        "coordinates": {
            "latitude": 42,
            "longitude": 13
        }
    }


@pytest.fixture
def expected_location_keys():
    return ["id", "coordinates", "timestamp"]


@pytest.fixture
def not_existing_resource_id():
    return 0


@pytest.fixture
def not_existing_resource_id_url(websocket_url, not_existing_resource_id):
    return "{}/ws/resource/{}/".format(websocket_url, not_existing_resource_id)


@pytest.fixture
def expected_error_response(not_existing_resource_id):
    return {"error": "No resource with id {}".format(not_existing_resource_id)}
