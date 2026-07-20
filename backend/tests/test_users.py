from fastapi.testclient import TestClient


def test_create_user_and_reject_duplicate_email(client: TestClient) -> None:
    created = client.post("/v1/users", json={"email": "planner@example.com"})

    assert created.status_code == 201
    assert created.json()["email"] == "planner@example.com"
    assert client.post("/v1/users", json={"email": "planner@example.com"}).status_code == 409
