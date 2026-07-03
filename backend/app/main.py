import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routers import auth, users, complaints, announcements, notifications, analytics

Base.metadata.create_all(bind=engine)

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
