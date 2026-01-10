# Quickstart: Backend Implementation & Frontend Integration

**Feature**: 001-backend-specs | **Date**: 2026-01-03

## Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- Neon PostgreSQL account (free tier works)
- Node.js 18+ (for frontend integration testing)
- Git

## Setup Guide

### Step 1: Create Backend Directory

```bash
# From project root
mkdir backend
cd backend
```

### Step 2: Create Python Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install fastapi uvicorn sqlmodel pydantic pyjwt python-dotenv
```

Or create a `requirements.txt`:

```txt
fastapi==0.109.0
uvicorn==0.27.0
sqlmodel==0.0.14
pydantic==2.5.3
pyjwt==2.8.0
python-dotenv==1.0.0
httpx==0.26.0  # For testing
pytest==7.4.4   # For testing
pytest-asyncio==0.23.3  # For async testing
```

Then install:

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

Create `.env` file in backend directory:

```bash
# Shared secret - MUST match frontend's BETTER_AUTH_SECRET
BETTER_AUTH_SECRET=9LwoNRSxkGnLUquJlXdVmRCg3cIjSnhi

# Neon PostgreSQL connection string
DATABASE_URL=postgresql://neondb_owner:npg_gBchopUF93qM@ep-wild-boat-a74apbwz-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Important**: Keep this file secret. Never commit to Git. Add to `.gitignore`.

### Step 5: Create Project Structure

```bash
mkdir middleware
mkdir routes
```

The structure should be:

```
backend/
├── main.py
├── models.py
├── schemas.py
├── db.py
├── middleware/
│   └── jwt_auth.py
├── routes/
│   └── tasks.py
├── .env
└── requirements.txt
```

### Step 6: Create Database Configuration (db.py)

```python
import os
from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Create async engine
engine = create_async_engine(
    DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
    echo=True  # Set to False in production
)

# Create async session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Dependency for routes
async def get_db():
    async with async_session() as session:
        yield session
```

### Step 7: Create Models (models.py)

```python
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, DateTime, func, Index

class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    __table_args__ = (
        Index('ix_task_user_id', 'user_id'),
        Index('ix_task_completed', 'completed'),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(
        sa_column=Column(DateTime, server_default=func.now())
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime, server_default=func.now(), onupdate=func.now())
    )
```

### Step 8: Create Schemas (schemas.py)

```python
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = None

class TaskResponse(TaskBase):
    id: int
    user_id: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

### Step 9: Create JWT Middleware (middleware/jwt_auth.py)

```python
import os
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")

security = HTTPBearer()

async def verify_jwt(request: Request, call_next):
    """Middleware to verify JWT token on every request."""
    try:
        # Extract Authorization header
        credentials: HTTPAuthorizationCredentials = await security(request)
        token = credentials.credentials

        # Verify and decode JWT
        payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=["HS256"])

        # Extract user info
        user_id = payload.get("sub")
        email = payload.get("email")
        name = payload.get("name")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id"
            )

        # Attach to request state
        request.state.current_user = {
            "id": user_id,
            "email": email,
            "name": name
        }

    except HTTPException:
        raise
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    response = await call_next(request)
    return response

def get_current_user(request: Request) -> dict:
    """Dependency to get current user from request state."""
    return request.state.current_user
```

### Step 10: Create Task Routes (routes/tasks.py)

```python
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload

