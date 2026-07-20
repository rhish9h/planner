from datetime import date

from fastapi.testclient import TestClient


def test_create_update_and_load_current_challenge(client: TestClient, user: dict) -> None:
    created = client.post("/v1/challenges", json={
        "user_id": user["id"], "name": "90-Day Challenge", "start_date": "2026-07-01", "duration_days": 90,
    })
    assert created.status_code == 201
    challenge = created.json()

    updated = client.patch(f"/v1/challenges/{challenge['id']}", json={"name": "Focused challenge", "start_date": date.today().isoformat()})
    assert updated.status_code == 200
    assert updated.json()["name"] == "Focused challenge"

    current = client.get("/v1/challenges/current", params={"user_id": user["id"]})
    assert current.status_code == 200
    assert current.json()["id"] == challenge["id"]
    assert current.json()["areas"] == []


def test_challenge_requires_existing_user(client: TestClient) -> None:
    response = client.post("/v1/challenges", json={"user_id": "missing", "start_date": "2026-07-01"})
    assert response.status_code == 404
