import os
import json
import uuid
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


def _import_sindh_villages():
    """
    One-time bulk import of ~5,900 real Sindh villages (sourced from
    OpenStreetMap, spatially matched against UN OCHA's official tehsil
    boundaries -- see app/data/sindh_villages.json). Guarded by a village
    count check so it only runs once against a fresh/near-empty database,
    not on every serverless cold start.
    """
    inspector = inspect(engine)
    if "villages" not in inspector.get_table_names():
        return

    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM villages")).scalar()

    if count is not None and count > 500:
        return  # already imported

    data_path = os.path.join(os.path.dirname(__file__), "data", "sindh_villages.json")
    if not os.path.exists(data_path):
        return

    with open(data_path, encoding="utf-8") as f:
        villages = json.load(f)

    with engine.begin() as conn:
        # Avoid re-inserting rows that already exist (e.g. the original
        # seeded pilot village, or a partial import from a prior deploy).
        existing = conn.execute(text("SELECT name, district, tehsil FROM villages")).fetchall()
        existing_keys = {(r[0], r[1], r[2]) for r in existing}

        rows = [
            {
                "id": str(uuid.uuid4()),
                "name": v["name"],
                "district": v["district"],
                "tehsil": v["tehsil"],
                "union_council": None,
            }
            for v in villages
            if (v["name"], v["district"], v["tehsil"]) not in existing_keys
        ]

        if rows:
            conn.execute(
                text(
                    "INSERT INTO villages (id, name, district, tehsil, union_council) "
                    "VALUES (:id, :name, :district, :tehsil, :union_council)"
                ),
                rows,
            )


_import_sindh_villages()

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
