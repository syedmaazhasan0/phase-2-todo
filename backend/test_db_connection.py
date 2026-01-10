#!/usr/bin/env python3
"""
Test script to check database connectivity and troubleshoot the Neon connection.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL")
print(f"DATABASE_URL: {DATABASE_URL}")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL is not set in environment variables!")
    exit(1)

try:
    # Create engine
    print("\nCreating engine...")
    engine = create_engine(DATABASE_URL, echo=True)

    # Test connection
    print("Testing connection...")
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print(f"Connection successful! Result: {result.fetchone()}")

    print("\nDatabase connection test passed!")

except SQLAlchemyError as e:
    print(f"\nSQLAlchemy Error: {e}")
    print(f"Error type: {type(e).__name__}")

except Exception as e:
    print(f"\nGeneral Error: {e}")
    print(f"Error type: {type(e).__name__}")