/**
 * API Client Contract for Todo Full-Stack Web Application
 *
 * This file defines the TypeScript interface for the centralized API client
 * that handles all communication with the FastAPI backend.
 *
 * Implementation: /lib/api.ts (in frontend directory)
 *
 * All functions automatically attach JWT token from Better Auth session
 * and handle 401 errors by redirecting to login.
 */

import type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  GetTasksParams,
} from '@/types';

// ============================================================================
// Configuration
// ============================================================================

/**
 * API base URL from environment variable.
 * Default: http://localhost:8000 (development)
 * Production: Set NEXT_PUBLIC_API_URL in .env
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Request timeout in milliseconds (10 seconds)
 */
export const REQUEST_TIMEOUT = 10000;

// ============================================================================
// API Client Interface
// ============================================================================

/**
 * Get all tasks for the authenticated user.
 *
 * **Endpoint**: GET /api/tasks
 *
 * **Query Parameters**:
 * - status (optional): 'all' | 'pending' | 'completed'
 * - sort (optional): 'created' | 'title' | 'due_date'
 *
 * **Returns**: Array of Task objects
 *
 * **Authentication**: Required (JWT in Authorization header)
 *
 * **Example**:
 * ```typescript
 * const allTasks = await getTasks();
 * const pendingTasks = await getTasks({ status: 'pending' });
 * const sortedByTitle = await getTasks({ sort: 'title' });
 * ```
 */
export function getTasks(params?: GetTasksParams): Promise<Task[]>;

/**
 * Get a single task by ID.
 *
 * **Endpoint**: GET /api/tasks/{id}
 *
 * **Parameters**:
 * - id: Task UUID
 *
 * **Returns**: Single Task object
 *
 * **Authentication**: Required
 *
 * **Errors**:
 * - 404 if task not found or doesn't belong to user
 * - 401 if not authenticated
 *
 * **Example**:
 * ```typescript
 * const task = await getTask('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export function getTask(id: string): Promise<Task>;

/**
 * Create a new task.
 *
 * **Endpoint**: POST /api/tasks
 *
 * **Request Body**:
 * ```json
 * {
 *   "title": "Task title (1-200 chars)",
 *   "description": "Optional description (max 1000 chars)",
 *   "due_date": "2026-01-15" (optional, ISO 8601 date)
 * }
 * ```
 *
 * **Returns**: Created Task object with id, user_id, timestamps
 *
 * **Authentication**: Required (user_id automatically set from JWT)
 *
 * **Validation**:
 * - title: Required, 1-200 characters
 * - description: Optional, max 1000 characters
 *
 * **Errors**:
 * - 422 if validation fails
 * - 401 if not authenticated
 *
 * **Example**:
 * ```typescript
 * const newTask = await createTask({
 *   title: 'Buy groceries',
 *   description: 'Milk, eggs, bread'
 * });
 * ```
 */
export function createTask(data: CreateTaskData): Promise<Task>;

/**
 * Update an existing task.
 *
 * **Endpoint**: PUT /api/tasks/{id}
 *
 * **Parameters**:
 * - id: Task UUID to update
 *
 * **Request Body** (all fields optional):
 * ```json
 * {
 *   "title": "Updated title",
 *   "description": "Updated description",
 *   "due_date": "2026-01-20"
 * }
 * ```
 *
 * **Returns**: Updated Task object
 *
 * **Authentication**: Required
 *
 * **Errors**:
 * - 404 if task not found
 * - 403 if task doesn't belong to user
 * - 422 if validation fails
 * - 401 if not authenticated
 *
 * **Example**:
 * ```typescript
 * const updated = await updateTask('550e8400-e29b-41d4-a716-446655440000', {
 *   title: 'Buy groceries and clean house'
 * });
 * ```
 */
export function updateTask(id: string, data: UpdateTaskData): Promise<Task>;

/**
 * Delete a task.
 *
 * **Endpoint**: DELETE /api/tasks/{id}
 *
 * **Parameters**:
 * - id: Task UUID to delete
 *
 * **Returns**: void (no response body)
 *
 * **Authentication**: Required
 *
 * **Errors**:
 * - 404 if task not found
 * - 403 if task doesn't belong to user
 * - 401 if not authenticated
 *
 * **Example**:
 * ```typescript
 * await deleteTask('550e8400-e29b-41d4-a716-446655440000');
 * // Task deleted, remove from UI
 * ```
 */
export function deleteTask(id: string): Promise<void>;

/**
 * Toggle task completion status.
 *
 * **Endpoint**: PATCH /api/tasks/{id}/complete
 *
 * **Parameters**:
 * - id: Task UUID to toggle
 *
 * **Behavior**:
 * - If task.completed === false → set to true
 * - If task.completed === true → set to false
 *
 * **Returns**: Updated Task object with toggled completed status
 *
 * **Authentication**: Required
 *
 * **Errors**:
 * - 404 if task not found
 * - 403 if task doesn't belong to user
 * - 401 if not authenticated
 *
 * **Example**:
 * ```typescript
 * // Toggle completion (optimistic update pattern)
 * const updatedTask = await toggleTaskComplete('550e8400-e29b-41d4-a716-446655440000');
 * console.log(`Task now ${updatedTask.completed ? 'completed' : 'pending'}`);
 * ```
 */
