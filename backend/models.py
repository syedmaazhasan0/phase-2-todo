"""
Database models for Todo API.

Defines SQLModel classes for database tables.
"""

import uuid
from typing import Optional, Callable
from datetime import datetime
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import String, DateTime, func, Index
from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(SQLModel, table=True):
    """
    User model for authentication.

    Represents an authenticated user in the system.
    """
    __tablename__ = "users"
    __table_args__ = (
        Index('ix_user_email', 'email', unique=True),
    )

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    password: str
    created_at: datetime = Field(
        sa_column=Column(DateTime, server_default=func.now())
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime, server_default=func.now(), onupdate=func.now())
    )


class Task(SQLModel, table=True):
    """
    Task model for todo items.

    Represents a to-do item belonging to a user.
    """
    __tablename__ = "tasks"
    __table_args__ = (
        Index('ix_task_user_id', 'user_id'),
        Index('ix_task_completed', 'completed'),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(
        sa_column=Column(DateTime, server_default=func.now())
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime, server_default=func.now(), onupdate=func.now())
    )
