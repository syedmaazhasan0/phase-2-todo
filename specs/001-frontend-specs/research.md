# Research: Frontend Technology & Architecture Decisions

**Feature**: Frontend Specifications for Todo Full-Stack Web Application
**Branch**: `001-frontend-specs`
**Date**: 2026-01-01
**Purpose**: Document technology decisions, best practices, and architectural patterns for frontend implementation

---

## Research Areas

### 1. Next.js 16+ App Router Patterns

**Research Question**: What are the best practices for implementing a Next.js 16+ application with App Router for optimal performance and developer experience?

**Decision**: Use Next.js App Router (not Pages Router) with React Server Components as the default pattern.

**Rationale**:
- **Performance**: Server Components enable server-side rendering by default, reducing client JavaScript bundle size
- **Simplified Data Fetching**: Async components can fetch data directly without useEffect or data fetching libraries
- **Streaming**: Automatic streaming of UI as components render, improving perceived performance
- **Modern React**: Leverages latest React 18+ features including Suspense boundaries and concurrent rendering
- **File-based Routing**: Intuitive folder structure where folders define routes and files define UI

**Alternatives Considered**:
1. **Pages Router**: Mature and stable but lacks Server Components support and has more boilerplate
   - Rejected: Older pattern, doesn't support modern React features
2. **Remix**: Similar server-first approach but smaller ecosystem
   - Rejected: Less mature, smaller community, would require learning new framework

**Best Practices Identified**:
- Use Server Components by default (no 'use client' directive)
- Add 'use client' only when needed (forms, onClick handlers, useState/useEffect)
- Fetch data in Server Components, pass to Client Components as props
- Use `loading.tsx` for instant loading states
- Use `error.tsx` for error boundaries
- Implement Suspense boundaries for better streaming

**References**:
- Next.js App Router Documentation: https://nextjs.org/docs/app
- React Server Components RFC: https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md

---

### 2. Better Auth + JWT Integration

**Research Question**: How should we implement authentication with Better Auth and JWT in a Next.js application that communicates with a separate FastAPI backend?

**Decision**: Use Better Auth with JWT plugin enabled, store JWT in HTTP-only cookies, coordinate `BETTER_AUTH_SECRET` between frontend and backend.

**Rationale**:
- **Better Auth**: Modern authentication library specifically designed for Next.js
  - Built-in JWT plugin support
  - Automatic session management
  - HTTP-only cookie storage (secure by default)
  - Integrates seamlessly with App Router (supports both server and client components)
- **JWT in HTTP-only Cookies**: Most secure approach
  - Not accessible via JavaScript (prevents XSS attacks)
  - Automatically sent with same-origin requests
  - Backend can read and verify token
- **Shared Secret**: `BETTER_AUTH_SECRET` used by both services
  - Frontend: Signs JWT when user authenticates
  - Backend: Verifies JWT signature on API requests
  - Must be identical for verification to succeed

**Alternatives Considered**:
1. **NextAuth.js**: Popular but more complex configuration
   - Rejected: Heavier than needed, designed for OAuth providers primarily
2. **JWT in localStorage**: Common but insecure
   - Rejected: Vulnerable to XSS attacks, better to use HTTP-only cookies
3. **Session-based auth**: Server stores session IDs
   - Rejected: Violates constitution principle IV (stateless authentication)

**Implementation Pattern**:
```typescript
// Frontend: /lib/auth.ts
import { createClient } from 'better-auth/client';

export const authClient = createClient({
  apiUrl: process.env.NEXT_PUBLIC_AUTH_API_URL,
  plugins: ['jwt'], // Enable JWT plugin
});

export const { signIn, signUp, signOut, getSession } = authClient;
```

**Security Considerations**:
- JWT stored in HTTP-only cookie (not accessible via JavaScript)
- HTTPS required in production (JWT transmitted in cookie header)
- Token expiration handled by backend (returns 401 when expired)
- Frontend clears session and redirects on 401 responses

**References**:
- Better Auth Documentation: https://better-auth.com/docs
- JWT Best Practices: https://tools.ietf.org/html/rfc8725

---

### 3. State Management Strategy

**Research Question**: What state management approach should we use for a Next.js App Router application with server-first data fetching?

**Decision**: Use React's built-in state management (useState, useReducer) for local UI state; rely on Server Components for data fetching; no global state library needed.

