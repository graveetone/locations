import json
import websockets
import pytest


def check_keys_are_present(source, keys_to_check):
    assert sorted(list(source.keys())) == sorted(keys_to_check)


def check_values_are_correct(expected, actual):
    for key, expected_value in expected.items():
        assert actual[key] == expected_value


@pytest.mark.asyncio
async def test_ping(ping_url):
    async with websockets.connect(ping_url) as websocket:
        response = await websocket.recv()
        assert response == "pong"


@pytest.mark.asyncio
@pytest.mark.usefixtures("expected_location_keys")
async def test_get_location(resources_url, get_location_payload, expected_location_keys):
    async with websockets.connect(resources_url) as websocket:
        payload = json.dumps(get_location_payload)
        await websocket.send(payload)

        response = await websocket.recv()
        response = json.loads(response)

        assert type(response) is dict
        check_keys_are_present(response, expected_location_keys)


@pytest.mark.asyncio
@pytest.mark.usefixtures("expected_location_keys")
async def test_get_track(resources_url, get_track_payload, expected_location_keys):
    async with websockets.connect(resources_url) as websocket:
        payload = json.dumps(get_track_payload)
        await websocket.send(payload)

        response = await websocket.recv()
        response = json.loads(response)

        assert type(response) is list

        first_location_from_track = response[0]
        assert type(first_location_from_track) is dict

        # keys = expected_location_keys
        check_keys_are_present(first_location_from_track,
                               expected_location_keys)


@pytest.mark.asyncio
@pytest.mark.usefixtures("expected_location_keys")
async def test_add_location(resources_url, add_location_payload, expected_location_keys):
    async with websockets.connect(resources_url) as websocket:
        payload = json.dumps(add_location_payload)
        await websocket.send(payload)

        response = await websocket.recv()
        response = json.loads(response)

        assert type(response) is dict
        # keys = expected_location_keys
        check_keys_are_present(response, expected_location_keys)
        check_values_are_correct(
            add_location_payload["coordinates"], response["coordinates"])


@pytest.mark.asyncio
async def test_get_resources_nearby(resources_url, locations_url, add_location_payload, get_resources_nearby_payload, test_resource_id):
    async with websockets.connect(resources_url) as websocket:
        payload = json.dumps(add_location_payload)
        await websocket.send(payload)

    async with websockets.connect(locations_url) as websocket:
        payload = json.dumps(get_resources_nearby_payload)
        await websocket.send(payload)

        response = await websocket.recv()
        response = json.loads(response)

        assert type(response) is list
        assert test_resource_id in response


@pytest.mark.asyncio
async def test_no_resource(not_existing_resource_id_url, expected_error_response):
    async with websockets.connect(not_existing_resource_id_url) as websocket:
        response = await websocket.recv()
        response = json.loads(response)

        assert type(response) is dict
        assert response == expected_error_response