export function toggleTaskComplete(id: string): Promise<Task>;

// ============================================================================
// Internal Helper Functions (not exported)
// ============================================================================

/**
 * Get JWT token from Better Auth session.
 *
 * **Internal use only** - called by apiRequest()
 *
 * **Returns**: JWT string or null if not authenticated
 *
 * **Implementation**:
 * ```typescript
 * import { getSession } from '@/lib/auth';
 *
 * async function getJWTToken(): Promise<string | null> {
 *   const session = await getSession();
 *   return session?.accessToken || null;
 * }
 * ```
 */
// function getJWTToken(): Promise<string | null>;

/**
 * Core request function that handles all API calls.
 *
 * **Internal use only** - used by all exported functions
 *
 * **Features**:
 * - Automatically adds Authorization header with JWT
 * - Handles 401 responses (redirect to login)
 * - Handles timeouts with abort controller
 * - Parses JSON responses
 * - Throws user-friendly error messages
 *
 * **Implementation**:
 * ```typescript
 * async function apiRequest<T>(config: {
 *   method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
 *   endpoint: string;
 *   body?: any;
 *   params?: Record<string, string | number | boolean | undefined>;
 * }): Promise<T> {
 *   // 1. Build URL with query params
 *   // 2. Get JWT token
 *   // 3. Add Authorization header
 *   // 4. Make request with timeout
 *   // 5. Handle 401 → redirect to login
 *   // 6. Parse and return response
 * }
 * ```
 */
// function apiRequest<T>(config: RequestConfig): Promise<T>;

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Error handling behavior:
 *
 * | HTTP Status | Action |
 * |-------------|--------|
 * | 401 | Clear session, redirect to /login, throw error |
 * | 403 | Throw error with "Access forbidden" message |
 * | 404 | Throw error with "Resource not found" message |
 * | 422 | Throw error with validation details from backend |
 * | 500 | Throw error with "Server error - please try again" |
 * | Timeout | Throw error with "Request timed out" |
 * | Network | Throw error with "Unable to connect to server" |
 *
 * All errors include the original message from backend if available.
 */

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example: Fetch and display tasks
 *
 * ```typescript
 * import { getTasks } from '@/lib/api';
 * import { Task } from '@/types';
 *
 * async function TasksPage() {
 *   try {
 *     const tasks: Task[] = await getTasks({ status: 'pending' });
 *     return <TaskList tasks={tasks} />;
 *   } catch (error) {
 *     return <ErrorMessage message="Failed to load tasks" />;
 *   }
 * }
 * ```
 */

/**
 * Example: Create task with error handling
 *
 * ```typescript
 * import { createTask } from '@/lib/api';
 * import { CreateTaskData } from '@/types';
 *
 * async function handleCreate(data: CreateTaskData) {
 *   try {
 *     const newTask = await createTask(data);
 *     // Update UI with new task
 *     setTasks([...tasks, newTask]);
 *     setIsModalOpen(false);
 *   } catch (error) {
 *     setError(error instanceof Error ? error.message : 'Failed to create task');
 *   }
 * }
 * ```
 */

/**
 * Example: Optimistic update for toggle
 *
 * ```typescript
 * import { toggleTaskComplete } from '@/lib/api';
 *
 * async function handleToggle(taskId: string) {
 *   // Optimistic update
 *   const originalTask = tasks.find(t => t.id === taskId);
 *   setTasks(tasks.map(t =>
 *     t.id === taskId ? { ...t, completed: !t.completed } : t
 *   ));
 *
 *   try {
 *     const updatedTask = await toggleTaskComplete(taskId);
 *     // API succeeded, update with server response
 *     setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
 *   } catch (error) {
 *     // Rollback on failure
 *     setTasks(tasks.map(t => t.id === taskId ? originalTask! : t));
 *     setError('Failed to update task');
 *   }
 * }
 * ```
 */

// ============================================================================
// Testing
// ============================================================================

/**
 * Mock API client for testing:
 *
 * ```typescript
 * import * as api from '@/lib/api';
 *
 * jest.mock('@/lib/api', () => ({
 *   getTasks: jest.fn(),
 *   createTask: jest.fn(),
 *   updateTask: jest.fn(),
 *   deleteTask: jest.fn(),
 *   toggleTaskComplete: jest.fn(),
 * }));
 *
 * // In test
 * (api.getTasks as jest.Mock).mockResolvedValue([mockTask1, mockTask2]);
 * ```
 */

// ============================================================================
// Implementation Checklist
// ============================================================================

/**
 * When implementing /lib/api.ts, ensure:
 *
 * - [x] Export all functions matching this contract
 * - [x] Implement getJWTToken() using Better Auth session
 * - [x] Implement apiRequest() with timeout and error handling
 * - [x] Handle 401 responses by redirecting to /login
 * - [x] Add Authorization: Bearer <token> header to all requests
 * - [x] Parse JSON responses and return typed data
 * - [x] Throw user-friendly error messages (no stack traces)
 * - [x] Use API_BASE_URL from environment variable
 * - [x] Set request timeout to 10 seconds
 * - [x] Test all functions with mock backend
 */
