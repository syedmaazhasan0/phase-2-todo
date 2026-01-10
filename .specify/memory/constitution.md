<!--
Sync Impact Report:
- Version change: Initial (unversioned) → 1.0.0
- Principles added: 9 core principles across Development Process, Architecture & Security, and Technology Stack
- Sections added: Core Principles (Development Process, Architecture & Security, Technology Stack), Constraints, Success Criteria, Governance
- Templates status:
  ✅ plan-template.md: Constitution Check section validated (lines 30-34)
  ✅ spec-template.md: Requirements structure aligns with spec-driven mandate
  ✅ tasks-template.md: Task organization supports traceability to specs
  ⚠️ No command files found in .specify/templates/commands/ - will need validation when created
- Follow-up TODOs: None - all placeholders filled with concrete values
-->

# Hackathon II Phase II - Todo Application Constitution

## Core Principles

### Development Process

#### I. Spec-Driven Development (NON-NEGOTIABLE)

**Rule**: All implementation MUST be traceable to specifications in the `/specs/` directory. Code changes are permitted ONLY after reading and referencing relevant spec files.

**Rationale**: Ensures reproducibility, consistency, and eliminates undocumented features. Spec-Kit Plus and Claude Code with layered CLAUDE.md guidance provide the foundation for systematic development where every decision is documented and validated against requirements.

**Enforcement**:
- NO code changes without first reading corresponding spec files
- All PRs MUST reference specific spec sections (e.g., `@specs/api/tasks.md#endpoints`)
- Implementation reviews verify spec alignment before merge

#### II. Absolute User Data Isolation (NON-NEGOTIABLE)

**Rule**: No user can EVER access, view, or modify another user's tasks. All database queries MUST filter by authenticated `user_id` extracted from verified JWT.

**Rationale**: Security and privacy are non-negotiable in multi-user applications. A single breach of data isolation violates user trust and regulatory requirements.

**Enforcement**:
- Backend enforces `user_id` filtering on ALL task queries (SELECT, UPDATE, DELETE)
- JWT verification MUST succeed before any data operation
- Code reviews specifically check for missing user_id filters
- Integration tests verify cross-user data isolation

#### III. Clean Monorepo Organization

**Rule**: Separate `frontend/` and `backend/` folders at repository root. No mixing of concerns. Each service maintains its own dependencies, environment configuration, and CLAUDE.md guidance.

**Rationale**: Clear boundaries enable independent development, testing, and deployment of frontend and backend. Simplified cross-stack changes when structure is predictable.

**Enforcement**:
- Repository structure: `frontend/`, `backend/`, `.specify/`, `specs/` at root
- Each service has dedicated README, package management, and .env files
- No shared source code directories (shared types via API contracts only)

### Architecture & Security

#### IV. Security-First Architecture (NON-NEGOTIABLE)

**Rule**: Stateless JWT-based authentication. No shared sessions between frontend and backend. All API requests require valid JWT in `Authorization: Bearer <token>` header. Invalid/missing/expired tokens return 401 Unauthorized immediately.

**Rationale**: Stateless authentication scales horizontally, eliminates session storage vulnerabilities, and enforces explicit authorization on every request. Prevents session hijacking and ensures clean separation of concerns.

**Enforcement**:
- Backend MUST verify JWT signature on every protected endpoint
- Backend extracts `user_id` from verified JWT claims (never from request body/params)
- Frontend attaches JWT via centralized `/lib/api.ts` client
- No authentication bypass mechanisms in production code

#### V. Shared Secret Coordination

**Rule**: `BETTER_AUTH_SECRET` environment variable MUST be identical in both frontend (Next.js Better Auth) and backend (FastAPI JWT verification) for symmetric signing and verification.

**Rationale**: JWT integrity depends on shared secret. Mismatched secrets cause authentication failures that are difficult to debug.

**Enforcement**:
- Document requirement in `/specs/overview.md` and service-specific CLAUDE.md
- Startup validation checks for BETTER_AUTH_SECRET presence
- Development setup guides include secret coordination steps

#### VI. API Contract Compliance

**Rule**: API endpoints MUST match specifications exactly. Base path `/api/tasks`, methods GET/POST/GET{id}/PUT{id}/DELETE{id}/PATCH{id}/complete, query params `status` (all/pending/completed) and `sort` (created/title/due_date).

**Rationale**: Frontend depends on predictable API contracts. Deviations break integration and require synchronized changes across services.

**Enforcement**:
- API implementation references `@specs/api/tasks.md` explicitly
- Integration tests validate endpoint paths, methods, params, and responses
- OpenAPI/Swagger schema generated from specs (if applicable)

### Technology Stack

#### VII. Database Schema Adherence

**Rule**: Neon Serverless PostgreSQL via SQLModel ORM. Schema strictly per `@specs/database/schema.md`: users table managed by Better Auth, tasks table with `user_id` foreign key, `title` NOT NULL, `description` nullable, `completed` boolean default false, `created_at`/`updated_at` timestamps, indexes on `user_id` and `completed`.

**Rationale**: Consistent schema ensures reliable queries, migrations, and performance. SQLModel provides type safety and Pythonic interface.

