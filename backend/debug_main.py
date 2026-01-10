#!/usr/bin/env python3
"""
Server with enhanced error logging for debugging.
"""

import os
import sys
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import traceback
from starlette.requests import Request

from db import engine
from routes.tasks import router as tasks_router
from routes.auth import router as auth_router
from middleware.jwt_auth import verify_jwt

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for application startup/shutdown.
    """
    logger.info("Starting up application...")
    # Startup
    from db import SessionLocal
    from models import User, Task
    from sqlalchemy import text

    db = SessionLocal()
    try:
        # Create tables using SQLModel metadata
        from sqlmodel import SQLModel
        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        logger.error(traceback.format_exc())
        raise
    finally:
        db.close()

    yield

    # Shutdown
    logger.info("Shutting down application...")

app = FastAPI(
    title="Todo API",
    description="Backend API for Todo application",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["GET", "PUT", "POST", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")
    try:
        response = await call_next(request)
    except Exception as e:
        logger.error(f"Exception in request processing: {e}")
        logger.error(traceback.format_exc())
        raise
    logger.info(f"Response status: {response.status_code}")
    return response

# JWT authentication middleware - validates all requests
# This middleware must be added AFTER CORS middleware to properly handle CORS headers
app.add_middleware(BaseHTTPMiddleware, dispatch=verify_jwt)

# Include routers
app.include_router(auth_router)
app.include_router(tasks_router)

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Todo API is running"}

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("debug_main:app", host="127.0.0.1", port=8000, reload=True)