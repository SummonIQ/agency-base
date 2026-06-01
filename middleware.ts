import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';
// Note: We're using a separate file for i18n middleware to avoid conflicts

export async function middleware(request: NextRequest) {
  // Skip middleware processing for unprotected routes to avoid redirection loops
  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  // If no session cookie is found and we're accessing a protected route, redirect to login
  if (!sessionCookie) {
    // Store the original URL as a URL parameter for redirect after login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/jobs/:path*',
    '/leads/:path*',
    '/tools/:path*',
    '/profile/:path*',
    '/analytics/:path*',
    '/applications/:path*',
    '/settings/:path*',
    '/linkedin/:path*',
    '/notifications/:path*',
    '/resumes/:path*',
    '/interviews/:path*',
    '/networking/:path*',
  ],
  runtime: 'nodejs',
};
