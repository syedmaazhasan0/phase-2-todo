# UI Components Specification

**Feature**: Frontend Specifications for Todo Full-Stack Web Application
**Branch**: `001-frontend-specs`
**Created**: 2026-01-01

## Purpose

This document defines all reusable UI components for the Todo application frontend. All components must follow these principles:

- Placed in `/components` directory
- Use Tailwind CSS exclusively (no inline styles)
- Follow consistent design system (colors, spacing, typography)
- TypeScript with proper type definitions
- Client components only when interactivity is required

## Design System Constants

### Colors
- Primary: `blue-600` (buttons, links, focus states)
- Success: `green-600` (completed tasks, success messages)
- Danger: `red-600` (delete buttons, error messages)
- Warning: `yellow-600` (warnings, pending states)
- Neutral: `gray-100` through `gray-900` (backgrounds, text, borders)

### Spacing
- Follows Tailwind's default spacing scale (4px base unit)
- Component padding: `p-4` or `p-6`
- Card margins: `mb-4`
- Button padding: `px-4 py-2`

### Typography
- Headings: `text-2xl font-bold`, `text-xl font-semibold`
- Body text: `text-base` (16px)
- Small text: `text-sm` (14px)
- Font family: System default (via Tailwind)

## Core Components

### TaskCard

**Purpose**: Display a single task with its metadata and action buttons.

**File**: `/components/TaskCard.tsx`

**Component Type**: Client component (requires onClick handlers)

**Props**:
```typescript
interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    created_at: string;
    due_date?: string;
  };
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
}
```

**Display Requirements**:
- Title: Bold, `text-lg`, truncate if longer than container width
- Description: Truncated to first 100 characters with ellipsis (`...`) if longer
- Completion status: Visual checkbox (checked/unchecked)
- Created date: Formatted as relative time (e.g., "2 hours ago", "3 days ago") in `text-sm text-gray-600`
- Due date (if present): Displayed with calendar icon, color-coded (red if overdue, yellow if due soon)

**Actions**:
- Checkbox: Click to toggle completion (left side of card)
- Edit button: Icon button (pencil icon) on the right
- Delete button: Icon button (trash icon) on the right

**Styling**:
- Card container: `bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`
- Completed state: Add `opacity-75 bg-gray-50` and apply `line-through` to title
- Responsive: Stack actions vertically on mobile (`<640px`)

**Behavior**:
- Hover effects on action buttons
- Loading state while toggling completion
- Disabled state during API operations

---

### TaskForm

**Purpose**: Reusable form for creating and editing tasks.

**File**: `/components/TaskForm.tsx`

**Component Type**: Client component (form with state and handlers)

**Props**:
```typescript
interface TaskFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    title: string;
    description?: string;
  };
  onSubmit: (data: { title: string; description?: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Fields**:
1. **Title** (required):
   - Input type: text
   - Placeholder: "Enter task title..."
   - Validation: 1-200 characters
   - Error message: "Title is required" or "Title must be 200 characters or less"
   - Styling: `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`

2. **Description** (optional):
   - Input type: textarea
   - Placeholder: "Add a description (optional)..."
   - Validation: Max 1000 characters
   - Rows: 4
   - Error message: "Description must be 1000 characters or less"
   - Character counter: Display remaining characters below textarea

**Buttons**:
- Submit: Text changes based on mode ("Create Task" | "Update Task")
  - Styling: `bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed`
  - Disabled when: form invalid or `isLoading` is true
  - Shows spinner when `isLoading` is true

- Cancel: Always visible
  - Styling: `bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300`
  - Never disabled (allows escape even during loading)

**Validation**:
- Client-side validation on blur and submit
- Display error messages below each field in `text-red-600 text-sm mt-1`
- Prevent submission if validation fails

**Behavior**:
- Clear form after successful create
- Close modal after successful submit (handled by parent)
- Preserve input on cancel (prompt user if dirty)

---

### AuthForm

**Purpose**: Single form that toggles between Login and Signup modes.

**File**: `/components/AuthForm.tsx`

**Component Type**: Client component (form with state)

**Props**:
```typescript
interface AuthFormProps {
  mode: 'login' | 'signup';
  onToggleMode: () => void;
  onSuccess: () => void;
}
```

**Fields** (conditional based on mode):

**Login Mode**:
- Email (required): `type="email"`, placeholder "your@email.com"
- Password (required): `type="password"`, placeholder "Your password"

**Signup Mode**:
- Name (required): `type="text"`, placeholder "Your name"
- Email (required): `type="email"`, placeholder "your@email.com"
- Password (required): `type="password"`, placeholder "Choose a password", min length 8

**Integration**:
- Uses Better Auth's `signIn` and `signUp` functions
- Handles authentication errors and displays them below the form
- On success: calls `onSuccess` prop (triggers redirect)

**Buttons**:
- Submit button: "Log In" or "Sign Up" based on mode
  - Styling: `w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700`
- Toggle mode link: "Don't have an account? Sign Up" or "Already have an account? Log In"
  - Styling: `text-blue-600 hover:underline text-sm mt-4 block text-center`

**Error Display**:
- Container: `bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4`
- Shows Better Auth error messages (e.g., "Invalid credentials", "Email already exists")

---

### Navbar

**Purpose**: Persistent navigation bar with logo and logout button.

**File**: `/components/Navbar.tsx`

**Component Type**: Server component (unless logout requires client interaction)

**Props**:
```typescript
interface NavbarProps {
  isAuthenticated: boolean;
  userName?: string;
}
```

**Layout**:
- Container: `bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between`
- Logo/App name (left): "Todo App" with optional icon
  - Styling: `text-xl font-bold text-gray-900`
- User section (right):
  - Display user name if available: `text-sm text-gray-600 mr-4`
  - Logout button: `bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm`

**Behavior**:
- Only shown when `isAuthenticated` is true
- Logout button calls Better Auth's `signOut` function and redirects to login
- Sticky positioning: `sticky top-0 z-50`

**Responsive**:
- On mobile: Stack user name above logout button or hide name entirely

---

### LoadingSpinner

**Purpose**: Reusable loading indicator for async operations.

**File**: `/components/LoadingSpinner.tsx`

**Component Type**: Server component (pure UI)

**Props**:
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}
```