**Rationale**:
- **Server Components**: Data fetched on server, no need for global client state
- **Simplicity**: React hooks sufficient for UI state (modals, forms, filters)
- **Performance**: Less client JavaScript, faster page loads
- **Avoid Over-Engineering**: Global state libraries (Redux, Zustand) add complexity without clear benefit
- **Future-Proof**: Can add React Query later if caching becomes necessary

**Alternatives Considered**:
1. **Redux Toolkit**: Industry standard for global state
   - Rejected: Unnecessary complexity, boilerplate overhead, App Router reduces need for client state
2. **Zustand**: Lightweight global state
   - Rejected: Not needed when data is server-fetched; UI state is localized to components
3. **React Query / TanStack Query**: Data fetching + caching library
   - Deferred: May add later if caching becomes a requirement; not needed for MVP

**State Patterns**:
| State Type | Solution | Example |
|------------|----------|---------|
| Server Data (tasks) | Server Component fetch | `getTasks()` in page.tsx |
| UI State (modal open/closed) | useState | `const [isOpen, setIsOpen] = useState(false)` |
| Form State | useState or useReducer | `const [formData, setFormData] = useState({...})` |
| Filter/Sort State | useState + URL search params | `const [status, setStatus] = useState('all')` |
| Auth State | Better Auth session | `const { session } = useSession()` |

**References**:
- React Hooks Documentation: https://react.dev/reference/react/hooks
- App Router Data Fetching: https://nextjs.org/docs/app/building-your-application/data-fetching

---

### 4. Tailwind CSS Design System

**Research Question**: How should we structure Tailwind CSS for consistent styling across components without inline styles?

**Decision**: Use Tailwind utility classes exclusively with design tokens defined in `tailwind.config.ts`; no inline styles, no CSS-in-JS, no styled-components.

**Rationale**:
- **Constitution Compliance**: Principle VIII requires Tailwind CSS only, no inline styles
- **Rapid Development**: Utility classes allow styling without leaving markup
- **Consistency**: Design tokens (colors, spacing, fonts) enforced via configuration
- **Bundle Size**: PurgeCSS removes unused styles in production
- **Responsive**: Built-in responsive utilities (sm:, md:, lg:, xl:)
- **Developer Experience**: IntelliSense support with Tailwind CSS extension

**Design System Configuration**:
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#2563eb', // blue-600
          700: '#1d4ed8',
        },
        success: {
          600: '#16a34a', // green-600
        },
        danger: {
          600: '#dc2626', // red-600
        },
      },
      spacing: {
        // Inherits Tailwind's 4px base unit scale
      },
    },
  },
};
```

**Component Patterns**:
- Button: `bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700`
- Card: `bg-white border border-gray-200 rounded-lg p-4 shadow-sm`
- Input: `w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500`

**Alternatives Considered**:
1. **Styled-Components**: CSS-in-JS library
   - Rejected: Adds runtime overhead, not allowed by constitution
2. **CSS Modules**: Traditional CSS with local scope
   - Rejected: More files to manage, Tailwind utilities faster
3. **Inline Styles**: `style={{ color: 'red' }}`
   - Rejected: Explicitly forbidden by constitution and spec

**References**:
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- Tailwind with Next.js: https://tailwindcss.com/docs/guides/nextjs

---

### 5. API Client Architecture

**Research Question**: What's the best approach for organizing API calls to a separate FastAPI backend in a Next.js frontend?

**Decision**: Centralized API client at `/lib/api.ts` with typed functions per endpoint, automatic JWT injection, and consistent error handling.

**Rationale**:
- **DRY Principle**: Single source of truth for API logic
- **Type Safety**: TypeScript interfaces for requests/responses
- **Maintainability**: Easy to update base URL, add headers, or change error handling
- **Testability**: Mock single module instead of scattered fetch calls
- **Constitution Compliance**: Principle IV requires centralized API client

**Architecture Pattern**:
```typescript
// /lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function apiRequest<T>(config: RequestConfig): Promise<T> {
  // 1. Get JWT from Better Auth session
  const token = await getJWTToken();

  // 2. Build headers with Authorization
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  // 3. Make request with timeout
  const response = await fetch(url, { method, headers, body, signal });

  // 4. Handle 401 (redirect to login)
  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  // 5. Parse and return data
  return await response.json();
}

