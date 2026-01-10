"""
Authentication routes for Todo API.

Handles user registration, login, and JWT token generation.
"""

import os
import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from sqlalchemy import select
from passlib.context import CryptContext

from db import get_db
from models import User, pwd_context
from schemas import UserCreate, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

# JWT Configuration
JWT_SECRET = os.getenv("BETTER_AUTH_SECRET")
if not JWT_SECRET:
    raise ValueError("BETTER_AUTH_SECRET environment variable is not set")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Create a JWT access token.

    Args:
        data: Data to encode in the token (typically user info)
        expires_delta: Token expiration time (defaults to 30 minutes)

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against

    Returns:
        True if passwords match, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """
    Hash a plain text password.

    Args:
        password: Plain text password to hash

    Returns:
        Hashed password string
    """
    # Truncate password to 72 bytes to comply with bcrypt limit
    # This is a bcrypt limitation - passwords longer than 72 bytes will be truncated
    truncated_password = password[:72] if len(password.encode('utf-8')) > 72 else password
    return pwd_context.hash(truncated_password)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.

    Request Body:
        - email: User's email address (must be unique)
        - name: User's display name
        - password: User's password (will be hashed)

    Returns:
        Created user information (excluding password) and JWT token.

    Raises:
        400 Bad Request: If email already exists or password is invalid
    """
    # Validate password length (bcrypt has 72 byte limit)
    if len(user_data.password.encode('utf-8')) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be 72 bytes or less"
        )

    # Check if user already exists
    result = db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        password=hashed_password
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT token.

    Request Body:
        - email: User's email address
        - password: User's password

    Returns:
        JWT access token for authentication.

    Raises:
        401 Unauthorized: If email or password is incorrect
    """
    # Validate password length (bcrypt has 72 byte limit)
    if len(user_data.password.encode('utf-8')) > 72:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password too long",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Find user by email
    result = db.execute(
        select(User).where(User.email == user_data.email)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "name": user.name},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token}


async def get_current_user_from_token(
    token: str = Depends(HTTPBearer(auto_error=True)),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current user from JWT token.

    Args:
        token: Bearer token from Authorization header
        db: Database session dependency

    Returns:
        User object if token is valid and user exists

    Raises:
        401 Unauthorized: If token is invalid, expired, or user doesn't exist
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token.credentials, JWT_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    return user


@router.get("/me", response_model=UserResponse)
async def get_current_user_endpoint(
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get current user information from JWT token.

    Authorization:
        Bearer token in Authorization header

    Returns:
        Current user information (excluding password).

    Raises:
        401 Unauthorized: If token is invalid or expired
    """
    return current_user


@router.post("/logout")
async def logout():
    """
    Logout endpoint.

    In a stateless JWT system, this endpoint doesn't actually invalidate the token
    on the server side. The client should remove the token from local storage.
    This endpoint exists for API consistency and future token blacklisting features.

    Returns:
        Success message confirming logout.
    """
    return {"message": "Successfully logged out"}