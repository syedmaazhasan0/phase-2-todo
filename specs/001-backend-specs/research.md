# Research: Backend Implementation & Frontend Integration for Todo App

**Feature**: 001-backend-specs | **Date**: 2026-01-03

## Technology Stack Decisions

### FastAPI Framework

**Decision**: Python FastAPI (latest stable version) for backend API framework

**Rationale**:
- Built-in async support for better concurrency
- Automatic OpenAPI/Swagger documentation
- Pydantic validation for request/response schemas
- Type hints improve code quality and IDE support
- High performance (comparable to Node.js and Go)
- Easy dependency injection for database sessions

**Alternatives Considered**:
- **Django REST Framework**: More opinionated, heavier, synchronous by default. Rejected for complexity and slower async story.
- **Flask + Flask-RESTful**: Requires more boilerplate, no built-in validation. Rejected for lack of batteries included.
- **Tornado**: Powerful but less developer-friendly, smaller ecosystem. Rejected for steeper learning curve.

**Best Practices**:
- Use `async` route handlers for I/O-bound operations (database calls)
- Use FastAPI's dependency injection for database sessions
- Use `HTTPException` for error responses
- Use Pydantic models for request/response validation
- Enable CORS middleware for frontend integration

### SQLModel ORM

**Decision**: SQLModel for database operations

**Rationale**:
- Built on SQLAlchemy and Pydantic - unifies models and schemas
- Type-safe with IDE autocomplete
- Async support via SQLAlchemy async engine
- Compatible with PostgreSQL and Neon
- Simple migration strategy with `SQLModel.metadata.create_all()`

**Alternatives Considered**:
- **SQLAlchemy 2.0**: More mature, but requires separate Pydantic models. SQLModel simplifies this.
- **Tortoise ORM**: Async-native, but smaller ecosystem, less mature. Rejected for community support.
- **Django ORM**: Coupled to Django, less flexible. Rejected for framework lock-in.

**Best Practices**:
- Use `async_sessionmaker` for connection pooling
- Use `select()` queries with explicit column selection
- Index frequently queried columns (user_id, completed)
- Use context managers for session lifecycle

### PostgreSQL + Neon Serverless

**Decision**: Neon Serverless PostgreSQL for database

**Rationale**:
- Serverless auto-scaling - pay for what you use
- Branching for development/testing
- Built-in connection pooling
- PostgreSQL reliability and features
- Easy cloud deployment

**Alternatives Considered**:
- **Supabase**: Similar but less focused on serverless. Rejected due to Neon's stronger serverless story.
- **PlanetScale**: MySQL-based, not PostgreSQL. Rejected due to tech stack requirements.
- **Local PostgreSQL**: Good for dev but requires separate production setup. Neon works for both.

**Best Practices**:
- Use SSL connection (`sslmode=require`)
- Use connection pooling via driver
- Index foreign keys and frequently filtered columns
- Use connection strings from environment variables

### JWT Authentication (PyJWT)

**Decision**: PyJWT library for JWT token verification

**Rationale**:
- Lightweight, well-maintained
- Supports HS256 (HMAC-SHA256) for symmetric signing
- Compatible with Better Auth's JWT format
- No heavy dependencies

**Alternatives Considered**:
- **Authlib**: More feature-rich but overkill for just verification. Rejected for simplicity.
- **python-jose**: Comprehensive JWS/JWE library but heavier. Rejected for simplicity.
- **FastAPI OAuth2**: Designed for OAuth flows, not JWT verification. Rejected for wrong use case.

