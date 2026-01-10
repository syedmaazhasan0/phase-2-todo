'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getSession, signOut } from './auth';
import type { User } from '@/types';

/**
 * Session context type.
 */
interface SessionContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Session context for accessing authentication state throughout the app.
 */
const SessionContext = createContext<SessionContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

/**
 * Hook to access the current session context.
 *
 * @returns Session context with user, loading state, authentication status, and refresh function
 */
export function useSession() {
  return useContext(SessionContext);
}

/**
 * SessionProvider component wraps the app to provide authentication state.
 *
 * This component fetches the current session on mount and provides it to all children.
 *
 * @param children - React children to wrap with session context
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to refresh the session
  const refreshSession = async () => {
    setIsLoading(true);
    try {
      const session = await getSession();
      if (session?.data?.user) {
        setUser({
          id: session.data.user.id as string,
          email: session.data.user.email as string,
          name: session.data.user.name as string,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to logout the user
  const logout = async () => {
    setIsLoading(true);
    try {
      // Call the signOut function from auth
      await signOut();
      // Clear user state
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
      // Still clear user state even if signOut fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch session on mount
    let cancelled = false; // Prevent state updates after component unmount

    async function fetchSession() {
      try {
        const session = await getSession();
        if (!cancelled && session?.data?.user) {
          setUser({
            id: session.data.user.id as string,
            email: session.data.user.email as string,
            name: session.data.user.name as string,
          });
        } else if (!cancelled) {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchSession();

    // Cleanup function to cancel updates if component unmounts
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SessionContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        refreshSession,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
