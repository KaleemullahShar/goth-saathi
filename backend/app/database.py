"""
Database configuration.

Reads DATABASE_URL from the environment. Defaults to local SQLite if unset,
so `python -m app.seed` / `uvicorn app.main:app` still work with zero setup
during local development. In production (Render, etc.) set DATABASE_URL to
a real Postgres connection string — e.g. from a free Neon.tech database —
and everything else (models, queries) works unchanged, since the app uses
the SQLAlchemy ORM throughout rather than SQLite-specific SQL.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./goth_saathi.db")

# Render/Neon/Heroku-style URLs sometimes use the legacy "postgres://"
# scheme, which SQLAlchemy 2.x no longer accepts — normalize it.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
