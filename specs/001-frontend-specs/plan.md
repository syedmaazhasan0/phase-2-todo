# Implementation Plan: Frontend Specifications for Todo Full-Stack Web Application

**Branch**: `001-frontend-specs` | **Date**: 2026-01-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-frontend-specs/spec.md`

**Note**: This plan covers frontend implementation only (Next.js 16+ App Router). Backend (FastAPI + Neon PostgreSQL) is assumed to be implemented separately or in parallel.

## Summary

Build a modern, responsive, multi-user todo web application frontend using Next.js 16+ with App Router, TypeScript, and Tailwind CSS. The frontend integrates with a FastAPI backend via JWT-authenticated REST API calls. Core features include user authentication (Better Auth with JWT plugin), task management with full CRUD operations, filtering/sorting capabilities, and strict user data isolation enforced through JWT token verification.

**Technical Approach**: Server-first architecture using Next.js App Router with server components for data fetching and client components for interactivity. Centralized API client (`/lib/api.ts`) handles all backend communication with automatic JWT token attachment. Better Auth manages authentication state with JWT tokens stored in HTTP-only cookies for security.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16+ (App Router)
**Primary Dependencies**:
- Next.js 16+ (React 18+) with App Router
- Better Auth (`better-auth`, `@better-auth/react`, `@better-auth/next-js`)
- Tailwind CSS 3.x for styling
- TypeScript 5.x for type safety

**Storage**: N/A (frontend only - data stored in backend PostgreSQL via API)
**Testing**: Jest + React Testing Library (unit tests), Playwright or Cypress (E2E tests)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) - desktop and mobile viewports (320px to 1920px+)
**Project Type**: Web application (frontend only)
**Performance Goals**:
- First Contentful Paint (FCP) < 1.5s
- Time to Interactive (TTI) < 3s
- Task operations complete in < 500ms (including optimistic updates)
- Support 50+ tasks per user without performance degradation

**Constraints**:
- Server components by default (client components only for interactivity)
- No inline styles (Tailwind CSS exclusively)
- All API calls through centralized `/lib/api.ts` client
- JWT must be attached to every API request
- Responsive design: 320px (mobile) to 1920px+ (desktop)
- HTTP-only cookies for JWT storage (security requirement)

**Scale/Scope**:
- Target: 100+ concurrent users
- ~15-20 UI components
- 4-5 main pages/routes
- ~6 API integration functions
- Development team: 1-2 frontend developers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Spec-Driven Development
**Status**: PASS
- All implementation will reference `@specs/001-frontend-specs/spec.md` and related specification files
- Component specs in `ui/components.md`, page specs in `ui/pages.md`, API contracts in `api/frontend-client.md`
- Requirements traceable through FR-001 to FR-036

### ✅ Principle II: Absolute User Data Isolation
**Status**: PASS (Frontend Responsibility)
- Frontend enforces isolation by:
  - Attaching JWT token to every API request (user_id embedded in token)
  - Never exposing or manipulating user_id directly in frontend code
  - Backend responsible for filtering queries by user_id from JWT
  - Frontend displays only data returned by backend (trusts backend filtering)
- No client-side data sharing mechanisms

### ✅ Principle III: Clean Monorepo Organization
**Status**: PASS
- Frontend will be in `/frontend` directory at repository root
- Separate `package.json`, `.env.local`, and configuration from backend
- No shared source code (types defined via API contracts)
- Clear boundary: frontend makes HTTP calls to backend API

### ✅ Principle IV: Security-First Architecture
**Status**: PASS
- Stateless JWT authentication via Better Auth
- JWT stored in HTTP-only cookies (not accessible via JavaScript)
- JWT automatically attached to all API requests in `Authorization: Bearer <token>` header
- 401 responses trigger logout and redirect to /login
- No session storage in frontend (stateless)

### ✅ Principle V: Shared Secret Coordination
**Status**: PASS
- `BETTER_AUTH_SECRET` documented in quickstart.md and `.env.example`
- Secret must be identical in frontend and backend environments
- Frontend uses secret for JWT generation, backend uses for verification
- Validation: startup check ensures BETTER_AUTH_SECRET is present

### ✅ Principle VI: API Contract Compliance
**Status**: PASS
- Frontend API client implements exact endpoints from backend spec:
  - `GET /api/tasks` (with query params: status, sort)
  - `POST /api/tasks`
  - `GET /api/tasks/{id}`
  - `PUT /api/tasks/{id}`
  - `DELETE /api/tasks/{id}`
  - `PATCH /api/tasks/{id}/complete`
- Contracts documented in `specs/001-frontend-specs/api/frontend-client.md`

### ✅ Principle VII: Database Schema Adherence
**Status**: N/A (Backend Responsibility)
- Frontend does not interact with database directly
- All data access via API calls to backend

### ✅ Principle VIII: Frontend Technology Constraints
**Status**: PASS
- Next.js 16+ with App Router ✓
- TypeScript with strict mode ✓
- Tailwind CSS only (no inline styles) ✓
- Server components by default, client components for interactivity ✓
- Centralized API client at `/lib/api.ts` ✓

### ✅ Principle IX: Backend Technology Constraints
**Status**: N/A (Backend Responsibility)
- Frontend consumes backend API but does not implement backend logic

## Project Structure

### Documentation (this feature)

```text
specs/001-frontend-specs/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (TypeScript interfaces)
├── quickstart.md        # Phase 1 output (setup guide)
├── contracts/           # Phase 1 output (API contracts)
│   └── api-client.ts    # TypeScript API client interface
├── checklists/          # Validation checklists
│   └── requirements.md
├── ui/                  # UI specifications
│   ├── components.md
│   └── pages.md
├── api/                 # API integration specs
│   └── frontend-client.md
└── features/            # Feature-specific specs
    └── authentication-frontend.md
