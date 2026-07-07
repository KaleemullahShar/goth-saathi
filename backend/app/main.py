import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from app.database import Base, engine
from app.routers import auth, users, complaints, announcements, notifications, analytics

Base.metadata.create_all(bind=engine)


def _run_lightweight_migrations():
    """
    This project doesn't yet use a real migration tool (Alembic). For small,
    additive schema changes like a new nullable column, this idempotent
    check-and-add step avoids requiring a manual database console visit
    every time a model gains a field. For anything beyond simple additive
    columns, introduce Alembic instead of extending this function.
    """
    inspector = inspect(engine)
    if "villages" in inspector.get_table_names():
        existing_columns = {c["name"] for c in inspector.get_columns("villages")}
        if "tehsil" not in existing_columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE villages ADD COLUMN tehsil VARCHAR"))

        # Backfill the one known seed village created before this column
        # existed, so it doesn't sit permanently blank in the new
        # District -> Tehsil -> Village dropdown.
        with engine.begin() as conn:
            conn.execute(
                text(
                    "UPDATE villages SET tehsil = 'Rohri' "
                    "WHERE name = 'Goth Muhammad Panhwar' AND tehsil IS NULL"
                )
            )


_run_lightweight_migrations()

app = FastAPI(
    title="Goth Saathi API",
    description="Phase 1 civic backbone: auth, complaints, announcements, notifications.",
    version="0.1.0",
)

# ALLOWED_ORIGINS is a comma-separated list, e.g.
# "https://goth-saathi.vercel.app,http://localhost:3000"
# Defaults to localhost only, so nothing changes for local development.
_origins_env = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(complaints.router)
app.include_router(announcements.router)
app.include_router(notifications.router)
app.include_router(analytics.router)


@app.on_event("startup")
def auto_seed():
    """
    If AUTO_SEED=true is set (intended for the very first deploy against a
    fresh production database only), seeds one pilot village + demo accounts
    on startup. Safe to leave set — app.seed.run() is idempotent and skips
    seeding if a village already exists. Off by default so a local dev
    server never seeds unexpectedly.
    """
    if os.environ.get("AUTO_SEED", "false").lower() == "true":
        from app.seed import run as seed_run
        seed_run()


@app.get("/api/health")
def health():
    return {"status": "ok"}
