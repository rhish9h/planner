from datetime import date, timedelta

from fastapi.testclient import TestClient


def test_create_edit_list_calendar_and_delete_activity(client: TestClient, challenge: dict, area: dict) -> None:
    today = date.today()
    created = client.post(f"/v1/areas/{area['id']}/activities", json={
        "activity_date": today.isoformat(), "description": "Two Sum II", "url": "https://example.com/two-sum",
    })
    assert created.status_code == 201
    activity = created.json()

    updated = client.patch(f"/v1/activities/{activity['id']}", json={
        "activity_date": today.isoformat(), "description": "Two Sum II — edited", "url": "https://example.com/notes",
    })
    assert updated.status_code == 200
    assert updated.json()["description"].endswith("edited")

    history = client.get(f"/v1/areas/{area['id']}/activities?page=1&page_size=5")
    assert history.status_code == 200
    assert [item["id"] for item in history.json()] == [activity["id"]]

    calendar_day = client.get(f"/v1/challenges/{challenge['id']}/activities", params={"date": today.isoformat()})
    assert calendar_day.status_code == 200
    assert calendar_day.json()[0]["id"] == activity["id"]

    assert client.delete(f"/v1/activities/{activity['id']}").status_code == 204
    assert client.get(f"/v1/areas/{area['id']}/activities").json() == []


def test_activity_rejects_future_date(client: TestClient, area: dict) -> None:
    response = client.post(f"/v1/areas/{area['id']}/activities", json={"activity_date": (date.today() + timedelta(days=1)).isoformat()})
    assert response.status_code == 422
