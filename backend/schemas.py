"""
Pydantic schemas for request/response validation.

Defines models for validating incoming requests and formatting responses.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: str
    name: str


class UserCreate(UserBase):
    """
    Schema for creating a new user.

    Email, name, and password are required.
    """
    password: str


class UserLogin(BaseModel):
    """
    Schema for user login.

    Email and password are required.
    """
    email: str
    password: str


class UserResponse(UserBase):
    """
    Schema for user response.

    Includes all user fields except password.
    """
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """
    Schema for JWT token response.

    Returns access token and token type.
    """
    access_token: str
    token_type: str = "bearer"


class TaskBase(BaseModel):
    """Base task schema with common fields."""
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)


class TaskCreate(TaskBase):
    """
    Schema for creating a new task.

    Title is required, description is optional.
    """
    pass


class TaskUpdate(BaseModel):
    """
    Schema for updating an existing task.

    All fields are optional for partial updates.
    """
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = None


class TaskResponse(TaskBase):
    """
    Schema for task response.

    Includes all task fields including timestamps and user ownership.
    """
    id: int
    user_id: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