from ..db import get_db
from ..models import Task
from ..schemas import TaskCreate, TaskUpdate, TaskResponse
from ..middleware.jwt_auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    status: str = Query("all", regex="^(all|pending|completed)$"),
    sort: str = Query("created", regex="^(created|title)$"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List all tasks for the authenticated user."""
    query = select(Task).where(Task.user_id == current_user["id"])

    # Apply status filter
    if status == "pending":
        query = query.where(Task.completed == False)
    elif status == "completed":
        query = query.where(Task.completed == True)

    # Apply sort
    if sort == "title":
        query = query.order_by(Task.title)
    else:  # created
        query = query.order_by(Task.created_at.desc())

    result = await db.execute(query)
    tasks = result.scalars().all()
    return tasks

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new task."""
    task = Task(
        user_id=current_user["id"],
        title=task_data.title,
        description=task_data.description
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific task by ID."""
    query = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user["id"]
    )
    result = await db.execute(query)
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
    """Update a task (partial update)."""
    query = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user["id"]
    )
    result = await db.execute(query)
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

    await db.commit()
    await db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a task."""
    query = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user["id"]
    )
    result = await db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    await db.delete(task)
    await db.commit()

@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_complete(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Toggle task completion status."""
    query = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user["id"]
    )
    result = await db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    task.completed = not task.completed

    await db.commit()
    await db.refresh(task)
    return task
```

### Step 11: Create Main App (main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
import uvicorn

from db import engine, async_session
from models import Task
from middleware.jwt_auth import verify_jwt
from routes.tasks import router as tasks_router

app = FastAPI(
    title="Todo API",
    description="Backend API for Todo application",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT middleware
app.middleware("http")(verify_jwt)

# Include routers
app.include_router(tasks_router)

@app.on_event("startup")
async def on_startup():
    """Create database tables on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "Todo API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

### Step 12: Run the Backend

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at:
- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

### Step 13: Install Additional Dependencies

Note: The code above uses `asyncpg` for async PostgreSQL. Install it:

```bash
pip install asyncpg
```

Update `requirements.txt`:

```txt
fastapi==0.109.0
uvicorn==0.27.0
sqlmodel==0.0.14
pydantic==2.5.3
pyjwt==2.8.0
python-dotenv==1.0.0
asyncpg==0.29.0
httpx==0.26.0
pytest==7.4.4
pytest-asyncio==0.23.3
```

## Frontend Integration

### Step 14: Configure Frontend Environment

In the frontend directory, create or update `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Important**: The frontend must use the same `BETTER_AUTH_SECRET` that the backend uses.

### Step 15: Create API Client (frontend/src/lib/api.ts)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Get JWT from Better Auth session
const getAuthToken = (): string | null => {
  // This depends on how Better Auth stores the token
  // Adjust based on your Better Auth configuration
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('better-auth.session');
    return session ? JSON.parse(session).token : null;
  }
  return null;
};

export interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, error.detail || 'Request failed');
  }

  return response;
};

export const tasksApi = {
  list: async (status?: 'all' | 'pending' | 'completed', sort?: 'created' | 'title'): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (sort) params.append('sort', sort);

    const query = params.toString() ? `?${params}` : '';
    const response = await apiRequest(`/api/tasks${query}`);
    const data = await response.json();
    return data.tasks || data;
  },

  get: async (id: number): Promise<Task> => {
    const response = await apiRequest(`/api/tasks/${id}`);
    return response.json();
  },

  create: async (task: TaskCreate): Promise<Task> => {
    const response = await apiRequest('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
    return response.json();
  },

  update: async (id: number, task: TaskUpdate): Promise<Task> => {
    const response = await apiRequest(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  toggleComplete: async (id: number): Promise<Task> => {
    const response = await apiRequest(`/api/tasks/${id}/complete`, {
      method: 'PATCH',
    });
    return response.json();
  },
};
```

## Testing

### Manual Testing with cURL

First, get a JWT from the frontend (Better Auth), then:

```bash
# List tasks
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/tasks

# Create a task
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","description":"Test description"}' \
  http://localhost:8000/api/tasks

# Get a task
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/tasks/1

# Update a task
curl -X PUT \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title"}' \
  http://localhost:8000/api/tasks/1

# Delete a task
curl -X DELETE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/tasks/1

# Toggle completion
curl -X PATCH \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/tasks/1/complete
```

## Troubleshooting

### JWT Verification Fails
- Ensure `BETTER_AUTH_SECRET` is identical in both frontend and backend
- Check the JWT token is being sent in the `Authorization: Bearer` header
- Verify the token hasn't expired

### Database Connection Errors
- Verify `DATABASE_URL` in `.env` is correct
- Ensure Neon PostgreSQL instance is running
- Check SSL settings (`sslmode=require`)

### CORS Errors
- Verify `allow_origins` includes `http://localhost:3000`
- Check the frontend is running on the correct port

### 401 Unauthorized on All Requests
- Check JWT middleware is properly registered
- Verify the `Authorization` header format is correct
- Ensure the token signature is valid

## Next Steps

1. Implement the complete code following the templates above
2. Run the backend: `uvicorn main:app --reload --port 8000`
3. Test endpoints via Swagger UI at `http://localhost:8000/docs`
4. Integrate with frontend using the API client
5. Run integration tests for user data isolation
6. Deploy to production when ready

## Documentation

- API Docs: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`
- Spec: `/specs/001-backend-specs/spec.md`
- Data Model: `/specs/001-backend-specs/data-model.md`
- API Contract: `/specs/001-backend-specs/contracts/tasks-api.md`