**Best Practices**:
- Verify signature on every request
- Check token expiration
- Extract user_id from claims (typically `sub` or custom claim)
- Return 401 for all auth failures (don't leak info)
- Store secret in environment variable

### CORS Configuration

**Decision**: FastAPI CORSMiddleware for frontend integration

**Rationale**:
- Built-in middleware
- Easy configuration
- Supports credentials (cookies/headers)
- Widely tested pattern

**Best Practices**:
- Allow specific origins only (http://localhost:3000 in dev)
- Allow credentials for auth headers
- Allow specific methods and headers
- Don't use wildcard origins with credentials

## Architecture Decisions

### Stateless JWT Authentication

**Decision**: Stateless JWT verification on every request

**Rationale**:
- Scales horizontally (no session storage)
- Frontend and backend can scale independently
- Better Auth handles user creation and JWT issuance
- Backend only needs to verify, not issue tokens

**Implementation**:
1. Extract `Authorization: Bearer <token>` header
2. Verify signature with `BETTER_AUTH_SECRET`
3. Decode payload to extract user_id and email
4. Attach user info to `request.state.current_user`
5. Use `request.state.current_user` in route handlers

**JWT Claims Structure (from Better Auth)**:
```json
{
  "sub": "user_id_string",
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### User Data Isolation Strategy

**Decision**: Filter all database queries by authenticated user_id

**Rationale**:
- Prevents cross-user data leakage
- Simple, enforceable pattern
- Consistent with multi-tenant architecture

**Implementation**:
- Extract user_id from verified JWT
- Every `SELECT` includes `WHERE user_id = current_user.id`
- Every `UPDATE/DELETE` includes ownership check
- Return 404 (not 403) for cross-user GET to prevent enumeration

### API Endpoint Design

**Decision**: RESTful design under `/api` prefix

**Rationale**:
- Standard pattern, easy to understand
- FastAPI auto-generates OpenAPI docs
- Clear separation from frontend routes

**Endpoints**:
```
GET    /api/tasks          - List tasks (filter by status, sort)
POST   /api/tasks          - Create task
GET    /api/tasks/{id}     - Get task by ID
PUT    /api/tasks/{id}     - Update task (partial)
DELETE /api/tasks/{id}     - Delete task
PATCH  /api/tasks/{id}/complete - Toggle completion
```

**Query Parameters**:
- `status`: `all` (default), `pending`, `completed`
- `sort`: `created` (default, newest first), `title`

### Project Structure

**Decision**: Clean monorepo with separate frontend/backend folders

**Rationale**:
- Clear boundary between services
- Independent development and deployment
- Shared version control
- Easy to understand

**Structure**:
```
backend/
├── main.py              # FastAPI app setup
├── models.py            # SQLModel database models
├── schemas.py           # Pydantic request/response schemas
├── db.py                # Database connection and session factory
├── middleware/
│   └── jwt_auth.py      # JWT verification middleware
├── routes/
│   └── tasks.py         # Task CRUD endpoints
├── .env                 # Environment variables
└── requirements.txt     # Python dependencies

frontend/                # Next.js (existing)
...
```

## Security Considerations

### Environment Variables

**Decision**: All secrets via `.env` file

**Required Variables**:
```
BETTER_AUTH_SECRET=shared_secret_value
DATABASE_URL=postgresql://connection_string
```

**Best Practices**:
- Never commit `.env` files
- Use different values for dev/prod
- Add `.env` to `.gitignore`
- Provide `.env.example` template

### Error Handling

**Decision**: Standard HTTP status codes with consistent error responses

**Status Codes**:
- `200 OK` - Successful GET/PUT/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid query params
- `401 Unauthorized` - Missing/invalid/expired JWT
- `403 Forbidden` - Ownership violation
- `404 Not Found` - Resource doesn't exist
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

**Error Response Format**:
```json
{
  "detail": "Error message"
}
```

## Integration with Frontend

### Better Auth Integration

**Decision**: Frontend manages user creation and JWT issuance

**Flow**:
1. Frontend: User signs up via Better Auth
2. Frontend: Better Auth generates JWT
3. Frontend: Stores JWT (secure storage)
4. Frontend: Attaches JWT to `Authorization: Bearer <token>` header
5. Backend: Verifies JWT and extracts user_id
6. Backend: Uses user_id for all operations

**Shared Secret Requirement**:
- Both frontend and backend use same `BETTER_AUTH_SECRET`
- Mismatch causes all auth to fail
- Document in setup instructions

### Frontend Configuration

**Required Frontend Environment Variable**:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Performance Considerations

### Database Indexes

**Decision**: Index on `user_id` and `completed` columns

**Rationale**:
- `user_id` is filtered in every query
- `completed` is filtered for status queries
- Improves query performance

**Index Definition**:
```python
class Task(SQLModel, table=True):
    __table_args__ = (
        Index('ix_task_user_id', 'user_id'),
        Index('ix_task_completed', 'completed'),
    )
```

### Async Database Operations

**Decision**: Use async database sessions for all operations

**Rationale**:
- Better concurrency
- Non-blocking I/O
- Matches FastAPI async nature

**Implementation**:
```python
async_sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)
```

## OpenAPI Documentation

**Decision**: Use FastAPI's built-in OpenAPI generation

**Rationale**:
- Automatic from route definitions
- Available at `/docs` (Swagger UI) and `/openapi.json`
- Easy for frontend developers to explore API
- No manual documentation maintenance

## Testing Strategy (Out of Scope for Phase II)

**Future Considerations**:
- Unit tests for route handlers
- Integration tests for full flow
- Cross-user isolation tests
- Performance tests
- Security tests

## Summary

All technology decisions align with:
1. **Constitution principles** (spec-driven, security-first, tech stack constraints)
2. **User requirements** (JWT auth, data isolation, CRUD operations)
3. **Best practices** (async, type safety, clean architecture)

No additional clarification needed. Proceeding to Phase 1 design.
