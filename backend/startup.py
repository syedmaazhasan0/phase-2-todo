#!/usr/bin/env python
"""
Startup script for Hugging Face Spaces deployment.
"""

import os
import sys
import time
import logging
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

# Add backend directory to path
sys.path.append('/app')

from main import app
from db import engine
from models import User, Task

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def wait_for_db(max_attempts=30, delay=2):
    """Wait for database to be ready."""
    for attempt in range(max_attempts):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
                logger.info("Database connection successful")
                return True
        except OperationalError as e:
            logger.warning(f"Attempt {attempt + 1}: Could not connect to database: {e}")
            if attempt == max_attempts - 1:
                raise
            time.sleep(delay)
    return False

def create_tables():
    """Create database tables."""
    try:
        from sqlmodel import SQLModel
        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))

    logger.info("Starting application initialization...")

    # Wait for database
    logger.info("Waiting for database connection...")
    wait_for_db()

    # Create tables
    logger.info("Creating database tables...")
    create_tables()

    logger.info(f"Starting server on port {port}...")

    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=port)