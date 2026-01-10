'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-provider';

/**
 * Navbar component with logo, user info, and logout button.
 *
 * Features:
 * - Sticky positioning
 * - Shows user name and logout button when authenticated
 * - Responsive design (adapts to mobile)
 * - Logout clears session and redirects to login
 */
export function Navbar() {
  const router = useRouter();
  const { user, isLoading, logout } = useSession();

  /**
   * Handle logout click.
   */
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login page after logout
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Don't render navbar while loading or if not authenticated
  if (isLoading || !user) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-[var(--card-bg)] border-b border-[var(--color-border)] shadow-sm">
      <div className="container mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-700)] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2zm0 2a2 2 0 012-2h10a2 2 0 012-2v10a2 2 0 002-2H9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
              TaskMaster
            </h1>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-2 bg-[var(--background)] rounded-full border border-[var(--color-border)]">
              <svg className="w-5 h-5 text-[var(--color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0M12 14a4 4 0 00-4-4 4 4 0 018 0z" />
              </svg>
              <span className="text-sm font-semibold text-[var(--color-foreground)] hidden sm:inline-block">
                {user.name}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-gradient-to-r from-[var(--color-danger-500)] to-[var(--color-danger-600)] text-white font-semibold rounded-xl hover:from-[var(--color-danger-600)] hover:to-[var(--color-danger-700)] transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
