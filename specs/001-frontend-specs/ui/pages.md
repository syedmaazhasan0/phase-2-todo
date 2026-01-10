# Pages and Routing Specification

**Feature**: Frontend Specifications for Todo Full-Stack Web Application
**Branch**: `001-frontend-specs`
**Created**: 2026-01-01

## Purpose

This document defines all pages and routing for the Todo application using Next.js 16+ App Router. All pages must follow these principles:

- Located in `/app` directory following App Router conventions
- Server components by default
- Client components only when interactivity is required ('use client' directive)
- Proper loading and error states
- Fully responsive (320px mobile to 1920px+ desktop)
- Only show data belonging to authenticated user

## Routing Structure

```
app/
├── layout.tsx                  # Root layout (Better Auth provider, Navbar)
├── page.tsx                    # Home/redirect page
├── login/
│   └── page.tsx               # Login/Signup page
├── tasks/
│   └── page.tsx               # Tasks dashboard (main app page)
├── loading.tsx                # Global loading UI
├── error.tsx                  # Global error UI
└── not-found.tsx              # 404 page
```

## Pages Specification

### Root Layout

**File**: `/app/layout.tsx`

**Type**: Server component

**Purpose**: Wraps the entire application with global providers, metadata, and persistent UI elements.

**Structure**:
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BetterAuthProvider } from '@/lib/auth-provider';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Todo App | Hackathon II Phase II',
  description: 'Multi-user task management application',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side session check
  const session = await getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <BetterAuthProvider>
          {session && <Navbar isAuthenticated={true} userName={session.user.name} />}
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </BetterAuthProvider>
      </body>
    </html>
  );
}
```

**Key Requirements**:
- Import and configure font (Inter or system font)
- Include global CSS with Tailwind directives
- Wrap app in Better Auth provider
- Conditionally render Navbar only when authenticated
- Set proper metadata for SEO
- Responsive container: `min-h-screen` ensures full viewport height

---

### Home Page

**File**: `/app/page.tsx`

**Type**: Server component

**Purpose**: Entry point that redirects users based on authentication status.

**Behavior**:
1. Check if user is authenticated (server-side session check)
2. If authenticated: redirect to `/tasks`
3. If not authenticated: redirect to `/login`

**Implementation**:
```typescript
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect('/tasks');
  } else {
    redirect('/login');
  }
}
```

**Alternative** (if showing landing page):
- Display hero section with "Get Started" button
- Show features/benefits of the app
- Link to `/login` for sign up

---

### Login Page

**File**: `/app/login/page.tsx`

**Type**: Client component (requires form interactivity)

**Purpose**: Unified authentication page with toggle between login and signup modes.

**Layout**:
- Centered container: `flex min-h-screen items-center justify-center px-4`
- Card: `max-w-md w-full bg-white rounded-lg shadow-lg p-8`
- Logo/Title at top: `text-2xl font-bold text-center mb-6`
- AuthForm component in center
- Optional: Link to forgot password (future enhancement)

**Implementation**:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/AuthForm';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/tasks');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <AuthForm
          mode={mode}
          onToggleMode={toggleMode}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
```

**Protected Route Check**:
- If user is already authenticated, redirect to `/tasks`
- Use middleware or server component check

**SEO**:
```typescript
export const metadata = {
  title: 'Login | Todo App',
  description: 'Log in or sign up to manage your tasks',
};
```

---

### Tasks Dashboard

**File**: `/app/tasks/page.tsx`

**Type**: Hybrid (server component with client components for interactivity)

**Purpose**: Main application page displaying user's tasks with filtering, sorting, and CRUD operations.

**Server Component (Outer Layer)**:
- Fetch initial tasks data server-side
- Pass data to client component
- Verify authentication (redirect to /login if not authenticated)

**Client Component (Inner Layer)**:
- Manage filters, sorting, modal state
- Handle task CRUD operations
- Real-time UI updates

**Layout Structure**:

```
┌─────────────────────────────────────────────────┐
│ Header Section                                  │
│  - Page title: "My Tasks"                       │
│  - Task count: "X tasks"                        │
│  - "Add New Task" button (right side)           │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ Filters & Sort Section                          │
│  - Status filter dropdown: All | Pending | Done │
│  - Sort dropdown: Created | Title | Due Date    │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ Tasks Grid/List                                 │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐     │
│  │ TaskCard  │ │ TaskCard  │ │ TaskCard  │     │
│  └───────────┘ └───────────┘ └───────────┘     │
│  ... (more cards)                               │
└─────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getTasks } from '@/lib/api';
import { TasksDashboardClient } from './_components/TasksDashboardClient';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default async function TasksPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Server-side initial data fetch
  const initialTasks = await getTasks({ status: 'all', sort: 'created' });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <TasksDashboardClient initialTasks={initialTasks} />
      </Suspense>
    </div>
  );
}
```

**Client Component** (`_components/TasksDashboardClient.tsx`):

