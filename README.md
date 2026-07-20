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

## Frontend

Start the backend stack first, then run the Vite frontend in a second terminal:

```sh
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173). During local
development, Vite proxies `/v1` requests to the API on port 8000. The frontend
has no browser persistence: areas, challenge dates, and activity logs are read
from and written to the API. Until authentication is added, it bootstraps the
single local user `planner@local`.

To point a production build at a separately hosted API, set `VITE_API_URL` to
that API's origin before building the frontend.

## Tests

Run the end-to-end API suite against an isolated PostgreSQL database:

```sh
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from tests
docker compose -f docker-compose.test.yml down -v
```

The test runner applies Alembic migrations before executing the entity-focused
integration tests. The suite is also runnable locally from `backend` with
`pytest tests -q`, where it uses an isolated SQLite database unless
`TEST_DATABASE_URL` is set.
