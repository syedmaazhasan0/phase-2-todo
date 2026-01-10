# Data Model: Backend Implementation & Frontend Integration

**Feature**: 001-backend-specs | **Date**: 2026-01-03

## Entity Overview

This feature defines two entities: `User` and `Task`. The `User` entity is managed by Better Auth on the frontend, while the `Task` entity is managed by the FastAPI backend.

## Entity: User

### Purpose
Represents an authenticated user of the application. Managed by Better Auth.

### Table: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | string (varchar) | PRIMARY KEY | Unique user identifier (UUID from Better Auth) |
| `email` | string (varchar) | UNIQUE, NOT NULL | User's email address |
| `name` | string (varchar) | NULLABLE | User's display name |
| `created_at` | datetime | NOT NULL, DEFAULT now() | Account creation timestamp |

### Relationships
- One-to-many with `Task` (one user can have many tasks)

### Notes
- This table is managed by Better Auth on the frontend
- Backend uses `user_id` foreign key reference only
- Backend does not create/update users directly

---

## Entity: Task

### Purpose
Represents a to-do item belonging to a user.

### Table: `tasks`

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | integer | PRIMARY KEY, AUTO INCREMENT | - | Unique task identifier |
| `user_id` | string (varchar) | NOT NULL, FOREIGN KEY | - | Owner of the task (references `users.id`) |
| `title` | string (varchar) | NOT NULL, MIN 1, MAX 200 | - | Task title |
| `description` | string (varchar) | NULLABLE, MAX 1000 | - | Optional task description |
| `completed` | boolean | NOT NULL | false | Task completion status |
| `created_at` | datetime | NOT NULL | now() | Task creation timestamp |
| `updated_at` | datetime | NOT NULL | now() | Last update timestamp |

### Indexes
- `ix_task_user_id` on `user_id` - Optimizes filtering by user
- `ix_task_completed` on `completed` - Optimizes status filtering

### Relationships
- Many-to-one with `User` (many tasks belong to one user)

### Foreign Key Constraints
```
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

**Rationale**: Cascade delete ensures tasks are removed when user is deleted.

### Validation Rules

#### Title
- Required: Yes
- Minimum length: 1 character
- Maximum length: 200 characters
- Trim whitespace: Yes

#### Description
- Required: No
- Maximum length: 1000 characters
- Trim whitespace: Yes

### State Transitions

#### completed field
```
[false] ←→ [true]
```
- Toggle operation allowed by owner
- No other state transitions

### Update Rules
- `created_at`: Set on task creation, never modified
- `updated_at`: Automatically updated on any field modification

---

## Schema Diagram

```
┌─────────────────────────────────────┐
│              users                  │
├─────────────────────────────────────┤
│ id          PK  varchar             │
│ email       UNIQUE varchar          │
│ name        varchar                 │
│ created_at  datetime                │
└──────────────┬──────────────────────┘
               │
               │ 1:N
               │
               ↓
┌─────────────────────────────────────┐
│              tasks                  │
├─────────────────────────────────────┤
│ id          PK  int AUTO_INCREMENT   │
│ user_id     FK  varchar             │
│ title       varchar(200)            │
│ description varchar(1000)            │
│ completed   boolean                 │
│ created_at  datetime                │
│ updated_at  datetime                │
└─────────────────────────────────────┘

Indexes: ix_task_user_id, ix_task_completed
```

---

## SQL Model Definitions

### users table (managed by Better Auth)

Note: This table schema is defined by Better Auth. The backend only references it.

```python
# Backend doesn't define User model directly
# User is managed by Better Auth on frontend
# Backend extracts user_id from JWT claims
```

### tasks table (managed by backend)

```python
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, DateTime, func, Index

class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)

class Task(TaskBase, table=True):
    __tablename__ = "tasks"
    __table_args__ = (
        Index('ix_task_user_id', 'user_id'),
        Index('ix_task_completed', 'completed'),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    completed: bool = Field(default=False)
    created_at: datetime = Field(
        sa_column=Column(DateTime, server_default=func.now())
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime, server_default=func.now(), onupdate=func.now())
    )
```

---

## Query Patterns

### List user's tasks
```sql
SELECT * FROM tasks
WHERE user_id = ?
ORDER BY created_at DESC;
```

### Filter by status
```sql
SELECT * FROM tasks
WHERE user_id = ? AND completed = ?
ORDER BY created_at DESC;
```

### Get single task (with ownership check)
```sql
SELECT * FROM tasks
WHERE id = ? AND user_id = ?;
```

### Create task
```sql
INSERT INTO tasks (user_id, title, description, completed)
VALUES (?, ?, ?, ?);
```

### Update task (with ownership check)
```sql
UPDATE tasks
SET title = ?, description = ?, updated_at = ?
WHERE id = ? AND user_id = ?;
```

### Delete task (with ownership check)
```sql
DELETE FROM tasks
WHERE id = ? AND user_id = ?;
```

### Toggle completion
```sql
UPDATE tasks
SET completed = NOT completed, updated_at = ?
WHERE id = ? AND user_id = ?;
```

---

## Migration Notes

### Initial Setup
- Database tables created automatically on application startup
- Uses `SQLModel.metadata.create_all(engine)` in main.py

### Schema Evolution
- Phase II: Initial schema as defined above
- Phase III: May add tables for chatbot/agent features
- Future: May add additional task fields (due_date, priority, tags)

### Rollback Strategy
- Tables can be dropped and recreated for development
- For production, use proper migration tool (Alembic) in future phases

---

## Security Notes

1. **User Isolation**: All queries MUST include `WHERE user_id = ?` filter
2. **Ownership Verification**: All UPDATE/DELETE operations verify ownership first
3. **Index Privacy**: Use 404 (not 403) for cross-user GET to prevent enumeration
4. **Foreign Key Enforcement**: Database enforces referential integrity via FK constraint
