"""
Database configuration.

Uses SQLite for this local/prototype build. In the production architecture
(see PRD Section 16/17) this is PostgreSQL with row-level security for
village/department scoping — SQLite is a drop-in stand-in here so the app
runs with zero external infrastructure. The SQLAlchemy models are written
in a way that maps cleanly onto the Postgres schema in PRD Section 18.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./goth_saathi.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