// Typed functions per endpoint
export const getTasks = (params?: GetTasksParams) => apiRequest<Task[]>({...});
export const createTask = (data: CreateTaskData) => apiRequest<Task>({...});
// ... etc
```

**Alternatives Considered**:
1. **Axios**: Popular HTTP client library
   - Rejected: Fetch API is native and sufficient; no need for extra dependency
2. **Direct fetch() in components**: Scatter API logic
   - Rejected: Violates constitution, harder to maintain, no centralized error handling
3. **tRPC**: End-to-end type-safe RPC
   - Rejected: Requires backend to be TypeScript/tRPC-compatible; our backend is FastAPI (Python)

**Error Handling Strategy**:
- 401 Unauthorized → Clear session, redirect to /login
- 403 Forbidden → Show error message
- 404 Not Found → Handle gracefully (e.g., "Task not found")
- 422 Validation Error → Display field-specific errors
- 500 Server Error → Generic error message with retry option
- Network timeout → "Request timed out" message

**References**:
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- TypeScript with fetch: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html

---

### 6. Error Handling Strategy

**Research Question**: How should we handle errors gracefully in a Next.js App Router application to prevent crashes and provide good UX?

**Decision**: Layered error handling using React error boundaries (global `error.tsx`) + component-level error states (inline `<ErrorMessage>` component).

**Rationale**:
- **Prevent Crashes**: Error boundaries catch React rendering errors and display fallback UI
- **User-Friendly Messages**: Display plain English errors, never show stack traces or technical jargon
- **Granular Handling**: Component-level errors don't crash entire page
- **Retry Capability**: Users can retry failed operations
- **Logging**: Errors logged to console (and optionally to monitoring service like Sentry)

**Implementation Layers**:

1. **Global Error Boundary** (`app/error.tsx`):
   - Catches unhandled errors in any component
   - Displays full-page error UI with retry button
   - Logs error details for debugging

2. **Page-Level Error Handling**:
   - Each page checks for error conditions (e.g., failed data fetch)
   - Displays `<ErrorMessage>` component inline
   - Allows user to continue using rest of page

3. **Component-Level Error States**:
   - Forms, API calls use try-catch and local state
   - Display error messages directly below affected component
   - Example: Task creation fails → show error below form

**Error Message Format**:
```typescript
interface ErrorMessageProps {
  message: string;           // User-friendly message
  onRetry?: () => void;      // Optional retry callback
  onDismiss?: () => void;    // Optional dismiss callback
}
```

**User-Facing Error Messages** (Examples):
- "Unable to connect to server. Please check your internet connection."
- "Task not found. It may have been deleted."
- "Session expired. Please log in again."
- "Failed to save changes. Please try again."

**Never Show**:
- Stack traces
- Technical error codes (show to developers in console only)
- Backend internal errors
- Database connection errors

**Alternatives Considered**:
1. **No Error Handling**: Let errors crash app
   - Rejected: Poor UX, app becomes unusable
2. **Only Console Logs**: Errors logged but not shown to user
   - Rejected: Users don't see console, left confused
3. **Toast Notifications**: Pop-up messages
   - Deferred: May add toast library later; inline errors sufficient for MVP

**References**:
- React Error Boundaries: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- Next.js Error Handling: https://nextjs.org/docs/app/building-your-application/routing/error-handling

---

## Summary of Decisions

| Decision Area | Chosen Solution | Key Benefit |
|---------------|----------------|-------------|
| App Architecture | Next.js 16+ App Router with Server Components | Performance + modern React features |
| Authentication | Better Auth + JWT in HTTP-only cookies | Secure, stateless, Next.js-native |
| State Management | React hooks (no global state library) | Simplicity + server-first architecture |
| Styling | Tailwind CSS utility classes | Rapid development + constitution compliance |
| API Integration | Centralized `/lib/api.ts` client | Maintainability + type safety |
| Error Handling | Error boundaries + inline error states | Graceful degradation + good UX |

---

## Technical Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Better Auth + FastAPI integration unclear | Create minimal proof-of-concept first; document JWT flow clearly |
| App Router patterns unfamiliar to team | Review official Next.js examples; start with simpler pages |
| Performance issues with many tasks | Monitor with React DevTools; implement virtualization if needed |
| CORS issues during development | Document required backend CORS headers in quickstart.md |

---

## Next Steps

1. ✅ Technology decisions documented
2. ⏭️ Proceed to Phase 1: Generate data-model.md with TypeScript interfaces
3. ⏭️ Proceed to Phase 1: Generate API contracts in contracts/api-client.ts
4. ⏭️ Proceed to Phase 1: Generate quickstart.md with setup instructions
5. ⏭️ Ready for implementation after Phase 1 artifacts complete
