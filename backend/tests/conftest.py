import os
from datetime import date, timedelta
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import delete
from sqlalchemy.orm import sessionmaker

from app.main import create_app
from app.models import Activity, Area, Challenge, User


def test_database_url(tmp_path_factory: pytest.TempPathFactory) -> str:
    """Use PostgreSQL in Compose, otherwise a physical isolated SQLite test DB."""
    configured_url = os.getenv("TEST_DATABASE_URL")
    if configured_url:
        return configured_url
    return f"sqlite:///{tmp_path_factory.mktemp('database') / 'planner-test.db'}"


@pytest.fixture(scope="session")
def database_url(tmp_path_factory: pytest.TempPathFactory) -> str:
    url = test_database_url(tmp_path_factory)
    config = Config(str(Path(__file__).parents[1] / "alembic.ini"))
    config.set_main_option("sqlalchemy.url", url)
    command.upgrade(config, "head")
    return url


@pytest.fixture
def client(database_url: str):
    """A clean migrated database and HTTP client for every entity test."""
    app = create_app(database_url)
    factory = sessionmaker(bind=app.state.engine)
    with factory.begin() as session:
        session.execute(delete(Activity))
        session.execute(delete(Area))
        session.execute(delete(Challenge))
        session.execute(delete(User))
    with TestClient(app) as test_client:
        yield test_client
    app.state.engine.dispose()


@pytest.fixture
def user(client: TestClient) -> dict:
    response = client.post("/v1/users", json={"email": "planner@example.com"})
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def challenge(client: TestClient, user: dict) -> dict:
    response = client.post("/v1/challenges", json={
        "user_id": user["id"],
        "name": "Interview prep",
        "start_date": (date.today() - timedelta(days=10)).isoformat(),
        "duration_days": 90,
    })
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def area(client: TestClient, challenge: dict) -> dict:
    response = client.post(f"/v1/challenges/{challenge['id']}/areas", json={
        "name": "Leetcode", "target": 150, "starting_count": 9, "icon": "Laptop", "color": "#4f46e5",
    })
    assert response.status_code == 201
    return response.json()