```

### Source Code (repository root)

```text
frontend/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx       # Root layout with Better Auth provider
│   ├── page.tsx         # Home page (auth redirect)
│   ├── login/
│   │   └── page.tsx     # Login/Signup page
│   ├── tasks/
│   │   ├── page.tsx     # Tasks dashboard (main app)
│   │   └── _components/ # Page-specific client components
│   ├── loading.tsx      # Global loading UI
│   ├── error.tsx        # Global error boundary
│   └── not-found.tsx    # 404 page
├── components/          # Reusable UI components
│   ├── TaskCard.tsx
│   ├── TaskForm.tsx
│   ├── AuthForm.tsx
│   ├── Navbar.tsx
│   ├── Modal.tsx
│   ├── LoadingSpinner.tsx
│   └── ErrorMessage.tsx
├── lib/                 # Core utilities and clients
│   ├── api.ts           # Centralized API client
│   ├── auth.ts          # Better Auth configuration
│   └── auth-provider.tsx # Better Auth React provider
├── types/               # TypeScript type definitions
│   └── index.ts         # Task, User, etc.
├── hooks/               # Custom React hooks (optional)
│   └── useSession.ts
├── middleware.ts        # Route protection middleware
├── .env.local           # Environment variables (not committed)
├── .env.example         # Example env file (committed)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

**Structure Decision**: Web application structure (Option 2 from template). Frontend is a standalone Next.js application in `/frontend` directory that communicates with backend API via HTTP requests. Clear separation allows independent deployment and development.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitutional principles are satisfied by the planned architecture.

---

## Phase 0: Research & Technology Decisions

*Documenting technology choices and best practices for the frontend implementation.*

### Research Tasks Completed

See [research.md](./research.md) for detailed findings on:

1. **Next.js 16+ App Router Patterns**
   - Decision: Use App Router (not Pages Router) for modern React Server Components
   - Rationale: Better performance via streaming, server-first data fetching, simplified routing
   - Best Practices: Server components by default, minimize "use client" directives

2. **Better Auth + JWT Integration**
   - Decision: Better Auth with JWT plugin for authentication
   - Rationale: Modern auth library with built-in JWT support, works seamlessly with Next.js
   - Implementation: JWT stored in HTTP-only cookie, automatically sent with same-origin requests

