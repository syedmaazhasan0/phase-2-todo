# Database Schema

## Tables

### users

Compatible with Better Auth management - user accounts are managed by the frontend Better Auth system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar | PRIMARY KEY, UNIQUE | Unique user identifier |
| email | varchar | UNIQUE, NOT NULL | User email address |
| name | varchar | NULLABLE | User display name |
| created_at | timestamp | DEFAULT NOW() | Account creation timestamp |

**SQL Definition**:
```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY UNIQUE,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR NULLABLE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### tasks

Stores user tasks with ownership association.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY, AUTO INCREMENT | Unique task identifier |
| user_id | varchar | NOT NULL, FOREIGN KEY | Owner's user ID |
| title | varchar(200) | NOT NULL | Task title |
| description | text | NULLABLE | Optional task description |
| completed | boolean | DEFAULT FALSE | Task completion status |
| created_at | timestamp | DEFAULT NOW() | Creation timestamp |
| updated_at | timestamp | DEFAULT NOW() | Last update timestamp |

**SQL Definition**:
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULLABLE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Relationships

### Foreign Key Constraint
- `tasks.user_id` references `users.id`
- **On Delete**: CASCADE - removes all tasks if user is deleted

**Rationale**: Cascading delete ensures data consistency when a user account is removed.

---

## Indexes

### Performance Indexes

```sql
-- Index for efficient per-user queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Index for status filtering
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- Composite index for common query patterns
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
```

**Rationale**:
- `idx_tasks_user_id`: Accelerates filtering by user_id (most common query)
- `idx_tasks_completed`: Accelerates filtering by completion status
- `idx_tasks_user_completed`: Optimizes queries that filter by both user and status

---

## SQLModel Definitions

### User Model
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### Task Model
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## Database Connection

### Connection String
```
postgresql://neondb_owner:npg_gBchopUF93qM@ep-wild-boat-a74apbwz-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Connection Configuration (db.py)
```python
from sqlmodel import create_engine, SQLModel
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_gBchopUF93qM@ep-wild-boat-a74apbwz-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Async engine for Neon PostgreSQL
engine = create_async_engine(DATABASE_URL, echo=True)

# Async session factory
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# For initialization (non-async)
sync_engine = create_engine(DATABASE_URL.replace("+asyncpg", ""))
```

### Initialization
```python
async def init_db():
    """Create all tables on startup"""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
```

---

## Neon PostgreSQL Specifics

### Connection Requirements
- **SSL Mode**: `require` (enforced for security)
- **Connection Pooling**: Enabled via Neon pooler URL
- **Async Driver**: Use `asyncpg` for async operations

### Best Practices
1. Use async/await patterns for all database operations
2. Implement connection pooling for production
3. Use environment variables for credentials
4. Enable query logging (`echo=True`) during development

---

## Data Migration

### Initial Schema Creation
On first startup, the application should:
1. Connect to the database using DATABASE_URL
2. Execute `SQLModel.metadata.create_all(engine)`
3. Verify all tables and indexes are created

### Schema Evolution
- Add new columns via SQLModel migrations
- For breaking changes, create migration scripts
- Always maintain backward compatibility where possible

---

## Integration Notes

### User Management
- Backend reads users from the database but does NOT create them
- User creation/management is handled by frontend Better Auth
- Backend may create stub users if a valid JWT references a non-existent user

### Data Consistency
- All task queries must include `WHERE user_id = ?` filter
- JWT middleware ensures user_id is always available
- Cascade delete prevents orphaned tasks
