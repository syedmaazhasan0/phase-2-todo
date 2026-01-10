---
id: 001
title: Create Backend Specifications
stage: spec
date: 2026-01-03
surface: agent
model: claude-opus-4.5-20251101
feature: 001-backend-specs
branch: 001-backend-specs
user: unknown
command: /sp.specify
labels: ["backend", "specification", "jwt", "fastapi"]
links:
  spec: specs/overview-backend.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/overview-backend.md
 - specs/api/rest-endpoints.md
 - specs/database/schema.md
 - specs/features/task-crud-backend.md
 - specs/features/authentication-backend.md
tests:
 - None
---

## Prompt

Create the following backend specification files one by one for the Hackathon II Phase II Todo Full-Stack Web Application. Generate each file completely and separately, following the exact structure and requirements from the project document (Python FastAPI, SQLModel ORM, Neon Serverless PostgreSQL with provided DATABASE_URL, Better Auth JWT integration with shared BETTER_AUTH_SECRET, strict user isolation, stateless auth, Pydantic models, HTTP exceptions, full backend implementation ready for frontend integration via JWT).

Use these environment details in specs where relevant:
- BETTER_AUTH_SECRET = 9LwoNRSxkGnLUquJlXdVmRCg3cIjSnhi (shared with frontend for JWT signing/verification)
- DATABASE_URL = postgresql://neondb_owner:npg_gBchopUF93qM@ep-wild-boat-a74apbwz-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require (for Neon PostgreSQL connection)
- BETTER_AUTH_URL = http://localhost:3000 (for auth reference, but backend verifies independently)

1. File: specs/overview-backend.md

# Backend Overview - Todo Full-Stack Web Application (Phase II)

## Purpose
Develop a secure RESTful API backend with FastAPI for multi-user todo management, persistent storage in Neon PostgreSQL, and JWT-based authentication integration with frontend Better Auth for user isolation.

## Current Phase
Phase II: Full backend implementation # Core Principles
- Stateless authentication: Verify JWT from frontend on every request, no sessions
- User isolation: All queries filtered by user_id extracted from verified JWT
- Error handling: Use HTTPException for 401 (unauthorized), 404 (not found), 422 (validation errors)
- Validation: Title required (1-200 chars), description optional (max 1000 chars)
- Environment vars: BETTER_AUTH_SECRET for JWT, DATABASE_URL for DB connection
- Running: uvicorn main:app --reload --port 8000 for local dev

## Key Features to Implement
- JWT middleware for all /api/ routes
- Database schema setup with SQLModel
- Task CRUD endpoints with query params for filtering/sorting
- Full integration: Frontend sends JWT in header; backend verifies and responds with user-specific data

## Folder Structure (Backend)
- main.py: FastAPI app initialization, include routers, middleware
- models.py: SQLModel classes for users and tasks
- db.py: Database engine, session maker (AsyncSession for Neon DB)
- routes/tasks.py: API route handlers for tasks
- middleware/jwt.py: JWT verification middleware
- schemas.py: Pydantic models for requests/responses (optional, can be in models)

