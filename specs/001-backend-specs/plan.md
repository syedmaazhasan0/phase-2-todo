# Implementation Plan: Backend Implementation & Frontend Integration for Todo App

**Branch**: `001-backend-specs` | **Date**: 2026-01-03 | **Spec**: [spec.md](./spec.md)

## Summary

Implement a complete FastAPI backend for a Todo application with JWT authentication, user data isolation, and integration with the existing Next.js frontend. The backend provides RESTful CRUD endpoints for task management with PostgreSQL persistence via Neon Serverless. All endpoints require JWT verification using a shared secret with Better Auth.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI 0.109.0, SQLModel 0.0.14, PyJWT 2.8.0, asyncpg 0.29.0
**Storage**: Neon Serverless PostgreSQL (PostgreSQL 15+)
**Testing**: pytest 7.4.4, pytest-asyncio 0.23.3, httpx 0.26.0
**Target Platform**: Linux/macOS/Windows server (development: localhost, production: Railway/Vercel equivalent)
**Project Type**: Web application (full-stack)
**Performance Goals**: <200ms p95 latency for task listing (first 100 records)
**Constraints**: Stateless authentication (JWT only), <1s startup time, <100MB memory footprint
**Scale/Scope**: 10k users (initial), 1M tasks, 5 API endpoints + health check

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance Status: PASS

| Principle | Status | Notes |
|-----------|--------|-------|
| Spec-Driven Development | PASS | Implementation traceable to spec.md and contracts/tasks-api.md |
| Absolute User Data Isolation | PASS | All queries filter by authenticated user_id; 404 for cross-user GET |
| Clean Monorepo Organization | PASS | Separate backend/ and frontend/ folders at root |
| Security-First Architecture | PASS | Stateless JWT, verified on every request, 401 for auth failures |
| Shared Secret Coordination | PASS | BETTER_AUTH_SECRET documented, must match frontend |
| API Contract Compliance | PASS | Endpoints match spec: GET/POST /api/tasks, GET/{id}, PUT/{id}, DELETE/{id}, PATCH/{id}/complete |
| Database Schema Adherence | PASS | SQLModel models match data-model.md exactly |
| Frontend Technology Constraints | N/A | Backend implementation |
| Backend Technology Constraints | PASS | FastAPI, SQLModel, Pydantic, /api/ prefix, HTTPException for errors |

### No violations detected. No Complexity Tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-backend-specs/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (implementation plan)
├── research.md          # Technology decisions (Phase 0 - complete)
├── data-model.md        # Entity definitions and schema (Phase 1 - complete)
├── quickstart.md        # Developer setup guide (Phase 1 - complete)
├── contracts/           # API contracts (Phase 1 - complete)
│   └── tasks-api.md     # REST API specification
└── tasks.md             # Implementation tasks (Phase 2 - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── main.py              # FastAPI app setup, startup event, CORS, middleware
├── models.py            # SQLModel database models (Task)
├── schemas.py           # Pydantic request/response schemas
├── db.py                # Database connection, engine, session factory
├── middleware/
│   └── jwt_auth.py      # JWT verification middleware
├── routes/
│   └── tasks.py         # Task CRUD endpoints
├── tests/
│   ├── conftest.py      # Test fixtures
│   ├── test_auth.py     # Authentication tests
│   ├── test_tasks.py    # Task endpoint tests
│   └── test_isolation.py # User data isolation tests
├── .env                 # Environment variables (not committed)
├── .env.example         # Environment variable template
├── .gitignore           # Git ignore rules
├── requirements.txt     # Python dependencies
└── README.md            # Backend documentation

