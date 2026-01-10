#!/usr/bin/env python3
"""
Simple test to verify the backend server can start properly.
"""

import asyncio
import signal
import sys
import os
import threading
import time

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_startup():
    """Test the application startup process."""
    print("Testing application startup...")

    try:
        # Import main module to test imports
        from main import app
        print("+ Successfully imported main app")

        # Test that routes are properly defined
        routes = [route.path for route in app.routes]
        auth_routes = [r for r in routes if 'auth' in r.lower()]
        print(f"+ Found auth routes: {auth_routes}")

        # Test the database connection
        from db import engine
        from sqlalchemy import text

        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("+ Database connection successful")

        print("+ All basic checks passed - backend should start correctly")
        return True

    except Exception as e:
        print(f"- Error during startup test: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_startup()
    if success:
        print("\nApplication structure is valid. Ready to start server.")
    else:
        print("\nApplication has issues that need to be fixed.")
        sys.exit(1)