**Enforcement**:
- All models defined in `backend/src/models/` reference schema.md
- Migrations generated and reviewed against schema.md
- No direct SQL outside SQLModel (except justified raw queries documented in ADRs)

#### VIII. Frontend Technology Constraints

**Rule**: Next.js 16+ App Router, TypeScript, Tailwind CSS ONLY (no inline styles), server components by default, client components ONLY for interactivity, centralized API client in `/lib/api.ts`.

**Rationale**: Modern Next.js patterns improve performance (server components), TypeScript ensures type safety, Tailwind enforces consistent styling without CSS sprawl.

**Enforcement**:
- ESLint rules reject inline styles and enforce TypeScript strict mode
- Code reviews check for unnecessary client components
- All API calls routed through `/lib/api.ts` (no direct fetch in components)

#### IX. Backend Technology Constraints

**Rule**: Python FastAPI, SQLModel for models/database operations, Pydantic for request/response schemas, routes under `/api/`, HTTPException for errors, database connection via `DATABASE_URL` environment variable.

**Rationale**: FastAPI provides async performance, automatic OpenAPI docs, and Pydantic validation. SQLModel unifies SQLAlchemy models with Pydantic schemas.

**Enforcement**:
- No Flask, Django, or alternative frameworks
- All routes prefixed `/api/`
- Database access ONLY via SQLModel session (no raw psycopg2/asyncpg)

## Constraints

### Technology Stack (Non-Negotiable)

- **NO** deviations from specified stack (no alternative auth libraries, ORMs, or session-based auth)
- **NO** inline CSS in frontend components
- **NO** direct database access outside SQLModel
- **NO** shared sessions or stateful authentication

### Validation Rules

- Task title: REQUIRED, 1-200 characters
- Task description: OPTIONAL, max 1000 characters
- Enforce on create AND update operations

### Repository Structure (Required)

```
.specify/config.yaml
specs/
  overview.md
  features/
  api/
  database/
  ui/
CLAUDE.md (root)
frontend/
  CLAUDE.md
  src/
  lib/api.ts
backend/
  CLAUDE.md
  src/
  models/
```

### Environment Variables (Required)

- `BETTER_AUTH_SECRET`: Shared secret (frontend + backend, MUST match)
- `DATABASE_URL`: Neon Postgres connection string (backend only)

## Success Criteria

### Authentication & Authorization

- [x] User signup/login via Better Auth yields valid JWT
- [x] All task operations require valid JWT (401 on invalid/missing/expired)
- [x] Backend extracts `user_id` from verified JWT (never from request body)

### Task Operations

- [x] CRUD + toggle operations function correctly for authenticated user's own tasks ONLY
- [x] Task listing supports filtering by status (all/pending/completed)
- [x] Task listing supports sorting (created/title/due_date)
- [x] Data correctly persisted to and retrieved from Neon PostgreSQL across sessions

### User Data Isolation

- [x] NO user can access another user's tasks (verified via integration tests)
- [x] Cross-user data access attempts return 401 or 404 (never expose existence)
- [x] All queries filtered by authenticated `user_id`

### Frontend & User Experience

- [x] Responsive UI displays ONLY current user's tasks
- [x] Task create/edit/delete/toggle UI works correctly
- [x] Proper error handling for auth failures and API errors

### Development & Traceability

- [x] Every feature implemented directly from corresponding specs
- [x] No undocumented changes or deviations from specifications
- [x] Local development runs smoothly (frontend: `npm run dev`, backend: `uvicorn`)

## Governance

### Amendment Procedure

1. **Proposal**: Document proposed change with rationale in GitHub issue or discussion
2. **Impact Analysis**: Identify affected specs, code, and dependent artifacts
3. **Approval**: Requires review and sign-off from project lead or designated approver
4. **Migration Plan**: Create migration tasks if breaking changes affect existing code
5. **Version Bump**: Update constitution version per semantic versioning rules below
6. **Communication**: Announce changes to all team members with updated constitution link

### Versioning Policy

Constitution follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Backward-incompatible governance changes (e.g., removing a principle, changing technology stack)
- **MINOR**: New principle/section added or materially expanded guidance (e.g., adding security requirement)
- **PATCH**: Clarifications, wording improvements, typo fixes, non-semantic refinements

### Compliance Review

- All PRs MUST verify compliance with constitution principles
- Architecture Decision Records (ADRs) required for deviations (see `history/adr/` and `/sp.adr` command)
- Complexity must be justified: if violating "simplicity" or "spec-driven" principles, document why in ADR or plan.md Complexity Tracking table
- Runtime development guidance files (CLAUDE.md) override general practices when conflicts arise

### Spec-Driven Enforcement

- Use `@specs/` references in all code comments describing features
- Before implementation: Read relevant spec → Reference in code/commit → Implement
- After implementation: Validate against spec → Update spec if legitimate change discovered
- Use `/sp.plan`, `/sp.tasks`, `/sp.specify`, and `/sp.adr` commands per Spec-Kit Plus workflow

**Version**: 1.0.0 | **Ratified**: 2026-01-01 | **Last Amended**: 2026-01-01
