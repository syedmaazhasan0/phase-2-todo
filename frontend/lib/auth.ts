/**
 * Custom authentication client for the backend API.
 * Handles login, signup, and session management with the custom backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://maazhassan-todo-deploy.hf.space';

// Cache for the JWT token to avoid repeated localStorage calls
let tokenCache: string | null = null;

/**
 * Get the JWT token from localStorage.
 * The token is stored in localStorage after successful login.
 *
 * @returns The JWT access token or null if not authenticated
 */
export async function getJWTToken(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    // Use cached token if available
    if (tokenCache !== undefined) {
      return tokenCache;
    }
    const token = localStorage.getItem('access_token');
    tokenCache = token;
    return token;
  }
  return null;
}

/**
 * Get the current session by validating the stored token.
 *
 * @returns The current session or null if not authenticated
 */
export async function getSession() {
  try {
    const token = await getJWTToken();

    if (!token) {
      return null;
    }

    // Verify the token by fetching user info
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Token is invalid, remove it
      localStorage.removeItem('access_token');
      // Clear cache
      tokenCache = null;
      return null;
    }

    const user = await response.json();
    return { data: { user } };
  } catch (error) {
    console.error('Failed to get session:', error);
    // Check if this is a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error: Backend server may not be running or accessible');
      console.error('Expected API URL:', `${API_BASE_URL}/api/auth/me`);
    }
    return null;
  }
}

/**
 * Clear the JWT token cache
 */
export function clearTokenCache() {
  tokenCache = null;
}

/**
 * Refresh the session by clearing the token cache and re-fetching user data
 */
export async function refreshSession() {
  clearTokenCache();
  return await getSession();
}

/**
 * Sign in with email and password.
 * Stores the JWT token in localStorage on success and returns user data.
 */
export async function signIn(email: string, password: string) {
  console.log('Attempting to sign in with API_BASE_URL:', API_BASE_URL);
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Response status:', response.status);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || `Login failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Login response data:', data);

    // Store the token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', data.access_token);
      // Clear the token cache to force a refresh
      tokenCache = data.access_token;
    }

    // Return user data directly instead of null
    return {
      data: {
        user: {
          id: null, // Will be retrieved via getSession
          email: email,
          name: null // Name will be retrieved via getSession
        }
      },
      error: null
    };
  } catch (error) {
    console.error('Full login error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to authentication server. Please make sure the backend is accessible at https://maazhassan-todo-deploy.hf.space');
    }
    return { data: null, error: { message: error instanceof Error ? error.message : 'Login failed' } };
  }
}

/**
 * Sign up with email, password, and name.
 * Stores the JWT token in localStorage on success and returns user data.
 */
export async function signUp(email: string, password: string, name: string) {
  console.log('Attempting to sign up with API_BASE_URL:', API_BASE_URL);
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    console.log('Response status:', response.status);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(error.detail || `Registration failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Registration response data:', data);

    // Store the token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', data.access_token);
      // Clear the token cache to force a refresh
      tokenCache = data.access_token;
    }

    // Return user data directly instead of null
    return {
      data: {
        user: {
          id: null, // Will be retrieved via getSession
          email: email,
          name: name
        }
      },
      error: null
    };
  } catch (error) {
    console.error('Full registration error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to authentication server. Please make sure the backend is accessible at https://maazhassan-todo-deploy.hf.space');
    }
    return { data: null, error: { message: error instanceof Error ? error.message : 'Registration failed' } };
  }
}

/**
 * Sign out the current user and clear the session.
 */
export async function signOut() {
  try {
    // Call the backend logout endpoint (for future token invalidation)
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getJWTToken()}`,
        },
      });
    } catch (logoutError) {
      // Even if the backend logout fails, continue with frontend logout
      console.error('Backend logout failed (this is expected in stateless JWT):', logoutError);
    }

    // Remove the token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
    // Clear the token cache
    clearTokenCache();
  } catch (error) {
    console.error('Failed to sign out:', error);
    throw error;
  }
}
