# Feature: User Authentication (Frontend)

**Feature Branch**: `001-frontend-specs`
**Created**: 2026-01-01
**Status**: Draft

## Purpose

This document specifies the frontend implementation of user authentication using Better Auth with JWT plugin. Authentication is the foundational feature that enables user data isolation and protected routes.

## Overview

The authentication system provides:
- User registration (signup) with email and password
- User login with credentials
- Session management via JWT tokens
- Automatic token attachment to API requests
- Protected route enforcement
- Logout functionality

## Technology Stack

- **Better Auth**: Authentication library for Next.js
- **JWT Plugin**: Enables JSON Web Token-based authentication
- **Shared Secret**: `BETTER_AUTH_SECRET` must match between frontend and backend

## User Stories

### US1: User Registration

**As a** new visitor
**I want to** create an account with my email and password
**So that** I can access my personal task list

**Acceptance Criteria**:
1. User provides name, email, and password (min 8 characters)
2. Better Auth validates email format and password strength
3. On success: user is automatically logged in and redirected to /tasks
4. On error: display clear error message (e.g., "Email already exists")

---

### US2: User Login

**As a** registered user
**I want to** log in with my email and password
**So that** I can access my existing tasks

**Acceptance Criteria**:
1. User enters email and password
2. Better Auth validates credentials against backend
3. On success: JWT token stored in session, user redirected to /tasks
4. On error: display "Invalid email or password" message
5. Session persists across browser refreshes

---

### US3: Protected Routes

**As an** unauthenticated user
**I want to** be redirected to login when accessing protected pages
**So that** my data remains secure

**Acceptance Criteria**:
1. Accessing /tasks without authentication redirects to /login
2. No flash of protected content before redirect
3. After login, user is redirected to originally requested page (if applicable)

---

### US4: Logout

**As a** logged-in user
**I want to** log out of my account
**So that** others cannot access my tasks on a shared device

**Acceptance Criteria**:
1. User clicks logout button in navbar
2. Session is cleared (JWT token invalidated)
3. User is redirected to /login
4. Attempting to access /tasks after logout redirects back to /login

---

### US5: Session Persistence

**As a** logged-in user
**I want to** remain logged in across browser refreshes
**So that** I don't have to log in repeatedly

**Acceptance Criteria**:
1. After login, refreshing the page keeps user authenticated
2. Session persists for a reasonable duration (e.g., 7 days default)
3. After session expires, user is prompted to log in again

## Better Auth Setup

### Installation

```bash
npm install better-auth
```

### Configuration File

**File**: `/lib/auth.ts`

```typescript
import { createClient } from 'better-auth/client';

export const authClient = createClient({
  apiUrl: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3000',
  plugins: ['jwt'], // Enable JWT plugin
});

// Export auth methods
export const { signIn, signUp, signOut, getSession } = authClient;
```

### Environment Variables

```env
# Frontend (.env.local)
BETTER_AUTH_SECRET=your-secret-key-min-32-characters
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**CRITICAL**: `BETTER_AUTH_SECRET` must be identical in both frontend and backend for JWT verification to work.

### Better Auth Provider

**File**: `/lib/auth-provider.tsx`

```typescript
'use client';

import { SessionProvider } from 'better-auth/react';

export function BetterAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

**Usage in Root Layout**:
```typescript
// app/layout.tsx
import { BetterAuthProvider } from '@/lib/auth-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BetterAuthProvider>{children}</BetterAuthProvider>
      </body>
    </html>
  );
}
```

## Authentication Components

### AuthForm Component

See `specs/001-frontend-specs/ui/components.md` for full specification.

**Key Integration Points**:

```typescript
'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/lib/auth';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onToggleMode: () => void;
  onSuccess: () => void;
}

export function AuthForm({ mode, onToggleMode, onSuccess }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        await signUp({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      } else {
        await signIn({
          email: formData.email,
          password: formData.password,
        });
      }

      // On success, trigger parent callback (usually redirect)
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ... render form fields and submit button
}
```

### Session Hook

**File**: `/hooks/useSession.ts`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';

