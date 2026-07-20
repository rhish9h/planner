from fastapi import FastAPI
from sqlalchemy.orm import sessionmaker

from .api import build_router
from .database import database_url_from_env, make_engine, session_dependency


def create_app(database_url: str | None = None) -> FastAPI:
    """Build the API with an injectable database URL for integration tests."""
    engine = make_engine(database_url or database_url_from_env())
    factory = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    application = FastAPI(title="Planner API")
    application.state.engine = engine
    application.include_router(build_router(session_dependency(factory)))

    @application.get("/health", tags=["health"])
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return application


app = create_app()
