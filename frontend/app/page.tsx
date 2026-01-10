'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-provider';
import TasksDashboardClient from './tasks/_components/TasksDashboardClient';

export default function HomePage() {
  const router = useRouter();
  const { user } = useSession();
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-700)] bg-clip-text text-transparent mb-4">
            {isAuthenticated ? 'My Tasks' : 'Tasks Dashboard'}
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-foreground)]/90 max-w-2xl mx-auto mb-8">
            {isAuthenticated
              ? 'Manage your personal tasks efficiently with our intuitive platform.'
              : 'Browse the app interface. Sign in to create your own tasks.'}
          </p>

          {!isAuthenticated && (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] text-white font-semibold rounded-xl hover:from-[var(--color-primary-600)] hover:to-[var(--color-primary-700)] transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                 onClick={() => router.push('/login')}>
              <span>Sign In to Get Started</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          )}
        </div>

        <TasksDashboardClient
          tasks={[]}
          isAuthenticated={isAuthenticated}
          currentUser={user}
        />
      </div>
    </div>
  );
}
