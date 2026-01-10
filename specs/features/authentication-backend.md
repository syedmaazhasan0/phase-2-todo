# Feature Specification: Authentication and Security (Backend)

**Feature Branch**: `001-backend-specs`
**Created**: 2026-01-03
**Status**: Draft
**Input**: Backend specification for Todo Full-Stack Web Application Phase II

## User Scenarios & Testing *(mandatory)*

### User Story 1 - JWT Verification (Priority: P1)

As the backend system, I must verify JWT tokens from incoming requests to ensure only authenticated users can access protected resources.

**Why this priority**: Without JWT verification, the system has no security layer; all operations would be vulnerable to unauthorized access.

**Independent Test**: Can be fully tested by making requests with valid JWT, expired JWT, invalid JWT, and missing JWT to verify correct responses.

**Acceptance Scenarios**:

1. **Given** a request with valid JWT signed with correct secret, **When** request reaches any /api/ endpoint, **Then** request proceeds with user_id extracted from token
2. **Given** a request with expired JWT, **When** request reaches any /api/ endpoint, **Then** returns 401 Unauthorized with "Token expired" message
3. **Given** a request with JWT signed with wrong secret, **When** request reaches any /api/ endpoint, **Then** returns 401 Unauthorized with "Invalid token" message
4. **Given** a request with malformed JWT (not proper format), **When** request reaches any /api/ endpoint, **Then** returns 401 Unauthorized with "Invalid token format" message
5. **Given** a request without Authorization header, **When** request reaches any /api/ endpoint, **Then** returns 401 Unauthorized with "Missing authorization header" message

---

### User Story 2 - User Isolation (Priority: P1)

As the backend system, I must enforce that all data operations are scoped to the authenticated user to prevent cross-user data access.

**Why this priority**: Data isolation is critical for privacy and security; without it, users could see or modify other users' tasks.

**Independent Test**: Can be fully tested by creating tasks for two different users, then having each user attempt to access the other's tasks.

**Acceptance Scenarios**:

1. **Given** user A has tasks and user B has tasks, **When** user A requests their task list, **Then** only user A's tasks are returned
2. **Given** user A attempts to GET a task owned by user B, **When** request reaches backend, **Then** returns 404 Not Found (not 403, to prevent user enumeration)
3. **Given** user A attempts to PUT a task owned by user B, **When** request reaches backend, **Then** returns 404 Not Found
4. **Given** user A attempts to DELETE a task owned by user B, **When** request reaches backend, **Then** returns 404 Not Found
5. **Given** user A attempts to PATCH toggle completion on user B's task, **When** request reaches backend, **Then** returns 404 Not Found

---

### User Story 3 - Token Payload Extraction (Priority: P1)

As the backend system, I must extract user identity information from verified JWT to enable data isolation and request handling.

**Why this priority**: Extracted user information is required for all subsequent operations; without it, requests cannot be properly processed.

**Independent Test**: Can be fully tested by verifying JWT payloads are correctly decoded and user information is available to route handlers.

**Acceptance Scenarios**:

1. **Given** a valid JWT containing user_id and email, **When** token is verified, **Then** user_id is extracted and attached to request context
2. **Given** a valid JWT without required claims (user_id, email), **When** token is verified, **Then** returns 401 Unauthorized with "Invalid token claims" message
3. **Given** a request with verified JWT, **When** route handler accesses user information, **Then** user_id and email are available and correctly typed

---

### Edge Cases

- What happens when Authorization header has wrong format (e.g., "Basic" instead of "Bearer")? → Return 401 Unauthorized with specific message about expected format
- How does system handle JWT algorithm mismatch? → Return 401 Unauthorized; only HS256 should be accepted
- What happens if token has valid signature but invalid structure? → Return 401 Unauthorized with validation error details
- How does system handle tokens with future `iat` (issued at) timestamp? → Return 401 Unauthorized with "Invalid token" message
- What happens if secret environment variable is not set? → Application should fail to start with clear error message

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST verify JWT signature using BETTER_AUTH_SECRET environment variable
- **FR-002**: System MUST accept JWT signed with HS256 algorithm only
- **FR-003**: System MUST extract user_id and email claims from verified JWT payload
- **FR-004**: System MUST return 401 Unauthorized for missing, expired, or invalid tokens
- **FR-005**: System MUST return 404 Not Found (not 403) when users attempt to access other users' resources
- **FR-006**: System MUST attach authenticated user information to request context for route handlers
- **FR-007**: System MUST apply JWT verification middleware to all /api/ routes
- **FR-008**: System MUST validate JWT token format (must be "Bearer <token>")
- **FR-009**: System MUST validate required claims (user_id, email) exist in token payload
- **FR-010**: System MUST implement stateless authentication (no server-side sessions)
- **FR-011**: System MUST independently verify tokens without contacting frontend authentication service
- **FR-012**: System MUST enforce user_id matching on all task operations (read, write, delete)

### Key Entities

- **JWT Token**: Stateless authentication token containing user identity
  - Header: Algorithm and token type (HS256)
  - Payload: user_id (string), email (string), iat (issued at), exp (expiry)
  - Signature: HMAC with BETTER_AUTH_SECRET

- **Authenticated User Context**: Request-scoped user information
  - user_id: Unique user identifier from JWT
  - email: User email address from JWT

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of requests to /api/ routes without valid JWT return 401 Unauthorized
- **SC-002**: 100% of requests with valid JWT are authenticated and proceed to route handlers
- **SC-003**: Zero instances of cross-user data access under normal operations and attempted unauthorized access
- **SC-004**: JWT verification adds less than 10ms latency to each request
- **SC-005**: Application fails to start if BETTER_AUTH_SECRET is not configured (fails securely)

## Security Considerations

### Shared Secret Management

- BETTER_AUTH_SECRET (`9LwoNRSxkGnLUquJlXdVmRCg3cIjSnhi`) is shared between frontend and backend
- Secret must be stored in environment variables (never in code)
- Secret should be rotated periodically in production (not required for this scope)

### Stateless Authentication

- No server-side sessions or tokens stored in database
- Each request is independently verified
- Token expiration handled by `exp` claim in JWT
- Refresh token handling is managed by frontend Better Auth

### User Enumeration Prevention

- Return 404 Not Found (not 403 Forbidden) for unauthorized resource access
- This prevents attackers from determining which user IDs exist in the system

### Transport Security

- All API communication should use HTTPS in production
- Authorization header should never be logged or exposed in error messages
