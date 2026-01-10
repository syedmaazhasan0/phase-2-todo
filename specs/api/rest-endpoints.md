# REST API Endpoints

## Base URL
- Development: `http://localhost:8000`
- Production: `https://api.example.com`

## Authentication
- Required for all endpoints: JWT in `Authorization: Bearer <token>` header
- Middleware verifies token signature with BETTER_AUTH_SECRET
- Decode to extract user_id, email; invalid/missing/expired → 401 Unauthorized
- Enforce user_id match on all operations; mismatch → 403 Forbidden

## Endpoints (All under /api/)

### GET /api/tasks

**Description**: List authenticated user's tasks

**Query Parameters**:
| Parameter | Type | Values | Default |
|-----------|------|--------|---------|
| status | string | "all", "pending", "completed" | "all" |
| sort | string | "created", "title" | "created" |

**Request Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response: 200 OK**
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, bread, eggs",
    "completed": false,
    "created_at": "2026-01-03T10:00:00Z",
    "updated_at": "2026-01-03T10:00:00Z"
  }
]
```

**Behavior**:
- Filter strictly by user_id from JWT
- Support default "all" if no params
- Sort by created_at descending by default

---

### POST /api/tasks

**Description**: Create a new task for authenticated user

**Request Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, bread, eggs"
}
```

**Validation Rules**:
- title: required, 1-200 characters
- description: optional, max 1000 characters

**Response: 201 Created**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": false,
  "created_at": "2026-01-03T10:00:00Z",
  "updated_at": "2026-01-03T10:00:00Z"
}
```

**Response: 422 Unprocessable Entity** (validation error)
```json
{
  "detail": "Title must be between 1 and 200 characters"
}
```

**Behavior**:
- Associate task with user_id from JWT
- Validation errors return 422

---

### GET /api/tasks/{id}

**Description**: Get details of a specific task

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Task ID |

**Request Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response: 200 OK**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": false,
  "created_at": "2026-01-03T10:00:00Z",
  "updated_at": "2026-01-03T10:00:00Z"
}
```

**Response: 404 Not Found** (task doesn't exist or doesn't belong to user)
```json
{
  "detail": "Task not found"
}
```

**Behavior**:
- Only return if task.user_id == JWT user_id
- Otherwise return 404

---

### PUT /api/tasks/{id}

**Description**: Update a task (partial update supported)

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Task ID |

**Request Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

**Response: 200 OK**
```json
{
  "id": 1,
  "title": "Updated title",
  "description": "Updated description",
  "completed": true,
  "created_at": "2026-01-03T10:00:00Z",
  "updated_at": "2026-01-03T11:00:00Z"
}
```

**Response: 404 Not Found** (task doesn't exist or doesn't belong to user)

**Response: 422 Unprocessable Entity** (validation error)

**Behavior**:
- Partial update: only update provided fields
- Validate if fields provided
- Update updated_at timestamp
- Only if task exists and belongs to user

---

### DELETE /api/tasks/{id}

**Description**: Delete a task

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Task ID |

**Request Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response: 204 No Content**

**Response: 404 Not Found** (task doesn't exist or doesn't belong to user)

**Behavior**:
- Hard delete from database
- Only delete if belongs to JWT user_id

---

### PATCH /api/tasks/{id}/complete

**Description**: Toggle task completion status

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Task ID |

**Request Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**: None (empty)

**Response: 200 OK**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": true,
  "created_at": "2026-01-03T10:00:00Z",
  "updated_at": "2026-01-03T11:00:00Z"
}
```

**Response: 404 Not Found** (task doesn't exist or doesn't belong to user)

**Behavior**:
- Flip completed boolean (false → true, true → false)
- Update updated_at timestamp
- Return updated task
- Only for owner's task

---

## General Rules
- Use Pydantic BaseModel for request/response schemas
- JSON responses only
- All endpoints require valid JWT
- Integration: Frontend `/lib/api.ts` calls these with JWT header; backend filters automatically

## Error Response Format

All error responses follow this format:

```json
{
  "detail": "Human-readable error message"
}
```

Common error codes:
- 401: Missing, invalid, or expired JWT
- 403: User not authorized for this resource
- 404: Resource not found
- 422: Validation error
- 500: Internal server error
