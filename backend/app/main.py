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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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


@app.get("/api/health")
def health():
    return {"status": "ok"}
