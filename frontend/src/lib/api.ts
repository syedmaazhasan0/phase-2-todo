/**
 * API client for Todo backend integration.
 *
 * Provides centralized functions for all task CRUD operations with JWT authentication.
 * Handles JWT token extraction from Better Auth session and error responses.
 */

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Task interface matching backend TaskResponse
export interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// Create request interface
export interface TaskCreate {
  title: string;        // Required, 1-200 chars
  description?: string;  // Optional, max 1000 chars
}

// Update request interface
export interface TaskUpdate {
  title?: string;       // If provided, 1-200 chars
  description?: string; // If provided, max 1000 chars
  completed?: boolean;
}

// Error response interface
export interface ApiError {
  detail: string;
  status?: number;
}

/**
 * Custom error class for API errors.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public detail?: any
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Extract JWT token from Better Auth session storage.
 * Better Auth stores JWT in localStorage/session.
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    // Try to get token from localStorage (common pattern)
    const sessionStr = localStorage.getItem("better-auth.session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      // Look for JWT token in session
      // Common Better Auth keys: "token", "user" object with session token
      if (session.token) {
        return session.token;
      }
      if (session.user?.sessionToken) {
        return session.user.sessionToken;
      }
      if (session.sessionToken) {
        return session.sessionToken;
      }
    }
  } catch (e) {
    console.error("Failed to extract auth token:", e);
    return null;
  }
}

/**
 * Make an authenticated API request to the backend.
 * Automatically attaches JWT token to Authorization header.
 *
 * @param endpoint - API endpoint path (e.g., "/api/tasks")
 * @param options - Fetch options (method, body, etc.)
 * @returns Promise with parsed JSON response
 * @throws ApiError on HTTP errors (401, 403, 404, 422, etc.)
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError("No authentication token available", 401);
  }

  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorDetail = await response.text().catch(() => {
      try {
        const json = JSON.parse(text);
        return json.detail || json.message || response.statusText;
      } catch {
        return text || response.statusText;
      }
    });

    throw new ApiError(errorDetail, response.status);
  }

  // Parse JSON response for successful requests
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }

  return (await response.text()) as T;
}

/**
 * Tasks API object with all CRUD operations.
 */
export const tasksApi = {
  /**
   * List all tasks for the authenticated user.
   *
   * @param status - Filter by completion status: "all", "pending", "completed"
   * @param sort - Sort order: "created" (newest first, default), "title" (alphabetical)
   * @returns Promise<Task[]> - Array of tasks
   */
  list: async (status?: "all" | "pending" | "completed", sort?: "created" | "title"): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (status && status !== "all") {
      params.append("status", status);
    }
    if (sort) {
      params.append("sort", sort);
    }

    const query = params.toString() ? `?${params}` : "";
    return apiRequest<Task[]>(`/api/tasks${query}`);
  },

  /**
   * Get a single task by ID.
   *
   * @param id - Task ID to retrieve
   * @returns Promise<Task> - Task details
   */
  get: async (id: number): Promise<Task> => {
    return apiRequest<Task>(`/api/tasks/${id}`);
  },

  /**
   * Create a new task.
   *
   * @param task - Task data to create (title required, description optional)
   * @returns Promise<Task> - Created task with ID
   */
  create: async (task: TaskCreate): Promise<Task> => {
    return apiRequest<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  },

  /**
   * Update an existing task.
   *
   * @param id - Task ID to update
   * @param updates - Task fields to update (all optional)
   * @returns Promise<Task> - Updated task
   */
  update: async (id: number, updates: TaskUpdate): Promise<Task> => {
    return apiRequest<Task>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a task by ID.
   *
   * @param id - Task ID to delete
   * @returns Promise<void> - No content on success
   */
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Toggle task completion status.
   *
   * @param id - Task ID to toggle
   * @returns Promise<Task> - Updated task with toggled completed status
   */
  toggleComplete: async (id: number): Promise<Task> => {
    return apiRequest<Task>(`/api/tasks/${id}/complete`, {
      method: "PATCH",
    });
  },
};

// Export all components for convenience
export { getAuthToken, ApiError, tasksApi };
