#!/usr/bin/env python3
"""
Debug server to catch and display errors during authentication requests.
"""

import sys
import os
import traceback
from contextlib import redirect_stderr
from io import StringIO

# Add current directory to path to import modules
sys.path.insert(0, os.path.dirname(__file__))

# Import the main app
from main import app
from fastapi.testclient import TestClient

def test_register():
    """Test the registration endpoint with detailed error reporting."""
    print("Testing registration endpoint...")

    # Create a test client
    client = TestClient(app)

    # Test data
    test_user = {
        "email": "test@example.com",
        "password": "testpass123",
        "name": "Test User"
    }

    try:
        response = client.post("/api/auth/register", json=test_user)
        print(f"Response Status: {response.status_code}")
        print(f"Response Text: {response.text}")

        if response.status_code != 200:
            print("Request failed. Full response:")
            print(response.content)

    except Exception as e:
        print(f"Exception occurred: {e}")
        print(f"Exception type: {type(e).__name__}")
        print("Full traceback:")
        traceback.print_exc()

if __name__ == "__main__":
    test_register()