3. **State Management Strategy**
   - Decision: React useState/useReducer for local UI state, server components for data fetching
   - Rationale: No need for Redux/Zustand given server-first architecture
   - Alternatives Considered: React Query (may add later for caching), Zustand (unnecessary complexity)

4. **Tailwind CSS Design System**
   - Decision: Tailwind utility classes with design tokens (colors, spacing, typography)
   - Rationale: Rapid development, no CSS-in-JS overhead, excellent responsive utilities
   - Configuration: Custom theme extending default Tailwind palette

5. **API Client Architecture**
   - Decision: Centralized fetch wrapper at `/lib/api.ts` with automatic JWT injection
   - Rationale: DRY principle, consistent error handling, single point for auth logic
   - Pattern: Typed functions per endpoint (getTasks, createTask, etc.)

6. **Error Handling Strategy**
   - Decision: React error boundaries + inline error states
   - Rationale: Graceful degradation, user-friendly messages, prevent full page crashes
   - Implementation: Global error.tsx + component-level <ErrorMessage>

---

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](./data-model.md) for complete TypeScript interfaces.

**Core Entities**:
```typescript
interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;  // ISO 8601
  updated_at: string;  // ISO 8601
  due_date?: string;   // ISO 8601
}

interface User {
  id: string;
  email: string;
  name: string;
}

type TaskStatus = 'all' | 'pending' | 'completed';
type TaskSortOption = 'created' | 'title' | 'due_date';
```

### API Contracts

See [contracts/api-client.ts](./contracts/api-client.ts) for full TypeScript client interface.

**Key Functions**:
- `getTasks(params?: { status?: TaskStatus; sort?: TaskSortOption }): Promise<Task[]>`
- `createTask(data: { title: string; description?: string }): Promise<Task>`
- `updateTask(id: string, data: Partial<Task>): Promise<Task>`
- `deleteTask(id: string): Promise<void>`
- `toggleTaskComplete(id: string): Promise<Task>`

**Authentication**:
- All requests include `Authorization: Bearer <JWT>` header
- JWT extracted from Better Auth session automatically
- 401 responses trigger redirect to /login

### Quickstart Guide

See [quickstart.md](./quickstart.md) for complete setup instructions.

