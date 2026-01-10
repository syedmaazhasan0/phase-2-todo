---
id: 001
title: Establish Project Constitution
stage: constitution
date: 2026-01-01
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: master
user: syedmaazhasan0
command: /sp.constitution
labels: ["governance", "principles", "security", "architecture", "spec-driven"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - None (constitution document)
---

## Prompt

```text
Project: Hackathon II Phase II - Todo Full-Stack Multi-User Web Application

Core principles:
- Fully spec-driven development using Spec-Kit Plus and Claude Code with layered CLAUDE.md guidance
- Absolute user data isolation: no user can ever access, view, or modify another user's tasks
- Security-first architecture: stateless JWT-based authentication, no shared sessions between frontend and backend
- Clean monorepo organization with separate frontend and backend folders for easy cross-stack changes
- All implementation must be traceable to specifications in /specs/ directory
- Reproducibility and consistency: code changes only after reading and referencing relevant @specs/ files

Key standards:
- Authentication: Better Auth (Next.js) with JWT plugin enabled; shared BETTER_AUTH_SECRET environment variable in both frontend and backend for symmetric signing/verification
- JWT handling: Frontend attaches JWT in Authorization: Bearer <token> header via centralized /lib/api.ts client; Backend verifies token signature, extracts user_id, and strictly filters all queries by authenticated user_id
- API endpoints: Exactly as specified – base path /api/tasks (or /api/{user_id}/tasks if path includes user_id), methods GET/POST/GET{id}/PUT{id}/DELETE{id}/PATCH{id}/complete, query params for status (all/pending/completed) and sort (created/title/due_date)
- Database: Neon Serverless PostgreSQL via SQLModel ORM; schema strictly per @specs/database/schema.md (users table managed by Better Auth, tasks with user_id foreign key, title not null, description nullable, completed boolean default false, timestamps, indexes on user_id and completed)
- Validation rules: Task title required (1-200 characters), description optional (max 1000 characters), enforce on create/update
- Frontend: Next.js 16+ App Router, TypeScript, Tailwind CSS only (no inline styles), server components default, client components only for interactivity, centralized API client
- Backend: Python FastAPI, SQLModel for models/operations, Pydantic for request/response, routes under /api/, proper HTTPException handling, database connection via DATABASE_URL env var
- Environment variables: BETTER_AUTH_SECRET (same in both services), DATABASE_URL for Neon Postgres

Constraints:
- Strictly use only the specified technology stack – no deviations (e.g., no other auth libraries, no different ORM, no session-based auth)
- Monorepo must follow exact structure: .spec-kit/config.yaml, organized /specs/ (overview, features/, api/, database/, ui/), root/frontend/backend CLAUDE.md files
- No direct database access outside SQLModel; no inline CSS in frontend
- All API requests require valid JWT; invalid/missing token → 401 Unauthorized
- Stateless only: backend must not store or share sessions; rely entirely on JWT verification
- All task operations must enforce ownership via user_id from verified JWT

Success criteria:
- Successful user signup/login via Better Auth yielding valid JWT
- All task CRUD + toggle operations function correctly and exclusively for the authenticated user's own tasks
- Task listing supports filtering by status and sorting as specified
- Data correctly persisted and retrievable from Neon Serverless PostgreSQL across sessions
- Responsive frontend displays only current user's tasks with proper create/edit/delete/toggle UI
- No possibility of unauthorized access (strict 401 on invalid/missing/expired token, user_id mismatch rejected)
- Full traceability: every feature implemented directly from corresponding specs without undocumented changes
- Local development runs smoothly (frontend: npm run dev
```

## Response snapshot

Created constitution v1.0.0 with 9 core principles organized into three categories:

**Development Process:**
1. Spec-Driven Development (NON-NEGOTIABLE) - All implementation traceable to /specs/
2. Absolute User Data Isolation (NON-NEGOTIABLE) - No cross-user data access
3. Clean Monorepo Organization - Separate frontend/backend folders

**Architecture & Security:**
4. Security-First Architecture (NON-NEGOTIABLE) - Stateless JWT authentication
5. Shared Secret Coordination - BETTER_AUTH_SECRET must match in both services
6. API Contract Compliance - Endpoints exactly per specifications

**Technology Stack:**
7. Database Schema Adherence - Neon PostgreSQL via SQLModel per schema.md
8. Frontend Technology Constraints - Next.js 16+, TypeScript, Tailwind CSS only
9. Backend Technology Constraints - FastAPI, SQLModel, Pydantic

Added comprehensive sections for Constraints, Success Criteria, and Governance including amendment procedures, versioning policy, and compliance review requirements.

## Outcome

- ✅ Impact: Established foundational governance document defining all development principles, technology constraints, and compliance requirements
- 🧪 Tests: Template consistency validated (plan-template.md, spec-template.md, tasks-template.md all align)
- 📁 Files: Created .specify/memory/constitution.md (version 1.0.0)
- 🔁 Next prompts: Create feature specifications in /specs/ directory, establish ADR process, set up frontend and backend project structure
- 🧠 Reflection: Constitution provides clear NON-NEGOTIABLE principles (spec-driven, user isolation, security-first) that will guide all subsequent development decisions

## Evaluation notes (flywheel)

- Failure modes observed: None - initial constitution creation
- Graders run and results (PASS/FAIL): Manual review - PASS (all placeholders filled, principles are testable and declarative)
- Prompt variant (if applicable): N/A - initial creation
- Next experiment (smallest change to try): Monitor enforcement during first feature implementation to identify missing guidance
