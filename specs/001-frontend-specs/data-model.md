# Data Model: TypeScript Interfaces for Frontend

**Feature**: Frontend Specifications for Todo Full-Stack Web Application
**Branch**: `001-frontend-specs`
**Date**: 2026-01-01
**Purpose**: Define TypeScript types and interfaces for all data entities used in the frontend application

---

## Overview

This document defines the TypeScript interfaces that represent data entities in the Todo application frontend. These types ensure type safety across components, API calls, and state management. All interfaces mirror the backend API response structure.

**File Location**: `/types/index.ts` (in frontend directory)

---

## Core Entities

### Task

Represents a single todo item belonging to a user.

```typescript
/**
 * Task entity representing a user's todo item.
 *
 * @property id - Unique identifier (UUID)
 * @property user_id - ID of the user who owns this task (UUID)
 * @property title - Task title (1-200 characters, required)
 * @property description - Optional task description (max 1000 characters)
 * @property completed - Whether the task is completed (default: false)
 * @property created_at - ISO 8601 timestamp when task was created
 * @property updated_at - ISO 8601 timestamp when task was last updated
 * @property due_date - Optional ISO 8601 date when task is due
 */
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;  // ISO 8601 format: "2026-01-01T12:00:00Z"
  updated_at: string;  // ISO 8601 format: "2026-01-01T12:00:00Z"
  due_date?: string;   // ISO 8601 date format: "2026-01-15"
}
```

**Validation Rules** (enforced by backend, checked on frontend):
- `title`: Required, 1-200 characters
- `description`: Optional, max 1000 characters
- `completed`: Boolean, defaults to false
- `created_at`, `updated_at`: Automatically set by backend
- `due_date`: Optional, must be valid ISO 8601 date if provided

**Usage Example**:
```typescript
const task: Task = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  user_id: "660e8400-e29b-41d4-a716-446655440001",
  title: "Complete frontend specifications",
  description: "Write comprehensive specs for all UI components",
  completed: false,
  created_at: "2026-01-01T10:30:00Z",
  updated_at: "2026-01-01T10:30:00Z",
  due_date: "2026-01-05"
};
```

---

### User

Represents an authenticated user.

```typescript
/**
 * User entity representing an authenticated user.
 *
 * @property id - Unique identifier (UUID)
 * @property email - User's email address (used for login)
 * @property name - User's display name
 */
export interface User {
  id: string;
  email: string;
  name: string;
}
```

**Source**: User data comes from Better Auth session after successful authentication.

**Usage Example**:
```typescript
const user: User = {
  id: "660e8400-e29b-41d4-a716-446655440001",
  email: "user@example.com",
  name: "John Doe"
};
```

---

## Type Aliases & Enums

### TaskStatus

Union type for task status filter options.

```typescript
/**
 * Task status filter options.
 *
 * - 'all': Show all tasks
 * - 'pending': Show only incomplete tasks (completed = false)
 * - 'completed': Show only complete tasks (completed = true)
 */
export type TaskStatus = 'all' | 'pending' | 'completed';
```

**Usage**: Used in filter dropdown and API query parameter.

```typescript
const [status, setStatus] = useState<TaskStatus>('all');
```

---

### TaskSortOption

Union type for task sorting options.

```typescript
/**
 * Task sorting options.
 *
 * - 'created': Sort by created_at timestamp (most recent first)
 * - 'title': Sort by title alphabetically (A-Z)
 * - 'due_date': Sort by due_date (soonest first, nulls last)
 */
export type TaskSortOption = 'created' | 'title' | 'due_date';
```

**Usage**: Used in sort dropdown and API query parameter.

```typescript
const [sort, setSort] = useState<TaskSortOption>('created');
```

---

## API Request/Response Types

### CreateTaskData

Request body for creating a new task.

```typescript
/**
 * Data required to create a new task.
 *
 * @property title - Task title (required, 1-200 chars)
 * @property description - Optional task description (max 1000 chars)
 * @property due_date - Optional due date (ISO 8601 format)
 */
export interface CreateTaskData {
  title: string;
  description?: string;
  due_date?: string;
}
```

**API Endpoint**: `POST /api/tasks`

**Example**:
```typescript
const newTaskData: CreateTaskData = {
  title: "Buy groceries",
  description: "Milk, eggs, bread"
};
```

---

### UpdateTaskData

Request body for updating an existing task.

```typescript
/**
 * Data for updating a task (all fields optional).
 *
 * Only provided fields will be updated.
 */
export interface UpdateTaskData {
  title?: string;
  description?: string;
  due_date?: string;
}
```

**API Endpoint**: `PUT /api/tasks/{id}`

**Example**:
```typescript
const updates: UpdateTaskData = {
  title: "Buy groceries and clean house"
};
```

---

### GetTasksParams

Query parameters for fetching tasks.

```typescript
/**
 * Query parameters for GET /api/tasks.
 *
 * @property status - Filter by task status (optional)
 * @property sort - Sort order (optional, default: 'created')
 */
export interface GetTasksParams {
  status?: TaskStatus;
  sort?: TaskSortOption;
}
```

**API Endpoint**: `GET /api/tasks?status=pending&sort=title`

**Example**:
```typescript
const params: GetTasksParams = {
  status: 'pending',
  sort: 'title'
};
```

---

## Form State Types

### AuthFormData

State for authentication form (login/signup).