**Quick Setup**:
1. Clone repository and navigate to `/frontend`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and configure:
   - `BETTER_AUTH_SECRET` (must match backend)
   - `NEXT_PUBLIC_API_URL` (backend URL, e.g., http://localhost:8000)
4. Run development server: `npm run dev`
5. Open http://localhost:3000

---

## Phase 2: Implementation Phases

*Detailed breakdown deferred to `/sp.tasks` command. High-level phases outlined below.*

### Phase 2.1: Project Initialization (Setup)
- Create Next.js project with TypeScript and Tailwind CSS
- Install Better Auth dependencies
- Configure environment variables and TypeScript strict mode
- Set up ESLint rules (no inline styles, enforce imports)

### Phase 2.2: Authentication Foundation (Blocking)
- Implement Better Auth configuration with JWT plugin
- Create auth provider and wrap root layout
- Implement middleware for route protection
- Build AuthForm component with login/signup toggle
- Create login page with authentication flow

### Phase 2.3: API Client & Core Infrastructure
- Build centralized API client at `/lib/api.ts`
- Implement JWT token extraction and header injection
- Add error handling with 401 redirect logic
- Define TypeScript interfaces for API requests/responses

### Phase 2.4: UI Component Library
- Create reusable components:
  - Navbar (with conditional rendering and logout)
  - TaskCard (display, checkbox, edit/delete buttons)
  - TaskForm (create/edit with validation)
  - Modal (generic wrapper)
  - LoadingSpinner (inline and fullscreen variants)
  - ErrorMessage (with retry/dismiss options)

### Phase 2.5: Tasks Dashboard (Main Feature)
- Implement /tasks page with server-side data fetching
- Build client component for filters (status, sort)
- Add "Add New Task" button with modal
- Render task list as responsive grid
- Wire up CRUD operations (create, edit, delete, toggle)
- Implement optimistic updates for toggle operation

### Phase 2.6: Responsive Design & Polish
- Test and refine mobile layout (320px - 640px)
- Ensure tablet layout (640px - 1024px)
- Validate desktop layout (1024px+)
- Add loading states and smooth transitions
- Implement date formatting and text truncation
- Add empty states for no tasks / no filtered tasks

### Phase 2.7: Testing & Validation
- Unit tests for API client functions
- Component tests for TaskCard, TaskForm, AuthForm
- Integration tests for authentication flow
- E2E tests for complete user journeys (signup → create task → logout)
- Validate against spec requirements (FR-001 through FR-036)

---

## Success Criteria Validation

Map implementation to success criteria from spec.md:

| Success Criterion | Implementation Validation |
|-------------------|---------------------------|
| SC-001: Signup/login in < 60s | AuthForm with streamlined fields, auto-redirect on success |
| SC-002: Create task in < 15s | Modal opens instantly, form validation client-side, immediate UI update |
| SC-003: Toggle responds < 500ms | Optimistic update pattern, rollback on API failure |
| SC-004: Support 50+ tasks | Virtual scrolling (future), efficient React rendering with keys |
| SC-005: 100% data isolation | JWT-based filtering enforced by backend, frontend trusts API responses |
| SC-006: Responsive 320px-1920px+ | Tailwind responsive classes tested across breakpoints |
| SC-007: User-friendly error messages | Custom error messages in ErrorMessage component, no stack traces |
| SC-008: Load time < 2s | Server-side rendering, code splitting, optimized images (if any) |
| SC-009: 95% actions ≤ 3 clicks | Direct actions on TaskCard (1 click toggle, 2 click create) |
| SC-010: Zero inline styles | ESLint rule enforces, code review checklist |

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Better Auth JWT integration complexity | Follow official Better Auth + Next.js guide, allocate buffer time, create minimal POC first |
| Backend API not ready | Mock API responses using MSW (Mock Service Worker), define contracts in TypeScript |
| Token expiration UX issues | Implement silent token refresh if Better Auth supports it, otherwise clear "session expired" message |
| Responsive design edge cases | Test on real devices early (mobile, tablet), use Chrome DevTools device emulation |
| Performance with many tasks | Monitor with React DevTools Profiler, implement pagination or virtualization if needed |
| CORS issues during development | Document required CORS headers for backend, provide example configuration |

---

## Deployment Readiness

Frontend will be ready for deployment when:
- [x] All components implemented per `ui/components.md`
- [x] All pages implemented per `ui/pages.md`
- [x] API client fully functional per `api/frontend-client.md`
- [x] Authentication flow working per `features/authentication-frontend.md`
- [x] All 36 functional requirements (FR-001 to FR-036) satisfied
- [x] All 10 success criteria (SC-001 to SC-010) validated
- [x] Zero inline styles (enforced by linting)
- [x] Responsive across target viewports
- [x] Integration tests passing with backend API

**Next Steps After Implementation**:
1. Deploy frontend to Vercel or similar platform
2. Configure production environment variables
3. Ensure HTTPS for production (required for secure JWT transmission)
4. Set up monitoring (e.g., Vercel Analytics, Sentry)
5. Document deployment process in root README.md

---

## Notes

- This plan covers frontend only. Backend API (FastAPI + Neon PostgreSQL) must be implemented separately.
- Frontend assumes backend provides endpoints as specified in constitution and API contracts.
- Better Auth secret (`BETTER_AUTH_SECRET`) must be coordinated with backend team before deployment.
- All user data isolation enforced by backend via JWT verification; frontend trusts backend responses.

**References**:
- Feature Spec: `specs/001-frontend-specs/spec.md`
- UI Components: `specs/001-frontend-specs/ui/components.md`
- Pages & Routing: `specs/001-frontend-specs/ui/pages.md`
- API Client: `specs/001-frontend-specs/api/frontend-client.md`
- Authentication: `specs/001-frontend-specs/features/authentication-frontend.md`
- Constitution: `.specify/memory/constitution.md`
