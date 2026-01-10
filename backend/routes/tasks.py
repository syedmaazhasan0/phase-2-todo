"""
Task CRUD routes for Todo API.

Handles all task-related endpoints including create, list, get,
update, delete, and toggle completion.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select

from db import get_db
from models import Task
from schemas import TaskCreate, TaskUpdate, TaskResponse
from middleware.auth_deps import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    status: str = Query("all", pattern="^(all|pending|completed)$"),
    sort: str = Query("created", pattern="^(created|title)$"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    List all tasks for the authenticated user.

    Query Parameters:
        - status: Filter by completion status (all, pending, completed)
        - sort: Sort order (created = newest first, title = alphabetical)

    Returns:
        List of tasks belonging to the authenticated user only.
    """
    query = select(Task).where(Task.user_id == current_user["id"])

    # Apply status filter
    if status == "pending":
        query = query.where(Task.completed == False)
    elif status == "completed":
        query = query.where(Task.completed == True)

    # Apply sort
    if sort == "title":
        query = query.order_by(Task.title)
    else:  # created (default)
        query = query.order_by(Task.created_at.desc())

    result = db.execute(query)
    tasks = result.scalars().all()

    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new task for the authenticated user.

    Request Body:
        - title: Required, 1-200 characters
        - description: Optional, max 1000 characters

    Returns:
        Created task with id, user_id from JWT, and timestamps.
    """
    task = Task(
        user_id=current_user["id"],
        title=task_data.title,
        description=task_data.description
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific task by ID.

    Path Parameters:
        - task_id: The ID of the task to retrieve

    Returns:
        Task details if the task exists and belongs to the authenticated user.

    Raises:
        404 Not Found: If task doesn't exist or doesn't belong to user
    """
    query = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user["id"]
    )
    result = db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update a task (partial update).

    Path Parameters:
        - task_id: The ID of the task to update

    Request Body:
        - title: Optional, 1-200 characters
        - description: Optional, max 1000 characters
        - completed: Optional boolean

    Returns:
        Updated task with updated_at timestamp.

    Raises:
        403 Forbidden: If task belongs to another user
        404 Not Found: If task doesn't exist
        422 Validation Error: If provided fields are invalid
    """
    # Get task and verify ownership
    query = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user["id"]
    )
    result = db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update fields if provided
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.completed is not None:
        task.completed = task_update.completed

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a task.

    Path Parameters:
        - task_id: The ID of the task to delete

    Returns:
        204 No Content on successful deletion.

    Raises:
        403 Forbidden: If task belongs to another user
        404 Not Found: If task doesn't exist
    """
    # Get task and verify ownership
    query = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user["id"]
    )
    result = db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_complete(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Toggle task completion status.

    Path Parameters:
        - task_id: The ID of the task to toggle

    Returns:
        Updated task with toggled completed status and updated_at timestamp.

    Raises:
        403 Forbidden: If task belongs to another user
        404 Not Found: If task doesn't exist
    """
    # Get task and verify ownership
    query = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user["id"]
    )
    result = db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Toggle completed status
    task.completed = not task.completed

    db.commit()
    db.refresh(task)
    return task
