import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('authjs.session-token') || 
                request.cookies.get('__Secure-authjs.session-token');

  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute =
    pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtectedRoute =
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/dashboard') ||
    isAdminRoute;

  // Allow access to auth routes without authentication check
  // (We'll handle redirect in the page component if needed)
  if (isAuthRoute) {
    return NextResponse.next();
  }

  // Require authentication for protected routes
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For admin routes, we'll check the role in the page component
  // since we can't decode JWT in Edge runtime without the secret
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};
