// ============================================================================
// Core Entities
// ============================================================================

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

// ============================================================================
// Type Aliases & Enums
// ============================================================================

/**
 * Task status filter options.
 *
 * - 'all': Show all tasks
 * - 'pending': Show only incomplete tasks (completed = false)
 * - 'completed': Show only complete tasks (completed = true)
 */
export type TaskStatus = 'all' | 'pending' | 'completed';

/**
 * Task sorting options.
 *
 * - 'created': Sort by created_at timestamp (most recent first)
 * - 'title': Sort by title alphabetically (A-Z)
 * - 'due_date': Sort by due_date (soonest first, nulls last)
 */
export type TaskSortOption = 'created' | 'title' | 'due_date';

// ============================================================================
// API Request/Response Types
// ============================================================================

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

// ============================================================================
// Form State Types
// ============================================================================

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

// ============================================================================
// Session & Authentication Types
// ============================================================================

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

// ============================================================================
// Utility Types
// ============================================================================

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

// ============================================================================
// Type Guards
// ============================================================================

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
