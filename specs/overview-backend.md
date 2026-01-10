# Backend Overview - Todo Full-Stack Web Application (Phase II)

## Purpose
Develop a secure RESTful API backend for multi-user todo management, persistent storage in Neon PostgreSQL, and JWT-based authentication integration with frontend Better Auth for user isolation.

## Current Phase
Phase II: Full backend implementation

## Core Principles
- **Stateless authentication**: Verify JWT from frontend on every request, no sessions
- **User isolation**: All queries filtered by user_id extracted from verified JWT
- **Error handling**: Use HTTPException for 401 (unauthorized), 404 (not found), 422 (validation errors)
- **Validation**: Title required (1-200 chars), description optional (max 1000 chars)
- **Environment vars**: BETTER_AUTH_SECRET for JWT, DATABASE_URL for DB connection
- **Running**: uvicorn main:app --reload --port 8000 for local dev

## Key Features to Implement
- JWT middleware for all /api/ routes
- Database schema setup with SQLModel
- Task CRUD endpoints with query params for filtering/sorting
- Full integration: Frontend sends JWT in header; backend verifies and responds with user-specific data

## Folder Structure (Backend)
```
backend/
├── main.py              # FastAPI app initialization, include routers, middleware
├── models.py            # SQLModel classes for users and tasks
├── db.py                # Database engine, session maker (AsyncSession for Neon DB)
├── routes/
│   └── tasks.py         # API route handlers for tasks
├── middleware/
│   └── jwt.py           # JWT verification middleware
└── schemas.py           # Pydantic models for requests/responses (optional, can be in models)
```

## Integration with Frontend
- Frontend (Next.js at http://localhost:3000) sends requests with `Authorization: Bearer <JWT>`
- Backend independently verifies JWT using same BETTER_AUTH_SECRET
- On successful verification, extract user_id and enforce on all task operations
- Test integration: After frontend login, call backend APIs; ensure only own tasks are accessible

## Environment Variables
```bash
BETTER_AUTH_SECRET=9LwoNRSxkGnLUquJlXdVmRCg3cIjSnhi  # JWT signing/verification (shared with frontend)
DATABASE_URL=postgresql://neondb_owner:npg_gBchopUF93qM@ep-wild-boat-a74apbwz-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
BETTER_AUTH_URL=http://localhost:3000  # For auth reference, but backend verifies independently
```

## Dependencies
- FastAPI: Modern Python web framework
- SQLModel: ORM for database operations
- SQLAlchemy: Database engine (AsyncSession for Neon)
- PyJWT: JWT token verification
- psycopg2: PostgreSQL adapter
- uvicorn: ASGI server
