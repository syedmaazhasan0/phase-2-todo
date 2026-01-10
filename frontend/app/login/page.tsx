'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-provider';
import { AuthForm } from '@/components/AuthForm';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const { user, refreshSession } = useSession();

  useEffect(() => {
    let cancelled = false; // Prevent state updates after component unmount

    async function checkAuth() {
      try {
        const { getSession } = await import('@/lib/auth');
        const session = await getSession();
        if (!cancelled && session?.data?.user) {
          router.push('/');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        if (!cancelled) {
          setIsCheckingAuth(false);
        }
      }
    }
    checkAuth();

    // Cleanup function to cancel updates if component unmounts
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSuccess = async () => {
    // Wait a brief moment to ensure token is properly stored
    await new Promise(resolve => setTimeout(resolve, 200));
    // Refresh the session using the context function
    await refreshSession();
    // Navigate to home page
    router.push('/');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  if (isCheckingAuth) {
    return null;
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center mb-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2zm0 2a2 2 0 012-2h10a2 2 0 012-2v10a2 2 0 002-2H9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TaskMaster
            </h1>
          </div>
        </div>
      </div>

      <AuthForm
        mode={mode}
        onToggleMode={toggleMode}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