frontend/                # Existing Next.js app
├── src/
│   ├── lib/
│   │   └── api.ts       # API client with JWT integration
│   ├── components/
│   │   └── TaskList.tsx # Task list component
│   └── app/
│       └── page.tsx     # Main app page
├── .env.local           # NEXT_PUBLIC_API_URL
└── package.json
```

**Structure Decision**: Clean monorepo with separate backend/ and frontend/ folders. Each service manages its own dependencies, environment, and CLAUDE.md guidance. This allows independent development, testing, and deployment while maintaining clear boundaries.

## Implementation Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               Frontend (Next.js)                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ Better Auth  │───▶│    JWT       │───▶│   API Client │                  │
│  │  (signup)    │    │  (token)     │    │  (/lib/api.ts)│                 │
│  └──────────────┘    └──────────────┘    └──────┬───────┘                  │
│                                                 │                            │
│                                                 ▼                            │
│                                         Authorization: Bearer               │
└─────────────────────────────────────────────────────────────────────────────┘
                                                   │
                                                   │ HTTP Request
                                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               Backend (FastAPI)                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   CORS       │───▶│  JWT Verify  │───▶│  Task Route  │                  │
│  │  Middleware  │    │  Middleware  │    │  Handler     │                  │
│  └──────────────┘    └──────────────┘    └──────┬───────┘                  │
│                                                 │                            │
│                                                 ▼                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │  SQLModel    │◀───│ AsyncSession │◀───│  DB Query    │                  │
│  │  (ORM)       │    │  (pool)      │    │  (user_id)   │                  │
│  └──────────────┘    └──────────────┘    └──────┬───────┘                  │
│                                                 │                            │
│                                                 ▼                            │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Neon PostgreSQL Serverless                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  │ users (managed by Better Auth)                                  │   │
│  │  │   - id (PK), email (unique), name, created_at                   │   │
│  │  ├─────────────────────────────────────────────────────────────────┤   │
│  │  │ tasks (managed by backend)                                       │   │
│  │  │   - id (PK), user_id (FK), title, description, completed         │   │
│  │  │   - created_at, updated_at                                      │   │
│  │  │   - indexes: ix_task_user_id, ix_task_completed                  │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Specifications

#### 1. Database Layer (db.py)

**Purpose**: Provide database connection and session management

**Components**:
- `engine`: Async SQLAlchemy engine with connection pooling
- `async_session`: Async session factory for dependency injection
- `get_db()`: FastAPI dependency for database sessions

**Configuration**:
- Connection string from `DATABASE_URL` environment variable
- `echo=True` in dev, `False` in production
- Connection pooling via asyncpg driver

#### 2. Models Layer (models.py)

**Purpose**: Define database schema and ORM models

**Components**:
- `Task` class with all fields from data-model.md
- Indexes on `user_id` and `completed` for query performance

**Validation**:
- Title: min 1, max 200 characters
- Description: max 1000 characters (optional)

#### 3. Schemas Layer (schemas.py)

**Purpose**: Define Pydantic models for request/response validation

**Components**:
- `TaskCreate`: Create task request (title required, description optional)
- `TaskUpdate`: Update task request (all fields optional)
- `TaskResponse`: Task response with all fields including timestamps

#### 4. JWT Middleware (middleware/jwt_auth.py)

**Purpose**: Verify JWT tokens and attach user info to request state

**Components**:
- `verify_jwt()`: HTTP middleware for JWT verification
- `get_current_user()`: FastAPI dependency to access authenticated user

**Verification Steps**:
1. Extract `Authorization: Bearer <token>` header
2. Decode JWT with `BETTER_AUTH_SECRET` (HS256)
3. Extract `user_id`, `email`, `name` from claims
4. Attach to `request.state.current_user`
5. Return 401 on any failure

#### 5. Task Routes (routes/tasks.py)

**Purpose**: Handle all task CRUD operations

**Endpoints**:

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/tasks | List tasks with filter/sort | Required |
| POST | /api/tasks | Create new task | Required |
| GET | /api/tasks/{id} | Get task by ID | Required |
| PUT | /api/tasks/{id} | Update task | Required |
| DELETE | /api/tasks/{id} | Delete task | Required |
| PATCH | /api/tasks/{id}/complete | Toggle completion | Required |

**Query Parameters**:
- `status`: `all` (default), `pending`, `completed`
- `sort`: `created` (default), `title`

**Security**:
- All operations filter by `current_user["id"]`
- Cross-user attempts return 404 (GET) or 403 (PUT/DELETE)
- Ownership check before any modification

#### 6. Main Application (main.py)

**Purpose**: FastAPI app configuration and startup

**Components**:
- FastAPI app with title, description, version
- CORSMiddleware for frontend integration
- JWT middleware registration
- Router inclusion
- Startup event for table creation

**Configuration**:
- CORS origins: `http://localhost:3000`
- JWT middleware on all routes
- Auto-create tables on startup

### Security Model

#### Authentication

```
┌─────────────────────────────────────────────────────────────────┐
│  Authentication Flow                                             │
├─────────────────────────────────────────────────────────────────┤
│  1. User signs up via Better Auth (frontend)                    │
│  2. Better Auth generates JWT with BETTER_AUTH_SECRET           │
│  3. Frontend stores JWT (localStorage/cookie)                   │
│  4. Frontend sends JWT in Authorization: Bearer header          │
│  5. Backend verifies JWT signature with BETTER_AUTH_SECRET      │
│  6. Backend extracts user_id from claims                        │
│  7. Backend uses user_id for all operations                     │
└─────────────────────────────────────────────────────────────────┘
```

