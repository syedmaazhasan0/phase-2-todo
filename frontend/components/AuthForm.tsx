'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/lib/auth';
import { AuthFormData } from '@/types';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onToggleMode: () => void;
  onSuccess: () => void;
}

export function AuthForm({ mode, onToggleMode, onSuccess }: AuthFormProps) {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset messages
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // Validate name field for signup
        if (!formData.name || formData.name.trim().length === 0) {
          setError('Name is required for signup');
          setIsLoading(false);
          return;
        }

        // Attempt signup
        const result = await signUp(formData.email, formData.password, formData.name);

        if (result.error) {
          setError(result.error.message || 'Signup failed. Please try again.');
          setIsLoading(false);
          return;
        }

        // Show success message and redirect after a brief delay
        setSuccessMessage('Account created successfully! Redirecting...');

        // Add a small delay to show success message before redirecting
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        // Attempt login
        const result = await signIn(formData.email, formData.password);

        if (result.error) {
          setError(result.error.message || 'Invalid email or password');
          setIsLoading(false);
          return;
        }

        // Show success message and redirect after a brief delay
        setSuccessMessage('Logging in...');

        // Add a small delay to show success message before redirecting
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please try again.'
      );
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof AuthFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-700)] rounded-2xl mb-5 shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2zm0 2a2 2 0 012-2h10a2 2 0 012-2v10a2 2 0 002-2H9z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-[var(--color-foreground)] mb-3">
            {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p className="text-[var(--color-foreground)]/70 text-lg">
            {mode === 'login'
              ? 'Sign in to access your tasks'
              : 'Start managing your tasks today'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--card-bg)] rounded-3xl shadow-2xl p-8 border border-[var(--color-border)]">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-gradient-to-r from-[var(--color-success-50)] to-[var(--color-success-100)] border border-[var(--color-success-200)] text-[var(--color-success-700)] px-5 py-4 rounded-xl mb-6 flex items-center gap-3 shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-success-100)] flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--color-success-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && !successMessage && (
            <div className="bg-gradient-to-r from-[var(--color-danger-50)] to-[var(--color-danger-100)] border border-[var(--color-danger-200)] text-[var(--color-danger-700)] px-5 py-4 rounded-xl mb-6 flex items-center gap-3 shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-danger-100)] flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--color-danger-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (Signup Only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="John Doe"
                    required={mode === 'signup'}
                    disabled={isLoading}
                    className={`w-full px-6 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 ${
                      isLoading
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-200 bg-white/70 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Email Address
              </label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 011.78 0H5a2 2 0 00-2 2v11a2 2 0 002 2h12.5a2 2 0 001.89-1.11l-1.52-2.75a2 2 0 00-2.83-1.19L6 17.36a2 2 0 001.11 1.99H9a2 2 0 00-2-2V9z" />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  className={`w-full pl-14 pr-6 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 ${
                    isLoading
                      ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-200 bg-white/70 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4v12a2 2 0 002 2h6a2 2 0 002-2V9c0-1.105-.553-2-2-2z" />
                </svg>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                  required
                  minLength={8}
                  disabled={isLoading}
                  className={`w-full pl-14 pr-6 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 ${
                    isLoading
                      ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-200 bg-white/70 focus:border-blue-500'
                  }`}
                />
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M15 9a3 3 0 11-6 0 3 3 0 016 0m-6 0a1 1 0 000 2 3 0 000 2m0 6a1 1 0 000 2 3 0 000 2" />
                  </svg>
                  Must be at least 8 characters
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 ${
                isLoading
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {mode === 'login' ? 'Log In' : 'Sign Up'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5l-4-4l-4 4m0 6l4-4M4 17h16" />
                  </svg>
                </span>
              )}
            </button>

            {/* Toggle Mode Button */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={onToggleMode}
                disabled={isLoading}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  isLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300'
                }`}
              >
                {mode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <span className="text-blue-600 font-bold">Sign Up</span>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <span className="text-blue-600 font-bold">Log In</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
