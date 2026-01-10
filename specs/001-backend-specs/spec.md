# Feature Specification: Backend Implementation & Frontend Integration for Todo App

**Feature Branch**: `001-backend-specs`
**Created**: 2026-01-03
**Status**: Draft
**Input**: Complete Backend Implementation & Frontend Integration - Python FastAPI, SQLModel, Neon Serverless PostgreSQL, JWT Auth (Better Auth compatible)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Can Create Tasks (Priority: P1)

As an authenticated user, I want to create tasks so that I can track my to-do items.

**Why this priority**: This is the core functionality of the application. Without task creation, the app provides no value.

**Independent Test**: User can sign up, create a task via POST /api/tasks, and receive the created task with all fields populated correctly.

**Acceptance Scenarios**:

1. **Given** user is authenticated with valid JWT, **When** they POST to /api/tasks with valid title (1-200 chars) and optional description (max 1000 chars), **Then** the task is created with user_id matching the authenticated user and returns 201 with TaskResponse
2. **Given** user is authenticated, **When** they POST to /api/tasks without a title or with title > 200 chars, **Then** the API returns 422 validation error
3. **Given** user is authenticated, **When** they POST to /api/tasks with description > 1000 chars, **Then** the API returns 422 validation error

---

### User Story 2 - User Can List Their Tasks (Priority: P1)

As an authenticated user, I want to see all my tasks so that I can review what needs to be done.

**Why this priority**: Viewing tasks is essential for the app's utility. Without listing, created tasks are invisible.

**Independent Test**: User can GET /api/tasks and receive only their own tasks, no other users' tasks.

**Acceptance Scenarios**:

1. **Given** user is authenticated with tasks in the database, **When** they GET /api/tasks, **Then** the API returns 200 with array of their tasks only
2. **Given** user is authenticated, **When** they GET /api/tasks?status=completed, **Then** the API returns only their completed tasks
3. **Given** user is authenticated, **When** they GET /api/tasks?status=pending, **Then** the API returns only their pending (incomplete) tasks
4. **Given** user is authenticated, **When** they GET /api/tasks?sort=title, **Then** the API returns tasks sorted alphabetically by title
5. **Given** user is authenticated, **When** they GET /api/tasks?sort=created, **Then** the API returns tasks sorted by creation date (newest first)

---

### User Story 3 - User Can Update Tasks (Priority: P1)

As an authenticated user, I want to update task details so that I can modify task information.

**Why this priority**: Tasks often need modification after creation. Essential for task management.

**Independent Test**: User can PUT /api/tasks/{id} with valid updates and see changes reflected.

**Acceptance Scenarios**:

1. **Given** user is authenticated and owns the task, **When** they PUT /api/tasks/{id} with new title, **Then** the API returns 200 with updated TaskResponse and updated_at timestamp
2. **Given** user is authenticated, **When** they PUT /api/tasks/{id} belonging to another user, **Then** the API returns 403 Forbidden
3. **Given** user is authenticated, **When** they PUT /api/tasks/{id} with invalid data, **Then** the API returns 422 validation error

---

### User Story 4 - User Can Delete Tasks (Priority: P1)

As an authenticated user, I want to delete tasks so that I can remove completed or irrelevant items.

**Why this priority**: Task deletion is a core CRUD operation necessary for task management.

**Independent Test**: User can DELETE /api/tasks/{id} for tasks they own and the task is permanently removed.

**Acceptance Scenarios**:

1. **Given** user is authenticated and owns the task, **When** they DELETE /api/tasks/{id}, **Then** the API returns 204 No Content and task is removed from database
2. **Given** user is authenticated, **When** they DELETE /api/tasks/{id} belonging to another user, **Then** the API returns 403 Forbidden
3. **Given** user is authenticated, **When** they DELETE /api/tasks/{id} that doesn't exist, **Then** the API returns 404 Not Found

---

### User Story 5 - User Can Toggle Task Completion (Priority: P1)

As an authenticated user, I want to mark tasks as complete/incomplete so that I can track progress.

**Why this priority**: Task completion status is a key attribute for task tracking and filtering.

**Independent Test**: User can PATCH /api/tasks/{id}/complete to toggle completed status.

**Acceptance Scenarios**:

1. **Given** user is authenticated and owns an incomplete task, **When** they PATCH /api/tasks/{id}/complete, **Then** the API returns 200 with completed=true and updated_at timestamp
2. **Given** user is authenticated and owns a completed task, **When** they PATCH /api/tasks/{id}/complete, **Then** the API returns 200 with completed=false and updated_at timestamp
3. **Given** user is authenticated, **When** they PATCH /api/tasks/{id}/complete for another user's task, **Then** the API returns 403 Forbidden

---

### User Story 6 - JWT Authentication Enforcement (Priority: P0 - Critical)

All API endpoints must enforce JWT authentication. No unauthenticated access allowed.

**Why this priority**: This is a security requirement. Without proper auth enforcement, user data isolation cannot be guaranteed.

**Independent Test**: All endpoints return 401 when called without valid JWT.

**Acceptance Scenarios**:

1. **Given** unauthenticated request, **When** calling any /api/tasks endpoint without Authorization header, **Then** the API returns 401 Unauthorized
2. **Given** unauthenticated request, **When** calling any /api/tasks endpoint with invalid JWT, **Then** the API returns 401 Unauthorized
3. **Given** unauthenticated request, **When** calling any /api/tasks endpoint with expired JWT, **Then** the API returns 401 Unauthorized
4. **Given** authenticated request with valid JWT, **When** calling /api/tasks endpoint, **Then** request succeeds (subject to other validations)

---

### User Story 7 - User Data Isolation (Priority: P0 - Critical)

