"""
Database configuration for Todo API.

Provides SQLAlchemy engine and session factory for database operations.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv

load_dotenv()

# Use database URL from environment, default to SQLite for Hugging Face Spaces
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")

# The URL already has the correct driver prefix from .env
database_url = DATABASE_URL

# Use connection pooling for better performance
engine = create_engine(
    database_url,
    echo=False,  # Set to False for production
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=300  # Recycle connections every 5 minutes
)

# Session factory for dependency injection
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """
    FastAPI dependency that provides a database session.

    Each request gets its own database session that is properly closed
    after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
