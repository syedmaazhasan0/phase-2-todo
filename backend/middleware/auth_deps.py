"""
Authentication dependencies for Todo API.

Provides reusable dependencies for route authentication.
"""

from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from db import get_db
from models import User
from sqlalchemy import select


def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> dict:
    """
    FastAPI dependency to get the authenticated user from JWT token.

    NOTE: The JWT is already validated by the verify_jwt middleware.
    This function retrieves the user info from request.state (attached by middleware).

    Args:
        request: FastAPI request object with user info from middleware
        db: Database session dependency

    Returns:
        dict with user id, email, and name if token is valid and user exists

    Raises:
        401 Unauthorized: If token is invalid, expired, or user doesn't exist
    """
    # User info should already be attached by JWT middleware
    if not hasattr(request.state, "current_user"):
        # This should never happen if middleware is working correctly
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required: user not found in request state",
            headers={"WWW-Authenticate": "Bearer"},
        )

    current_user_id = request.state.current_user["id"]

    # Verify user still exists in database
    result = db.execute(
        select(User).where(User.id == current_user_id)
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found in database",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Return user dict with id, email, and name
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name
    }