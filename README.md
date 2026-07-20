# Planner

## Run with Docker Compose

The frontend, FastAPI service, and PostgreSQL database run together with Docker
Compose:

```sh
docker compose up --build
```

Open the app at http://localhost:5173. The API is available at
http://localhost:8000; use http://localhost:8000/health to check that it is
running, and http://localhost:8000/docs for interactive API documentation.

The frontend container serves the production Vite build and proxies `/v1`
requests to the API. The database volume (`postgres_data`) persists PostgreSQL
data between container restarts.

## Frontend

For frontend-only development, start the API stack and then run Vite locally:

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

For the Compose setup, frontend API requests are proxied automatically.

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