## Integration with Frontend
- Frontend (Next.js at http://localhost:3000) sends requests with Authorization: Bearer <JWT>
- Backend independently verifies JWT using same BETTER_AUTH_SECRET
- On successful verification, extract user_id and enforce on all task operations
- Test integration: After frontend login, call backend APIs; ensure only own tasks are accessible


2. File: specs/api/rest-endpoints.md

# REST API Endpoints

## Base URL
- Development: http://localhost:8000
- Production: https://api.example.com

## Authentication
- Required for all endpoints: JWT in Authorization: Bearer <token> header
- Middleware verifies token signature with BETTER_AUTH_SECRET
- Decode to extract user_id, email; invalid/missing/expired -> 401 Unauthorized
- Enforce user_id match on all operations; mismatch -> 403 Forbidden

## Endpoints (All under /api/)

### GET /api/tasks
- Description: List authenticated user's tasks
- Query Parameters: status (str: "all"|"pending"|"completed"), sort (str: "created"|"title"|"due_date")
- Response: 200 OK - JSON array of tasks [{id: int, title: str, description: str, completed: bool, created_at: datetime}]
- Filter strictly by user_id from JWT; support default "all" if no params

### POST /api/tasks
- Description: Create a new task for authenticated user
- Request Body: JSON { "title": str (required, 1-200 chars), "description": str (optional, max 1000 chars) }
- Response: 201 Created - JSON of created task
- Associate task with user_id from JWT; validation errors -> 422

### GET /api/tasks/{id}
- Description: Get details of a specific task
- Path Param: id (int)
- Response: 200 OK - JSON of task
- Only if task.user_id == JWT user_id, else 404/403

### PUT /api/tasks/{id}
- Description: Update a task
- Path Param: id (int)
- Request Body: JSON { "title": str (optional), "description": str (optional), "completed": bool (optional) }
- Response: 200 OK - Updated task JSON
- Partial update; only owner's task; validation if fields provided

### DELETE /api/tasks/{id}
- Description: Delete a task
- Path Param: id (int)
- Response: 204 No Content
- Only delete if belongs to JWT user_id

### PATCH /api/tasks/{id}/complete
- Description: Toggle task completion status
- Path Param: id (int)
- Request Body: None (just toggle)
- Response: 200 OK - Updated task JSON with new completed value
- Update updated_at; only for owner's task

## General Rules
- Use Pydantic BaseModel for request/response schemas
- JSON responses only
- Integration: Frontend /lib/api.ts calls these with JWT header; backend filters automatically


3. File: specs/database/schema.md

# Database Schema

## Tables

### users (Compatible with Better Auth management)
- id: varchar (primary key, unique)
- email: varchar (unique, not null)
- name: varchar (nullable)
- created_at: timestamp (default now)

### tasks
- id: serial (primary key, auto-increment integer)
- user_id: varchar (foreign key to users.id, not null)
- title: varchar(200) (not null)
- description: text (nullable)
- completed: boolean (default false)
- created_at: timestamp (default now)
- updated_at: timestamp (default now, on update now)

## Relationships
- Foreign key: tasks.user_id references users.id (on delete cascade, to remove tasks if user deleted)

## Indexes
- Index on tasks.user_id (for efficient per-user queries)
- Index on tasks.completed (for status filtering)

## Notes
- Define with SQLModel: class Tasks(SQLModel, table=True)
- Connection: Use SQLAlchemy create_engine(DATABASE_URL, echo=True) in db.py
- Session: AsyncSession for async operations
- Initial setup: SQLModel.metadata.create_all(engine) for table creation
- Neon DB specifics: Use provided DATABASE_URL with sslmode=require
- Integration: Backend creates users if needed, but Better Auth handles signup (sync via API if required)


4. File: specs/features/task-crud-backend.md

# Feature: Task CRUD Operations (Backend Only)

## User Stories
- As an authenticated user, I can create a new task linked to my account
- As an authenticated user, I can view my tasks with filtering and sorting
- As an authenticated user, I can update my task details
- As an authenticated user, I can delete my task
- As an authenticated user, I can toggle a task's completion

## Acceptance Criteria

### Create Task
- Require title (1-200 chars), optional description (max 1000)
- Set user_id from JWT, created_at now
- Return created task; errors -> 422

### View Tasks
- List only tasks where user_id == JWT user_id
- Apply status filter (pending: completed=false, completed: true, all: no filter)
- Sort by specified field (default created_at desc)
- Return empty list if none

### Update Task
- Allow partial fields update
- Validate if provided; update updated_at
- Only if task exists and belongs to user

### Delete Task
- Hard delete from DB
- Only if owned; success -> 204

### Toggle Complete
- Flip completed boolean
- Update updated_at
- Return updated task; only owned

## Technical Notes
- Use SQLModel select/insert/update/delete with session
- Queries: e.g., select(Tasks).where(Tasks.user_id == current_user.id)
- Pydantic for input validation
- Integration: Frontend fetches/updates via API; backend ensures persistence in Neon DB


5. File: specs/features/authentication-backend.md

# Feature: Authentication and Security (Backend Only)

## User Stories
- As backend, verify incoming JWT from frontend
- As backend, extract and use user_id for data isolation
- As backend, reject invalid or unauthorized requests

## Acceptance Criteria
- Middleware applies to all /api/ routes
- Verify JWT signature with BETTER_AUTH_SECRET
- Decode payload to get user_id, email (expiry auto-handled by PyJWT)
- Attach current_user to request for routes
- Missing/invalid token -> 401
- User_id mismatch or non-owned data -> 403/404
- Stateless: No DB session for auth, independent verification

## Technical Implementation
- FastAPI middleware: @app.middleware("http") async def verify_jwt(request: Request, call_next)
- Use pyjwt: jwt.decode(token, BETTER_AUTH_SECRET, algorithms=["HS256"])
- Dependency: from fastapi import Depends; def get_current_user()
- Handle exceptions: jwt.InvalidTokenError -> 401

## Integration with Frontend
- Frontend (BETTER_AUTH_URL: http://localhost:3000) issues JWT on login
- Backend verifies same secret; no direct auth calls to frontend
- Full stack test: Login frontend -> call backend API -> get user-specific tasks
- Token expiry: e.g., 7 days (configurable in Better Auth)

## Response snapshot

Created 5 backend specification files for the Todo Full-Stack Web Application (Phase II):

1. **specs/overview-backend.md** - Overall backend architecture including core principles, folder structure, environment variables, and integration details with frontend.

2. **specs/api/rest-endpoints.md** - Complete REST API specification with 6 endpoints (GET/POST/PUT/DELETE/PATCH for tasks), including request/response formats, validation rules, and error handling.

3. **specs/database/schema.md** - Database schema definition with users and tasks tables, relationships, indexes, and SQLModel model definitions for Neon PostgreSQL.

4. **specs/features/task-crud-backend.md** - Feature specification for Task CRUD operations with 5 user stories (Create, View, Update, Delete, Toggle), acceptance scenarios, functional requirements, and success criteria.

5. **specs/features/authentication-backend.md** - Feature specification for Authentication and Security with 3 user stories (JWT verification, User isolation, Token payload extraction), functional requirements, and security considerations.

All specifications include environment variable details (BETTER_AUTH_SECRET, DATABASE_URL, BETTER_AUTH_URL) and are ready for implementation planning.

## Outcome

- Impact: Complete backend specifications created covering overview, API endpoints, database schema, task CRUD, and authentication - ready for implementation planning phase.
- Tests: None (specification phase)
- Files: 5 specification files created in specs/ directory structure
- Next prompts: Run `/sp.plan` to generate implementation plan or `/sp.clarify` if any areas need clarification
- Reflection: Specifications are comprehensive and follow project requirements exactly. All environment details are included. Ready to proceed to planning phase.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Not applicable
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): None
