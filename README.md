# Planner

## Backend

The FastAPI service and PostgreSQL database run together with Docker Compose:

```sh
docker compose up --build
```

The API is available at http://localhost:8000. Use http://localhost:8000/health
to check that it is running; it returns `{"status":"ok"}`. Interactive API
documentation is available at http://localhost:8000/docs.

`docker-compose.yml` is kept at the repository root so a frontend service can
be added later. The database volume (`postgres_data`) persists PostgreSQL data
between container restarts. Alembic and SQLAlchemy are installed in the backend
image for the upcoming data-model and migration work.