export function useSession() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const currentSession = await getSession();
        setSession(currentSession);
      } catch (error) {
        console.error('Failed to load session:', error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  return { session, isLoading };
}
```

**Usage**:
```typescript
function MyComponent() {
  const { session, isLoading } = useSession();

  if (isLoading) return <LoadingSpinner />;
  if (!session) return <div>Please log in</div>;

  return <div>Welcome, {session.user.name}!</div>;
}
```

## Protected Routes Implementation

### Middleware Approach

**File**: `/middleware.ts` (at project root)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('better-auth.session');
  const isAuthenticated = !!sessionCookie;

  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isProtectedPage = request.nextUrl.pathname.startsWith('/tasks');

  // Redirect authenticated users away from login page
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedPage && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // Preserve intended destination for redirect after login
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/tasks/:path*'],
};
```

### Server Component Check

For pages that need server-side session checking:

```typescript
// app/tasks/page.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function TasksPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Render protected content
  return <div>Welcome, {session.user.name}</div>;
}
```

## JWT Token Flow

### Token Generation (Backend Responsibility)

When user logs in via Better Auth:
1. Backend validates credentials
2. Backend generates JWT signed with `BETTER_AUTH_SECRET`
3. JWT contains claims: `user_id`, `email`, `iat` (issued at), `exp` (expiration)
4. JWT returned to frontend

### Token Storage (Frontend)

- JWT stored in HTTP-only cookie via Better Auth
- Not accessible via JavaScript (prevents XSS attacks)
- Automatically sent with requests to same origin

### Token Attachment to API Requests

See `/lib/api.ts` specification:

```typescript
import { getSession } from '@/lib/auth';

async function getJWTToken(): Promise<string | null> {
  const session = await getSession();
  return session?.accessToken || null;
}

// In API request
const token = await getJWTToken();
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### Token Expiration Handling

**Backend**: Returns 401 Unauthorized when token is expired or invalid

**Frontend**:
1. API client detects 401 response
2. Clears local session
3. Redirects user to /login
4. User must log in again to get new token

```typescript
// In /lib/api.ts
if (response.status === 401) {
  // Clear session
  await signOut();
  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
  throw new Error('Session expired - please log in again');
}
```

## Error Handling

### Authentication Errors

| Error Scenario | Frontend Message | User Action |
|----------------|------------------|-------------|
| Email already exists | "Email already registered. Please log in." | Switch to login mode |
| Invalid credentials | "Invalid email or password" | Retry with correct credentials |
| Weak password | "Password must be at least 8 characters" | Choose stronger password |
| Network error | "Unable to connect. Check your internet." | Retry when online |
| Server error | "Something went wrong. Try again later." | Retry or contact support |

### Session Errors

| Error Scenario | Frontend Behavior |
|----------------|-------------------|
| Session expired | Redirect to /login with message "Your session expired" |
| Invalid token | Clear session, redirect to /login |
| Token verification failed | Redirect to /login, log error for debugging |

## Security Considerations

1. **Password Requirements**: Minimum 8 characters (enforced by Better Auth)
2. **HTTPS Only**: Production must use HTTPS to protect credentials in transit
3. **CSRF Protection**: Better Auth handles CSRF tokens automatically
4. **XSS Protection**: JWT in HTTP-only cookies prevents JavaScript access
5. **Secret Management**: `BETTER_AUTH_SECRET` stored in environment variables, never in code
6. **Token Expiration**: Default 7 days, configurable in Better Auth settings
7. **Logout Clears Token**: Ensure token is invalidated server-side on logout

## Backend Integration Points

### Expected Backend Endpoints

Better Auth communicates with these backend endpoints:

1. **POST /auth/signup**
   - Body: `{ name, email, password }`
   - Response: `{ user, token }`

2. **POST /auth/login**
   - Body: `{ email, password }`
   - Response: `{ user, token }`

3. **POST /auth/logout**
   - Headers: `Authorization: Bearer <token>`
   - Response: 204 No Content

4. **GET /auth/session**
   - Headers: `Authorization: Bearer <token>`
   - Response: `{ user }` or 401 if invalid

**Note**: Specific endpoints may vary based on Better Auth configuration. Coordinate with backend team.

### JWT Claims Structure

The JWT payload should include:

```json
{
  "user_id": "uuid-string",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

Backend must verify:
- Token signature (using `BETTER_AUTH_SECRET`)
- Token expiration (`exp` claim)
- Extract `user_id` for data filtering

## Testing Strategy

### Unit Tests

Test individual auth functions:

```typescript
import { signIn, signUp, signOut } from '@/lib/auth';

describe('Authentication', () => {
  it('should sign up a new user', async () => {
    const result = await signUp({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.user).toBeDefined();
  });

  it('should handle invalid credentials', async () => {
    await expect(signIn({ email: 'wrong@example.com', password: 'wrong' }))
      .rejects.toThrow('Invalid credentials');
  });
});
```

### Integration Tests

Test full authentication flows:

1. **Signup Flow**: Fill form → Submit → Check redirect to /tasks
2. **Login Flow**: Fill form → Submit → Verify session exists
3. **Protected Route**: Access /tasks without login → Check redirect to /login
4. **Logout Flow**: Click logout → Verify redirect to /login and session cleared

### Manual Testing Checklist

- [ ] Sign up with valid credentials creates account
- [ ] Sign up with existing email shows error
- [ ] Login with correct credentials works
- [ ] Login with wrong password shows error
- [ ] Protected routes redirect to login when not authenticated
- [ ] Logout clears session and redirects
- [ ] Session persists across page refreshes
- [ ] Token expiration redirects to login

## Future Enhancements (Out of Scope for Phase II)

- Email verification requirement
- Password reset via email
- Social authentication (Google, GitHub OAuth)
- Two-factor authentication (2FA)
- Remember me checkbox (extend session duration)
- Session management page (view/revoke active sessions)
- Password strength indicator
- Account lockout after failed attempts