**Variants**:
- **Inline spinner**: Centered within parent container
  - Size sm: 16px, md: 24px (default), lg: 48px
  - Animated spinning circle using Tailwind's `animate-spin`
  - Colors: `text-blue-600`

- **Full-screen spinner**: Covers entire viewport
  - Container: `fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50`
  - Shows larger spinner (48px) with optional message below
  - Message styling: `text-gray-700 mt-4`

**Implementation**:
```typescript
// Use SVG or CSS-based spinner
<svg className="animate-spin h-6 w-6 text-blue-600" /* ... */ />
```

---

### ErrorMessage

**Purpose**: Consistent error message display.

**File**: `/components/ErrorMessage.tsx`

**Component Type**: Server component (pure UI)

**Props**:
```typescript
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}
```

**Layout**:
- Container: `bg-red-50 border border-red-200 rounded-md p-4 mb-4`
- Icon: Red exclamation circle (left side)
- Message: `text-red-800 text-sm`
- Actions (right side, if provided):
  - Retry button: `text-red-600 hover:text-red-800 underline text-sm`
  - Dismiss button: `text-gray-500 hover:text-gray-700 ml-4`

**Variants**:
- **Validation error**: Same styling, used in forms
- **API error**: Includes retry option
- **Warning**: Use yellow colors instead of red (`bg-yellow-50`, `border-yellow-200`, `text-yellow-800`)

---

### Modal

**Purpose**: Generic modal wrapper for forms and dialogs.

**File**: `/components/Modal.tsx`

**Component Type**: Client component (manages focus and escape key)

**Props**:
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
```

**Layout**:
- Backdrop: `fixed inset-0 bg-black bg-opacity-50 z-40`
  - Click backdrop to close (calls `onClose`)
- Modal container: `fixed inset-0 flex items-center justify-center z-50 p-4`
- Modal content: `bg-white rounded-lg shadow-xl max-w-md w-full` (adjusts based on size)
- Header: `border-b border-gray-200 px-6 py-4 flex items-center justify-between`
  - Title: `text-xl font-semibold text-gray-900`
  - Close button (X icon): `text-gray-400 hover:text-gray-600`
- Body: `px-6 py-4`
- Scrollable if content overflows

**Behavior**:
- Trap focus within modal when open
- Close on Escape key press
- Prevent body scroll when modal is open
- Smooth enter/exit animations (fade in/out)

**Accessibility**:
- `role="dialog"`
- `aria-labelledby` pointing to title
- `aria-modal="true"`
- Focus management (auto-focus first input)

---

## Component Organization

```
components/
├── TaskCard.tsx
├── TaskForm.tsx
├── AuthForm.tsx
├── Navbar.tsx
├── LoadingSpinner.tsx
├── ErrorMessage.tsx
├── Modal.tsx
└── icons/           (Optional: shared icon components)
    ├── PencilIcon.tsx
    ├── TrashIcon.tsx
    └── CheckIcon.tsx
```

## Shared Types

Create a shared types file for consistent type definitions:

**File**: `/types/index.ts`

```typescript
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

export type TaskStatus = 'all' | 'pending' | 'completed';
export type TaskSortOption = 'created' | 'title' | 'due_date';
```

## Testing Considerations

Each component should be testable in isolation:
- **TaskCard**: Test rendering with different task states, button click handlers
- **TaskForm**: Test validation logic, mode switching, form submission
- **AuthForm**: Test form validation, Better Auth integration (mocked)
- **Modal**: Test open/close behavior, escape key, backdrop click
- **LoadingSpinner**: Test size variants, full-screen vs inline
- **ErrorMessage**: Test with/without retry and dismiss buttons

## Accessibility Requirements

All components must meet basic accessibility standards:
- Semantic HTML elements (`<button>` not `<div onClick>`)
- Proper ARIA labels for icons and interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- Focus visible states (Tailwind's `focus:` variants)
- Color contrast ratios meeting WCAG AA (text vs background)

## Future Enhancements (Out of Scope for Phase II)

- Dark mode variants for all components
- Animation library integration (Framer Motion)
- Skeleton loading states
- Toast notification system
- Dropdown menus and select components
- Date picker for due dates
- Rich text editor for descriptions
