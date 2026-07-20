import os
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class Base(DeclarativeBase):
    """Base class for all persisted Planner entities."""


def make_engine(database_url: str):
    """Create an engine suitable for PostgreSQL and isolated SQLite test DBs."""
    options = {}
    if database_url.startswith("sqlite"):
        options["connect_args"] = {"check_same_thread": False}
    return create_engine(database_url, future=True, **options)


def database_url_from_env() -> str:
    return os.getenv("DATABASE_URL", "sqlite:///./planner.db")


def session_dependency(factory: sessionmaker[Session]):
    def get_session() -> Generator[Session, None, None]:
        session = factory()
        try:
            yield session
        finally:
            session.close()

    return get_session
