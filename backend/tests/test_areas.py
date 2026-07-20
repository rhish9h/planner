from fastapi.testclient import TestClient


def test_create_list_update_and_delete_area(client: TestClient, challenge: dict) -> None:
    created = client.post(f"/v1/challenges/{challenge['id']}/areas", json={"name": "Fitness", "target": 90})
    assert created.status_code == 201
    area = created.json()

    listed = client.get(f"/v1/challenges/{challenge['id']}/areas")
    assert listed.status_code == 200
    assert [item["id"] for item in listed.json()] == [area["id"]]

    updated = client.patch(f"/v1/areas/{area['id']}", json={"target": 120, "color": "#22c55e"})
    assert updated.status_code == 200
    assert updated.json()["target"] == 120
    assert updated.json()["color"] == "#22c55e"

    assert client.delete(f"/v1/areas/{area['id']}").status_code == 204
    assert client.get(f"/v1/challenges/{challenge['id']}/areas").json() == []


def test_area_name_is_unique_within_a_challenge(client: TestClient, challenge: dict) -> None:
    payload = {"name": "Fitness", "target": 90}
    assert client.post(f"/v1/challenges/{challenge['id']}/areas", json=payload).status_code == 201
    assert client.post(f"/v1/challenges/{challenge['id']}/areas", json=payload).status_code == 409
