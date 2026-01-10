import { getJWTToken } from './auth';
import type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  GetTasksParams,
} from '@/types';

/**
 * Base URL for the backend API.
 * Configured via NEXT_PUBLIC_API_URL environment variable.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/**
 * Request timeout in milliseconds (10 seconds).
 */
const REQUEST_TIMEOUT = 10000;

/**
 * Configuration for API requests.
 */
interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Core API request function with automatic JWT authentication,
 * timeout handling, and 401 redirect logic.
 *
 * @param config - Request configuration
 * @returns Promise resolving to response data
 * @throws Error for non-2xx responses or network failures
 */
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

  // Get JWT token from Better Auth session
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
      // Clear session and redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized - please log in again');
    }

    // Handle other error status codes
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    // Parse JSON response (handle 204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

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

// ============================================================================
// Task API Functions
// ============================================================================

/**
 * Get all tasks for the authenticated user with optional filtering and sorting.
 *
 * @param params - Query parameters for filtering and sorting
 * @returns Promise resolving to array of Task objects
 */
export async function getTasks(params?: GetTasksParams): Promise<Task[]> {
  return apiRequest<Task[]>({
    method: 'GET',
    endpoint: '/api/tasks',
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * Get a single task by ID.
 *
 * @param id - Task UUID
 * @returns Promise resolving to Task object
 * @throws Error if task not found or doesn't belong to user (404/403)
 */
export async function getTask(id: string): Promise<Task> {
  return apiRequest<Task>({
    method: 'GET',
    endpoint: `/api/tasks/${id}`,
  });
}

/**
 * Create a new task.
 *
 * @param data - Task creation data (title, description, due_date)
 * @returns Promise resolving to created Task object with id and timestamps
 */
export async function createTask(data: CreateTaskData): Promise<Task> {
  return apiRequest<Task>({
    method: 'POST',
    endpoint: '/api/tasks',
    body: data,
  });
}

/**
 * Update an existing task.
 *
 * @param id - Task UUID
 * @param data - Updated task data (all fields optional)
 * @returns Promise resolving to updated Task object
 * @throws Error if task not found or doesn't belong to user (404/403)
 */
export async function updateTask(
  id: string,
  data: UpdateTaskData
): Promise<Task> {
  return apiRequest<Task>({
    method: 'PUT',
    endpoint: `/api/tasks/${id}`,
    body: data,
  });
}

/**
 * Delete a task permanently.
 *
 * @param id - Task UUID
 * @returns Promise resolving when task is deleted
 * @throws Error if task not found or doesn't belong to user (404/403)
 */
export async function deleteTask(id: string): Promise<void> {
  return apiRequest<void>({
    method: 'DELETE',
    endpoint: `/api/tasks/${id}`,
  });
}

/**
 * Toggle the completion status of a task.
 *
 * @param id - Task UUID
 * @returns Promise resolving to updated Task object with toggled completed status
 * @throws Error if task not found or doesn't belong to user (404/403)
 */
export async function toggleTaskComplete(id: string): Promise<Task> {
  return apiRequest<Task>({
    method: 'PATCH',
    endpoint: `/api/tasks/${id}/complete`,
  });
}
