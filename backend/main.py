"""
Main FastAPI application for Todo API.

Sets up the FastAPI app with CORS middleware, JWT authentication,
and includes task routes.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from db import engine
from routes.tasks import router as tasks_router
from routes.auth import router as auth_router
from middleware.jwt_auth import verify_jwt

app = FastAPI(
    title="Todo API",
    description="Backend API for Todo application",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,
    allow_methods=["GET", "PUT", "POST", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# JWT authentication middleware - validates all requests
# This middleware must be added AFTER CORS middleware to properly handle CORS headers
app.add_middleware(BaseHTTPMiddleware, dispatch=verify_jwt)

# Include routers
app.include_router(auth_router)
app.include_router(tasks_router)


@app.on_event("startup")
def on_startup():
    """
    Create database tables on startup if they don't exist.

    This ensures the database schema is ready for the application.
    """
    from db import SessionLocal
    from models import User, Task
    from sqlalchemy import text

    db = SessionLocal()
    try:
        # Create tables using SQLModel metadata
        # Use text() to execute raw SQL for table creation
        from sqlmodel import SQLModel
        SQLModel.metadata.create_all(engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        raise
    finally:
        db.close()


@app.get("/")
async def root():
    """
    Root endpoint.

    Returns a welcome message indicating the API is running.
    """
    return {"message": "Todo API is running"}


@app.get("/health")
async def health():
    """
    Health check endpoint.

    Returns the health status of the API.
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