```typescript
'use client';

import { useState } from 'react';
import { Task, TaskStatus, TaskSortOption } from '@/types';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { Modal } from '@/components/Modal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import * as api from '@/lib/api';

interface Props {
  initialTasks: Task[];
}

export function TasksDashboardClient({ initialTasks }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<TaskStatus>('all');
  const [sort, setSort] = useState<TaskSortOption>('created');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtering and sorting logic
  const filteredAndSortedTasks = tasks
    .filter(task => {
      if (filter === 'all') return true;
      if (filter === 'pending') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === 'title') return a.title.localeCompare(b.title);
      if (sort === 'due_date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return 0;
    });

  // CRUD handlers
  const handleCreateTask = async (data: { title: string; description?: string }) => {
    setIsLoading(true);
    try {
      const newTask = await api.createTask(data);
      setTasks([...tasks, newTask]);
      setIsCreateModalOpen(false);
      setError(null);
    } catch (err) {
      setError('Failed to create task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ... (similar handlers for edit, delete, toggle)

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-1">{tasks.length} tasks</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+ Add New Task</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as TaskStatus)}
            className="border border-gray-300 rounded-md px-3 py-1"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as TaskSortOption)}
            className="border border-gray-300 rounded-md px-3 py-1"
          >
            <option value="created">Created Date</option>
            <option value="title">Title</option>
            <option value="due_date">Due Date</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Tasks Grid */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredAndSortedTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 text-lg">No tasks found</p>
          <p className="text-gray-400 text-sm mt-2">
            {filter !== 'all' ? 'Try changing the filter' : 'Create your first task to get started!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => setEditingTask(task)}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
      >
        <TaskForm
          mode="create"
          onSubmit={handleCreateTask}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>

      {/* Edit Modal */}
      {editingTask && (
        <Modal
          isOpen={true}
          onClose={() => setEditingTask(null)}
          title="Edit Task"
        >
          <TaskForm
            mode="edit"
            initialData={{ title: editingTask.title, description: editingTask.description }}
            onSubmit={handleEditTask}
            onCancel={() => setEditingTask(null)}
            isLoading={isLoading}
          />
        </Modal>
      )}
    </>
  );
}
```

**Key Features**:
- Server-side initial data fetch for fast first paint
- Client-side filtering and sorting (no server round-trip)
- Optimistic UI updates for toggle operations
- Modal-based create/edit (preferred over separate routes)
- Empty states for no tasks or no matching filters
- Responsive grid: 1 column mobile, 2 columns tablet, 3 columns desktop

**SEO**:
```typescript
export const metadata = {
  title: 'My Tasks | Todo App',
  description: 'Manage your personal task list',
};
```

---

## Alternative: Separate Routes for Task Forms

If modals are not preferred, use these routes:

### Create Task Page

**File**: `/app/tasks/new/page.tsx`

**Type**: Client component

**Implementation**: Centered TaskForm with "Create" mode, redirects to `/tasks` on success

### Edit Task Page

**File**: `/app/tasks/[id]/edit/page.tsx`

**Type**: Hybrid (server fetches task data, client handles form)

**Implementation**: Fetches task by ID server-side, renders TaskForm with "Edit" mode

---

## Global UI Components

### Loading UI

**File**: `/app/loading.tsx`

**Type**: Server component

**Purpose**: Shown during page transitions

```typescript
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Loading() {
  return <LoadingSpinner fullScreen message="Loading..." />;
}
```

---

### Error UI

**File**: `/app/error.tsx`

**Type**: Client component (required for error boundaries)

**Purpose**: Catch and display errors

```typescript
'use client';

import { useEffect } from 'react';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md w-full">
        <ErrorMessage
          message={error.message || 'Something went wrong'}
          onRetry={reset}
        />
      </div>
    </div>
  );
}
```

---

### 404 Page

**File**: `/app/not-found.tsx`

**Type**: Server component

```typescript
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">Page not found</p>
        <Link
          href="/tasks"
          className="inline-block mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Go to Tasks
        </Link>
      </div>
    </div>
  );
}
```

---

## Authentication Middleware

**File**: `/middleware.ts` (at project root)

**Purpose**: Protect routes and handle authentication checks at edge.

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const token = await getToken(request);
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isProtectedPage = request.nextUrl.pathname.startsWith('/tasks');

  // Redirect authenticated users away from login page
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/tasks/:path*'],
};
```

---

## Page Transitions & Loading States

All pages should implement:
1. **Suspense boundaries**: Wrap async components in `<Suspense fallback={<LoadingSpinner />}>`
2. **Loading states**: Show spinners during data fetches
3. **Error boundaries**: Catch errors with error.tsx
4. **Optimistic updates**: Update UI immediately, revert on failure

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | Single column task grid, stacked filters, hamburger menu (future) |
| Tablet (640px-1024px) | Two column task grid, inline filters |
| Desktop (>1024px) | Three column task grid, full navbar, wider modals |

---

## Future Enhancements (Out of Scope for Phase II)

- Search page with advanced filters
- Task details page (separate route for each task)
- Settings page for user preferences
- Profile page for account management
- Statistics/dashboard page with charts
- Archive page for deleted tasks
- Calendar view page
