# Feature Specification: Task CRUD Operations (Backend)

**Feature Branch**: `001-backend-specs`
**Created**: 2026-01-03
**Status**: Draft
**Input**: Backend specification for Todo Full-Stack Web Application Phase II

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Task (Priority: P1)

As an authenticated user, I can create a new task linked to my account with a title and optional description.

**Why this priority**: Task creation is the primary value of the application; without it, users have nothing to manage.

**Independent Test**: Can be fully tested by authenticating a user, sending a POST request to create a task, and verifying the task is persisted in the database with correct user association.

**Acceptance Scenarios**:

1. **Given** a user is authenticated with valid JWT, **When** they POST a task with valid title and description, **Then** the task is created with correct user_id and returns 201 with task details
2. **Given** a user is authenticated, **When** they POST a task without a title, **Then** returns 422 with validation error
3. **Given** a user is authenticated, **When** they POST a task with title longer than 200 characters, **Then** returns 422 with validation error
4. **Given** a user is authenticated, **When** they POST a task with description longer than 1000 characters, **Then** returns 422 with validation error

---

### User Story 2 - View Tasks (Priority: P1)

As an authenticated user, I can view my tasks with filtering by completion status and sorting options.

**Why this priority**: Viewing tasks is essential for users to see and manage their todo list; filtering and sorting improve usability.

**Independent Test**: Can be fully tested by creating multiple tasks for a user, then GET requests with various filter/sort parameters to verify correct results.

**Acceptance Scenarios**:

1. **Given** a user has multiple tasks, **When** they GET /api/tasks without parameters, **Then** returns all their tasks sorted by created_at descending
2. **Given** a user has pending and completed tasks, **When** they GET /api/tasks?status=pending, **Then** returns only pending tasks
3. **Given** a user has pending and completed tasks, **When** they GET /api/tasks?status=completed, **Then** returns only completed tasks
4. **Given** a user has tasks, **When** they GET /api/tasks?sort=title, **Then** returns tasks sorted alphabetically by title
5. **Given** a user has tasks, **When** they GET /api/tasks and another user has tasks, **Then** only the requesting user's tasks are returned
6. **Given** a user has no tasks, **When** they GET /api/tasks, **Then** returns empty array with 200 status

---

### User Story 3 - Update Task (Priority: P2)

As an authenticated user, I can update my task details including title, description, and completion status.

**Why this priority**: Users need to modify tasks as priorities change; partial updates support flexible workflows.

**Independent Test**: Can be fully tested by creating a task, then sending PUT requests with various field combinations to verify correct updates.

**Acceptance Scenarios**:

1. **Given** a user owns a task, **When** they PUT with updated title and description, **Then** task is updated with new values and updated_at timestamp
2. **Given** a user owns a task, **When** they PUT with only the title field, **Then** only title is updated; description remains unchanged
3. **Given** a user owns a task, **When** they PUT with invalid data (e.g., title too long), **Then** returns 422 with validation error and task remains unchanged
4. **Given** a user does not own a task, **When** they attempt to PUT, **Then** returns 404 Not Found
5. **Given** a user owns a task, **When** they PUT with an ID that doesn't exist, **Then** returns 404 Not Found

---

### User Story 4 - Delete Task (Priority: P2)

As an authenticated user, I can permanently delete a task from my account.

**Why this priority**: Users need to remove completed or cancelled tasks to maintain a clean todo list.

**Independent Test**: Can be fully tested by creating a task, then DELETE request to verify task is removed from database.

**Acceptance Scenarios**:

1. **Given** a user owns a task, **When** they DELETE the task, **Then** task is permanently removed and returns 204 No Content
2. **Given** a user does not own a task, **When** they attempt to DELETE, **Then** returns 404 Not Found
3. **Given** a user deletes a task, **When** they subsequently GET that task ID, **Then** returns 404 Not Found
4. **Given** a user attempts to DELETE a non-existent task ID, **Then** returns 404 Not Found

---

### User Story 5 - Toggle Task Completion (Priority: P2)

As an authenticated user, I can quickly toggle a task's completion status without sending full update data.

**Why this priority**: Quick completion toggling is a common workflow; dedicated endpoint improves UX for marking tasks done/undone.

**Independent Test**: Can be fully tested by creating tasks with various completion states, then PATCH requests to toggle and verify state flips.

**Acceptance Scenarios**:

1. **Given** a user owns a pending task, **When** they PATCH /api/tasks/{id}/complete, **Then** task.completed becomes true and updated_at is refreshed
2. **Given** a user owns a completed task, **When** they PATCH /api/tasks/{id}/complete, **Then** task.completed becomes false and updated_at is refreshed
3. **Given** a user does not own a task, **When** they attempt to toggle completion, **Then** returns 404 Not Found
4. **Given** a user toggles completion, **Then** response includes full updated task object

---

### Edge Cases

- What happens when a user submits empty strings for title or description? → Validation should treat empty title as invalid, empty description as valid (optional field)
- How does system handle concurrent updates to the same task? → Last update wins; optimistic locking not required for this scope
- What happens if user_id in JWT doesn't match any user in database? → Return 401 Unauthorized (JWT validation should catch this)
- How does system handle special characters in titles/descriptions? → Store as-is; UTF-8 encoding should handle all characters
- What happens when database connection fails during operations? → Return 500 Internal Server Error with user-friendly message

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST validate task titles are between 1 and 200 characters
- **FR-002**: System MUST validate task descriptions are maximum 1000 characters when provided
- **FR-003**: System MUST associate all tasks with the authenticated user's user_id from JWT
- **FR-004**: System MUST return only tasks owned by the authenticated user in list operations
- **FR-005**: System MUST support filtering tasks by status (all, pending, completed)
- **FR-006**: System MUST support sorting tasks by created_at (default) or title
- **FR-007**: System MUST allow partial updates (only specified fields updated)
- **FR-008**: System MUST update updated_at timestamp on any modification
- **FR-009**: System MUST prevent users from accessing or modifying other users' tasks
- **FR-010**: System MUST hard delete tasks (no soft delete) on delete operations
- **FR-011**: System MUST return empty array when no tasks match filters for a user
- **FR-012**: System MUST toggle completion status without requiring additional request body data

### Key Entities

- **Task**: A todo item with title, description, completion status, timestamps, and ownership
  - id: Unique identifier (auto-increment)
  - user_id: Foreign key to owning user
  - title: Short description (required)
  - description: Detailed notes (optional)
  - completed: Boolean completion flag
  - created_at: Creation timestamp
  - updated_at: Last modification timestamp

- **User**: Account entity (managed by Better Auth, read-only for this feature)
  - id: Unique identifier
  - email: User email
  - name: Display name (optional)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create, read, update, and delete tasks with sub-100ms response times for database operations under 1000 total tasks per user
- **SC-002**: All task operations strictly enforce user isolation - zero instances of cross-user data access
- **SC-003**: System validates 100% of input according to defined rules (title length, description length)
- **SC-004**: API responses include appropriate HTTP status codes: 201 for creation, 200 for retrieval/update, 204 for deletion, 422 for validation errors, 404 for not found
- **SC-005**: Task filtering and sorting returns correct results across all combinations of status (all/pending/completed) and sort options (created/title)
