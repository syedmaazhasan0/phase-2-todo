# Frontend API Client Specification

**Feature**: Frontend Specifications for Todo Full-Stack Web Application
**Branch**: `001-frontend-specs`
**Created**: 2026-01-01

## Purpose

This document specifies the centralized API client that handles all backend communication for the frontend application. This client ensures consistent JWT authentication, error handling, and request/response formatting across all API calls.

## Core Principles

1. **Single Source of Truth**: All backend API calls MUST go through this client
2. **Automatic Authentication**: JWT token automatically attached to every request
3. **Type Safety**: Full TypeScript support with typed request/response interfaces
4. **Consistent Error Handling**: Unified error handling with proper 401 redirect logic
5. **No Direct fetch() Calls**: Components and pages must never use fetch() directly

## File Location

**Primary file**: `/lib/api.ts`
**Supporting files**:
- `/lib/auth.ts` - Better Auth session helpers
- `/types/index.ts` - Shared TypeScript interfaces

## Configuration

### Environment Variables

**Required**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For local development, this should point to the FastAPI backend.
For production: `https://api.yourdomain.com`

### Base Configuration

```typescript
// /lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Timeout configuration (10 seconds)
const REQUEST_TIMEOUT = 10000;
```

## Authentication Helper

**File**: `/lib/auth.ts`

```typescript
import { getSession as getBetterAuthSession } from 'better-auth/client';

export async function getJWTToken(): Promise<string | null> {
  try {
    const session = await getBetterAuthSession();
    return session?.accessToken || null;
  } catch (error) {
    console.error('Failed to get JWT token:', error);
    return null;
  }
}

export async function getSession() {
  return await getBetterAuthSession();
}
```

## Core API Client

### Base Request Function

```typescript
// /lib/api.ts

import { getJWTToken } from './auth';

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
}

async function apiRequest<T>(config: RequestConfig): Promise<T> {
  const { method, endpoint, body, params } = config;

  // Build URL with query parameters
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Get JWT token
  const token = await getJWTToken();

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      // Clear session if exists
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized - please log in again');
    }

    // Handle other error status codes
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Parse JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out - please try again');
      }
      throw error;
    }
    throw new Error('An unknown error occurred');
  } finally {
    clearTimeout(timeoutId);
  }
}
```

## Task API Functions

### Get Tasks

```typescript
import { Task, TaskStatus, TaskSortOption } from '@/types';

export interface GetTasksParams {
  status?: TaskStatus;  // 'all' | 'pending' | 'completed'
  sort?: TaskSortOption; // 'created' | 'title' | 'due_date'
}

export async function getTasks(params?: GetTasksParams): Promise<Task[]> {
  return apiRequest<Task[]>({
    method: 'GET',
    endpoint: '/api/tasks',
    params,
  });
}
```

**API Contract**:
- **Method**: GET
- **Endpoint**: `/api/tasks`
- **Query Params**:
  - `status` (optional): "all" | "pending" | "completed"
  - `sort` (optional): "created" | "title" | "due_date"
- **Response**: Array of Task objects
- **Auth**: Required (JWT in Authorization header)

---

### Get Single Task

```typescript
export async function getTask(id: string): Promise<Task> {
  return apiRequest<Task>({
    method: 'GET',
    endpoint: `/api/tasks/${id}`,
  });
}
```

**API Contract**:
- **Method**: GET
- **Endpoint**: `/api/tasks/{id}`
- **Response**: Single Task object
- **Auth**: Required
- **Errors**: 404 if task not found or doesn't belong to user

---

### Create Task

```typescript
export interface CreateTaskData {
  title: string;           // 1-200 characters
  description?: string;    // max 1000 characters
  due_date?: string;       // ISO date string (optional)
}

export async function createTask(data: CreateTaskData): Promise<Task> {
  return apiRequest<Task>({
    method: 'POST',
    endpoint: '/api/tasks',
    body: data,
  });
}
```

**API Contract**:
- **Method**: POST
- **Endpoint**: `/api/tasks`
- **Body**: `{ title, description?, due_date? }`
- **Response**: Created Task object with id, timestamps, user_id
- **Auth**: Required
- **Validation**: Backend validates title length (1-200) and description length (max 1000)

---

### Update Task

```typescript
export interface UpdateTaskData {
  title?: string;
  description?: string;
  due_date?: string;
}

export async function updateTask(id: string, data: UpdateTaskData): Promise<Task> {
  return apiRequest<Task>({
    method: 'PUT',
    endpoint: `/api/tasks/${id}`,
    body: data,
  });
}
```

**API Contract**:
- **Method**: PUT
- **Endpoint**: `/api/tasks/{id}`
- **Body**: `{ title?, description?, due_date? }`
- **Response**: Updated Task object
- **Auth**: Required
- **Errors**: 404 if task not found, 403 if task doesn't belong to user