#### Authorization

```
┌─────────────────────────────────────────────────────────────────┐
│  Authorization Rules                                             │
├─────────────────────────────────────────────────────────────────┤
│  - All endpoints require valid JWT (401 on failure)             │
│  - All queries filter by user_id (WHERE user_id = ?)            │
│  - GET /api/tasks/{id}: Return 404 if not owner (prevent enumeration) │
│  - PUT/DELETE /api/tasks/{id}: Return 403 if not owner          │
│  - No role-based access (all users have same permissions)       │
└─────────────────────────────────────────────────────────────────┘
```

## API Contract

See `/specs/001-backend-specs/contracts/tasks-api.md` for complete API specification.

### Summary of Endpoints

```
GET    /api/tasks           → List tasks (filter: all/pending/completed, sort: created/title)
POST   /api/tasks           → Create task (201)
GET    /api/tasks/{id}      → Get task (404 if not owner)
PUT    /api/tasks/{id}      → Update task (404 if not exists, 403 if not owner)
DELETE /api/tasks/{id}      → Delete task (404 if not exists, 403 if not owner)
PATCH  /api/tasks/{id}/complete → Toggle completion (404 if not exists, 403 if not owner)
GET    /health              → Health check
GET    /                    → Root endpoint
```

## Implementation Phases

### Phase 1: Project Setup (Completed in Research)
- Technology decisions documented in research.md
- No violations found in constitution check

### Phase 2: Design Artifacts (Completed)
- spec.md: Feature specification with user stories and requirements
- research.md: Technology decisions and best practices
- data-model.md: Entity definitions and schema
- contracts/tasks-api.md: REST API specification
- quickstart.md: Developer setup guide with code templates

### Phase 3: Implementation (Pending - See tasks.md)

**Backend Implementation**:
1. Create project structure and virtual environment
2. Install dependencies (requirements.txt)
3. Configure environment variables (.env)
4. Implement database layer (db.py)
5. Implement models (models.py)
6. Implement schemas (schemas.py)
7. Implement JWT middleware (middleware/jwt_auth.py)
8. Implement task routes (routes/tasks.py)
9. Implement main application (main.py)
10. Run and test backend

**Frontend Integration**:
11. Configure frontend environment (.env.local)
12. Implement API client (frontend/src/lib/api.ts)
13. Test full-stack integration
14. Verify user data isolation

**Testing**:
15. Write unit tests for routes
16. Write integration tests for auth flow
17. Write data isolation tests
18. Test against acceptance criteria

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | Constitution check passed |

## Acceptance Criteria

All success criteria from spec.md must be met:

- **SC-001**: All 6 API endpoints return correct HTTP status codes
- **SC-002**: JWT verification works with BETTER_AUTH_SECRET
- **SC-003**: All database queries filter by authenticated user_id
- **SC-004**: Data persists in Neon PostgreSQL across restarts
- **SC-005**: Frontend can successfully create, list, update, delete, toggle tasks
- **SC-006**: Filtering by status works correctly
- **SC-007**: Sorting by created and title works correctly
- **SC-008**: No user can access another user's tasks
- **SC-009**: Backend runs without errors
- **SC-010**: OpenAPI/Swagger documentation available

All security requirements from spec.md must be met:

- **SR-001**: No API endpoint works without valid JWT
- **SR-002**: JWT signature verified using BETTER_AUTH_SECRET
- **SR-003**: user_id extracted ONLY from verified JWT claims
- **SR-004**: All operations filter by task.user_id == current_user.id
- **SR-005**: No task data returned for unauthorized attempts
- **SR-006**: Database connection string from environment variable
- **SR-007**: BETTER_AUTH_SECRET from environment variable

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks
2. Implement tasks in sequential order
3. Run tests after each task
4. Verify all acceptance criteria
5. Run integration tests for user data isolation
6. Deploy to production

## References

- Feature Spec: [spec.md](./spec.md)
- Research: [research.md](./research.md)
- Data Model: [data-model.md](./data-model.md)
- API Contract: [contracts/tasks-api.md](./contracts/tasks-api.md)
- Quickstart: [quickstart.md](./quickstart.md)
- Constitution: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

---

**Note**: This plan was generated by `/sp.plan` command. Implementation tasks will be generated by `/sp.tasks`.
