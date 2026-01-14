import os
from main import app

# This file serves as the entry point for Hugging Face Spaces
# The FastAPI app instance is imported from main.py
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
else:
    # When run in a container environment (like Hugging Face Spaces)
    # The app will be served by gunicorn or similar
    pass