```typescript
/**
 * Form data for authentication (login/signup).
 *
 * @property email - User's email address (required for both modes)
 * @property password - User's password (required for both modes)
 * @property name - User's display name (required for signup only)
 */
export interface AuthFormData {
  email: string;
  password: string;
  name?: string;  // Only for signup mode
}
```

**Usage**:
```typescript
const [formData, setFormData] = useState<AuthFormData>({
  email: '',
  password: '',
  name: '' // Only used in signup mode
});
```

---

### TaskFormData

State for task creation/edit form.

```typescript
/**
 * Form data for creating or editing a task.
 *
 * Subset of Task interface with only user-editable fields.
 */
export interface TaskFormData {
  title: string;
  description?: string;
  due_date?: string;
}
```

**Usage**:
```typescript
const [formData, setFormData] = useState<TaskFormData>({
  title: '',
  description: ''
});
```

---

## Component Prop Types

### TaskCardProps

Props for TaskCard component.

```typescript
/**
 * Props for TaskCard component.
 *
 * @property task - The task to display
 * @property onEdit - Callback when edit button clicked
 * @property onDelete - Callback when delete button clicked
 * @property onToggleComplete - Callback when checkbox toggled
 */
export interface TaskCardProps {
  task: Task;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
}
```

---

### TaskFormProps

Props for TaskForm component.

```typescript
/**
 * Props for TaskForm component.
 *
 * @property mode - 'create' or 'edit'
 * @property initialData - Pre-filled data for edit mode (optional)
 * @property onSubmit - Callback when form submitted (async)
 * @property onCancel - Callback when form cancelled
 * @property isLoading - Whether submission is in progress
 */
export interface TaskFormProps {
  mode: 'create' | 'edit';
  initialData?: TaskFormData;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}
```

---

### ModalProps

Props for Modal component.

```typescript
/**
 * Props for generic Modal component.
 *
 * @property isOpen - Whether modal is visible
 * @property onClose - Callback when modal should close
 * @property title - Modal title
 * @property children - Modal content
 * @property size - Modal width ('sm' | 'md' | 'lg')
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
```

---

## Session & Authentication Types

### Session

Better Auth session structure (simplified).

```typescript
/**
 * Better Auth session structure.
 *
 * @property user - Authenticated user data
 * @property accessToken - JWT access token
 */
export interface Session {
  user: User;
  accessToken: string;  // JWT token
}
```

**Note**: Actual Better Auth session may have additional fields. Consult Better Auth documentation for complete type.

---

## Utility Types

### ApiResponse

Generic API response wrapper (if backend uses consistent format).

```typescript
/**
 * Generic API response wrapper (if needed).
 *
 * Use this if backend wraps responses in a consistent structure.
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
```

**Note**: May not be needed if backend returns data directly.

---

### ApiError

Error response structure.

```typescript
/**
 * API error response structure.
 *
 * @property detail - Error message from backend
 * @property status - HTTP status code
 */
export interface ApiError {
  detail: string;
  status: number;
}
```

**Usage**:
```typescript
catch (error) {
  const apiError = error as ApiError;
  console.error(`Error ${apiError.status}: ${apiError.detail}`);
}
```

---

## Type Guards

Helper functions for type checking at runtime.

```typescript
/**
 * Type guard to check if error is an ApiError.
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'detail' in error &&
    'status' in error
  );
}

/**
 * Type guard to check if a task is completed.
 */
export function isCompletedTask(task: Task): boolean {
  return task.completed === true;
}
```

---

## Complete Type Definitions File

Here's the complete `/types/index.ts` file combining all definitions:

```typescript
// /types/index.ts

// ============================================================================
// Core Entities
// ============================================================================

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  due_date?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

// ============================================================================
// Type Aliases & Enums
// ============================================================================

export type TaskStatus = 'all' | 'pending' | 'completed';
export type TaskSortOption = 'created' | 'title' | 'due_date';

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateTaskData {
  title: string;
  description?: string;
  due_date?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  due_date?: string;
}

export interface GetTasksParams {
  status?: TaskStatus;
  sort?: TaskSortOption;
}

// ============================================================================
// Form State Types
// ============================================================================

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  due_date?: string;
}

// ============================================================================
// Component Prop Types
// ============================================================================

export interface TaskCardProps {
  task: Task;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
}

export interface TaskFormProps {
  mode: 'create' | 'edit';
  initialData?: TaskFormData;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// Session & Authentication Types
// ============================================================================

export interface Session {
  user: User;
  accessToken: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface ApiError {
  detail: string;
  status: number;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'detail' in error &&
    'status' in error
  );
}

export function isCompletedTask(task: Task): boolean {
  return task.completed === true;
}
```

---

## Usage in Components

### Example: Using Task interface in a component

```typescript
import { Task } from '@/types';

function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example: Using CreateTaskData in API call

```typescript
import { CreateTaskData, Task } from '@/types';
import { createTask } from '@/lib/api';

async function handleCreate(data: CreateTaskData) {
  const newTask: Task = await createTask(data);
  console.log('Created task:', newTask);
}
```

---

## Type Safety Benefits

1. **Compile-Time Checks**: TypeScript catches type mismatches before runtime
2. **IDE Autocomplete**: IntelliSense suggests available properties
3. **Refactoring Safety**: Renaming properties updates all usages
4. **Documentation**: Types serve as inline documentation
5. **API Contract Validation**: Ensures frontend matches backend response structure

---

## Next Steps

- ✅ TypeScript interfaces defined
- ⏭️ Use these types in API client (`/lib/api.ts`)
- ⏭️ Import types in components for prop types
- ⏭️ Validate API responses match these interfaces during testing