---

### Delete Task

```typescript
export async function deleteTask(id: string): Promise<void> {
  return apiRequest<void>({
    method: 'DELETE',
    endpoint: `/api/tasks/${id}`,
  });
}
```

**API Contract**:
- **Method**: DELETE
- **Endpoint**: `/api/tasks/{id}`
- **Response**: 204 No Content (or confirmation message)
- **Auth**: Required
- **Errors**: 404 if task not found, 403 if task doesn't belong to user

---

### Toggle Task Completion

```typescript
export async function toggleTaskComplete(id: string): Promise<Task> {
  return apiRequest<Task>({
    method: 'PATCH',
    endpoint: `/api/tasks/${id}/complete`,
  });
}
```

**API Contract**:
- **Method**: PATCH
- **Endpoint**: `/api/tasks/{id}/complete`
- **Body**: None (backend toggles current completed state)
- **Response**: Updated Task object with toggled completed status
- **Auth**: Required
- **Errors**: 404 if task not found, 403 if task doesn't belong to user

## Error Handling Patterns

### Client-Side Usage

```typescript
// In a React component
import * as api from '@/lib/api';
import { useState } from 'react';

function MyComponent() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTask = async (data: api.CreateTaskData) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTask = await api.createTask(data);
      // Success - update UI
      console.log('Task created:', newTask);
    } catch (err) {
      // Error - show user-friendly message
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {/* Rest of component */}
    </>
  );
}
```

### Error Types

| Error Scenario | HTTP Status | Client Behavior |
|----------------|-------------|-----------------|
| Unauthorized (no/invalid token) | 401 | Redirect to /login, clear session |
| Forbidden (not your task) | 403 | Show error message, refresh task list |
| Not Found | 404 | Show error message, remove from local state |
| Validation Error | 422 | Display validation messages from backend |
| Server Error | 500 | Show generic error, suggest retry |
| Network Timeout | N/A (AbortError) | Show timeout message, suggest retry |
| Network Error | N/A | Show offline message, suggest checking connection |

## Type Definitions

**File**: `/types/index.ts`

```typescript
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;  // ISO date string
  updated_at: string;  // ISO date string
  due_date?: string;   // ISO date string
}

export type TaskStatus = 'all' | 'pending' | 'completed';
export type TaskSortOption = 'created' | 'title' | 'due_date';

export interface User {
  id: string;
  email: string;
  name: string;
}
```

## Usage Guidelines

### DO:
✅ Import and use API functions from `/lib/api.ts`
✅ Handle errors with try-catch and display user-friendly messages
✅ Show loading states during API calls
✅ Use TypeScript types for request/response data

### DON'T:
❌ Make direct `fetch()` calls to the backend
❌ Manually construct Authorization headers
❌ Ignore 401 errors (always redirect to login)
❌ Expose technical error details to users

## Testing Considerations

### Mocking the API Client

For unit tests, mock the API client functions:

```typescript
// In test file
import * as api from '@/lib/api';

jest.mock('@/lib/api', () => ({
  getTasks: jest.fn(),
  createTask: jest.fn(),
  // ... other functions
}));

// In test
(api.getTasks as jest.Mock).mockResolvedValue([mockTask1, mockTask2]);
```

### Integration Testing

For integration tests, use MSW (Mock Service Worker) to intercept network requests:

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get(`${API_BASE_URL}/api/tasks`, (req, res, ctx) => {
    return res(ctx.json([{ id: '1', title: 'Test Task', /* ... */ }]));
  })
);
```

## Security Considerations

1. **JWT Storage**: JWT is stored in Better Auth session (secure HTTP-only cookie by default)
2. **Token Transmission**: Always use HTTPS in production (tokens in Authorization header)
3. **Token Expiration**: Backend validates token expiration; client redirects on 401
4. **CORS**: Backend must whitelist frontend origin
5. **No Credentials in URL**: Never pass JWT as query parameter

## Performance Optimizations

### Request Deduplication (Future Enhancement)

For identical simultaneous requests, deduplicate to avoid redundant API calls:

```typescript
const pendingRequests = new Map<string, Promise<any>>();

function deduplicatedRequest(key: string, fn: () => Promise<any>) {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }
  const promise = fn().finally(() => pendingRequests.delete(key));
  pendingRequests.set(key, promise);
  return promise;
}
```

### Caching (Future Enhancement)

Implement simple in-memory cache for GET requests:

```typescript
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}
```

## Future Enhancements (Out of Scope for Phase II)

- Request retry logic with exponential backoff
- Request queuing for offline support
- GraphQL client as alternative to REST
- WebSocket client for real-time updates
- Request cancellation for aborted user actions
- Advanced caching with SWR or React Query integration
- Optimistic updates with rollback on failure
