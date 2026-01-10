import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Since we're using localStorage for tokens, we can't check auth status in middleware
  // Instead, we'll handle authentication client-side in our components
  // This middleware will just allow all routes and let the client-side handle auth

  // Define protected routes (routes that require authentication)
  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith('/tasks');

  // Define auth routes (routes that should redirect authenticated users to home)
  const isAuthRoute = pathname === '/login';

  // For now, allow all routes and handle auth client-side
  // The actual authentication check happens in the components
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
