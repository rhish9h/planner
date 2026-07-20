from fastapi import FastAPI


app = FastAPI(title="Planner API")


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Report that the API process is available."""
    return {"status": "ok"}
