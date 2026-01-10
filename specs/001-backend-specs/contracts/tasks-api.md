# API Contract: Tasks API

**Feature**: 001-backend-specs | **Version**: 1.0 | **Date**: 2026-01-03

## Base URL

```
http://localhost:8000/api
```

## Authentication

All endpoints require JWT authentication via `Authorization` header.

```
Authorization: Bearer <jwt_token>
```

### Error Responses for Authentication
- `401 Unauthorized` - Missing, invalid, or expired JWT
- `403 Forbidden` - Authenticated but lacks permission (e.g., accessing another user's task)

---

## Endpoints

### 1. List Tasks

**GET** `/api/tasks`

List all tasks for the authenticated user, with optional filtering and sorting.

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | `"all"` | Filter by completion status: `all`, `pending`, `completed` |
| `sort` | string | `"created"` | Sort order: `created` (newest first), `title` (alphabetical) |

**Request Example**:
```http
GET /api/tasks?status=pending&sort=title
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**: `200 OK`

```json
{
  "tasks": [
    {
      "id": 1,
      "user_id": "user_123",
      "title": "Complete project",
      "description": "Finish the todo app implementation",
      "completed": false,
      "created_at": "2026-01-03T10:00:00Z",
      "updated_at": "2026-01-03T10:00:00Z"
    }
  ]
}
```

**Empty List Response**:
```json
{
  "tasks": []
}
```

**Error Responses**:
- `401 Unauthorized` - Invalid JWT
- `400 Bad Request` - Invalid query parameters

---

### 2. Create Task

**POST** `/api/tasks`

Create a new task for the authenticated user.

**Authentication**: Required

**Request Body**:

```json
{
  "title": "Task title",
  "description": "Optional description"
}
```

**Validation**:
- `title`: Required, 1-200 characters
- `description`: Optional, max 1000 characters

**Request Example**:
```http
POST /api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Response**: `201 Created`

```json
{
  "id": 2,
  "user_id": "user_123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-03T10:05:00Z",
  "updated_at": "2026-01-03T10:05:00Z"
}
```

**Error Responses**:
- `401 Unauthorized` - Invalid JWT
- `422 Unprocessable Entity` - Validation error (missing/invalid title/description)

---

### 3. Get Task by ID

**GET** `/api/tasks/{id}`

Get a specific task by ID. Only returns tasks owned by the authenticated user.

**Authentication**: Required

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Task ID |

**Request Example**:
```http
GET /api/tasks/2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**: `200 OK`

```json
{
  "id": 2,
  "user_id": "user_123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-03T10:05:00Z",
  "updated_at": "2026-01-03T10:05:00Z"
}
```

**Error Responses**:
- `401 Unauthorized` - Invalid JWT
- `404 Not Found` - Task doesn't exist or doesn't belong to user (404 used to prevent enumeration)

---

### 4. Update Task

**PUT** `/api/tasks/{id}`

Update a task. Supports partial updates (only provided fields are updated).

**Authentication**: Required

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Task ID |

**Request Body** (all fields optional except at least one required):

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

**Validation**:
- `title`: If provided, 1-200 characters
- `description`: If provided, max 1000 characters
- `completed`: Must be boolean

**Request Example**:
```http
PUT /api/tasks/2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Buy groceries (updated)",
  "completed": true
}
```

**Response**: `200 OK`

```json
{
  "id": 2,
  "user_id": "user_123",
  "title": "Buy groceries (updated)",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2026-01-03T10:05:00Z",
  "updated_at": "2026-01-03T11:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized` - Invalid JWT
- `403 Forbidden` - Task belongs to another user
- `404 Not Found` - Task doesn't exist
- `422 Unprocessable Entity` - Validation error

---

### 5. Delete Task

**DELETE** `/api/tasks/{id}`

Delete a task. Only tasks owned by the authenticated user can be deleted.

**Authentication**: Required

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Task ID |

**Request Example**:
```http
DELETE /api/tasks/2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**: `204 No Content` (no body)

**Error Responses**:
- `401 Unauthorized` - Invalid JWT
- `403 Forbidden` - Task belongs to another user
- `404 Not Found` - Task doesn't exist

---

### 6. Toggle Task Completion

**PATCH** `/api/tasks/{id}/complete`

Toggle the `completed` status of a task. If `completed` is `false`, becomes `true`. If `true`, becomes `false`.

**Authentication**: Required

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Task ID |

**Request Body**: None

**Request Example**:
```http
PATCH /api/tasks/2/complete
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**: `200 OK`

```json
{
  "id": 2,
  "user_id": "user_123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2026-01-03T10:05:00Z",
  "updated_at": "2026-01-03T11:30:00Z"
}
```

**Error Responses**:
- `401 Unauthorized` - Invalid JWT
- `403 Forbidden` - Task belongs to another user
- `404 Not Found` - Task doesn't exist

---

## Data Models

### TaskResponse

```typescript
interface TaskResponse {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;  // ISO 8601 datetime
  updated_at: string;  // ISO 8601 datetime
}
```

### TaskCreate

```typescript
interface TaskCreate {
  title: string;        // Required, 1-200 chars
  description?: string; // Optional, max 1000 chars
}
```

### TaskUpdate

```typescript
interface TaskUpdate {
  title?: string;       // If provided, 1-200 chars
  description?: string; // If provided, max 1000 chars
  completed?: boolean;
}
```

### ErrorResponse

```typescript
interface ErrorResponse {
  detail: string;
}
```

---

## Status Codes Summary

| Status | Description |
|--------|-------------|
| 200 | Success (GET/PUT/PATCH) |
| 201 | Resource created (POST) |
| 204 | Success, no content (DELETE) |
| 400 | Bad request (invalid query params) |
| 401 | Unauthorized (invalid/missing JWT) |
| 403 | Forbidden (ownership violation) |
| 404 | Not found (resource doesn't exist) |
| 422 | Validation error (invalid request body) |
| 500 | Internal server error |

---

## OpenAPI Specification

FastAPI auto-generates OpenAPI documentation at:
- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

---

## Integration Notes

### Frontend API Client

The frontend should implement a centralized API client that:
1. Attaches the JWT token to all requests via `Authorization: Bearer` header
2. Handles 401 responses (redirect to login or refresh token)
3. Handles other errors with appropriate user feedback

### CORS Configuration

The backend must allow CORS requests from:
- Development: `http://localhost:3000`

### Rate Limiting

Not implemented in Phase II. May be added in future phases.

### Pagination

Not implemented in Phase II. All tasks are returned. May be added in future phases for large datasets.