Users must NEVER see or access another user's tasks.

**Why this priority**: This is a security and privacy requirement. Violations expose sensitive user data.

**Independent Test**: Any attempt to access another user's task returns 404 or 403, never the data.

**Acceptance Scenarios**:

1. **Given** User A is authenticated, **When** they GET /api/tasks and User B has tasks, **Then** only User A's tasks are returned
2. **Given** User A is authenticated, **When** they GET /api/tasks/{id} where id belongs to User B, **Then** the API returns 404 (not 403 to prevent enumeration)
3. **Given** User A is authenticated, **When** they attempt to update/delete User B's task, **Then** the API returns 403 Forbidden
4. **Given** User A is authenticated, **When** they filter or sort, **Then** only their own tasks are included

---

### Edge Cases

- What happens when JWT is malformed or has invalid signature? → Return 401 Unauthorized immediately
- What happens when database connection fails? → Return 500 Internal Server Error with appropriate logging
- What happens when user_id in JWT doesn't match any user in database? → Consider this an authentication failure (401)
- What happens when tasks list is empty? → Return empty array [], not null or 404
- What happens when task ID doesn't exist? → Return 404 Not Found
- What happens when both status and sort query params are provided? → Apply both filters/operations
- What happens with invalid status query param values? → Default to "all" or return 400
- What happens with invalid sort query param values? → Default to "created" or return 400

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST validate JWT token on every API request and return 401 for invalid/missing/expired tokens
- **FR-002**: System MUST extract user_id from verified JWT claims and use it for all task operations
- **FR-003**: System MUST prevent users from accessing any task where task.user_id != authenticated user_id
- **FR-004**: System MUST allow authenticated users to create tasks with title (required, 1-200 chars) and description (optional, max 1000 chars)
- **FR-005**: System MUST allow authenticated users to list all their tasks with optional filtering by status (all/pending/completed)
- **FR-006**: System MUST allow authenticated users to sort tasks by created date (newest first, default) or title (alphabetically)
- **FR-007**: System MUST allow authenticated users to retrieve a specific task by ID that they own
- **FR-008**: System MUST allow authenticated users to update tasks they own (partial updates supported)
- **FR-009**: System MUST allow authenticated users to delete tasks they own
- **FR-010**: System MUST allow authenticated users to toggle task completion status via dedicated endpoint
- **FR-011**: System MUST update updated_at timestamp on any task modification
- **FR-012**: System MUST return empty array [] when user has no tasks
- **FR-013**: System MUST use BETTER_AUTH_SECRET environment variable for JWT verification (must match frontend)
- **FR-014**: System MUST use DATABASE_URL environment variable for PostgreSQL connection
- **FR-015**: System MUST create database tables automatically on startup if they don't exist
- **FR-016**: System MUST persist tasks in Neon PostgreSQL database across server restarts
- **FR-017**: System MUST enforce indexes on user_id and completed columns for query performance
- **FR-018**: System MUST support CORS for frontend at http://localhost:3000

### Non-Functional Requirements

- **NFR-001**: API must respond within 200ms p95 for listing tasks (first 100 records)
- **NFR-002**: System must use async database operations for better concurrency
- **NFR-003**: JWT verification must be efficient (use asymmetric verification if applicable, verify signature only)
- **NFR-004**: Database connections must be properly managed (connection pooling)
- **NFR-005**: API errors must return appropriate HTTP status codes and JSON error messages
- **NFR-006**: System must be stateless (no session storage)
- **NFR-007**: Code must follow PEP 8 style guidelines for Python
- **NFR-008**: All endpoints must be documented via OpenAPI/Swagger

### Key Entities

- **User**: Represents an application user. Managed by Better Auth on frontend. Contains: id (string, PK), email (string, unique), name (optional string), created_at (datetime). Used only as foreign key reference in tasks.

- **Task**: Represents a to-do item belonging to a user. Contains: id (integer, auto-increment PK), user_id (string, FK to User.id), title (string, required, 1-200 chars), description (string, optional, max 1000 chars), completed (boolean, default false), created_at (datetime), updated_at (datetime). Has indexes on user_id and completed for query performance.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 6 API endpoints (/api/tasks with GET/POST, GET/{id}, PUT/{id}, DELETE/{id}, PATCH/{id}/complete) return correct HTTP status codes
- **SC-002**: JWT verification works with BETTER_AUTH_SECRET matching frontend's secret
- **SC-003**: All database queries filter by authenticated user_id (verified via code review and integration tests)
- **SC-004**: Data persists correctly in Neon PostgreSQL across server restarts
- **SC-005**: Frontend can successfully create, list, update, delete, and toggle tasks
- **SC-006**: Filtering by status (all/pending/completed) works correctly
- **SC-007**: Sorting by created (default) and title works correctly
- **SC-008**: No user can access another user's tasks (verified via integration tests)
- **SC-009**: Backend runs without errors on `uvicorn main:app --reload --port 8000`
- **SC-010**: OpenAPI/Swagger documentation is available at http://localhost:8000/docs

### Security Requirements

- **SR-001**: No API endpoint works without valid JWT (verified via test suite)
- **SR-002**: JWT signature is verified using BETTER_AUTH_SECRET
- **SR-003**: user_id is extracted ONLY from verified JWT claims, never from request body/params
- **SR-004**: All SELECT/UPDATE/DELETE operations filter by task.user_id == current_user.id
- **SR-005**: No task data is ever returned for unauthorized access attempts (404, not 403 for GET)
- **SR-006**: Database connection string is stored in environment variable, never hardcoded
- **SR-007**: BETTER_AUTH_SECRET is stored in environment variable, never hardcoded
