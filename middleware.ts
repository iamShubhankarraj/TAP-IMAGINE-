import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  const search = url.search;
  const redirectDest = `${pathname}${search}`;

  const { data: { session } } = await supabase.auth.getSession();

  const isPublicHome = pathname === '/';
  const isAuthRoute = pathname.startsWith('/auth');
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/editor');

  // Handle auth callback and reset password routes
  if (pathname.includes('/callback') || pathname.includes('/reset-password')) {
    // Let these routes pass through - they handle their own auth logic
    return res;
  }

  // If user is authenticated and trying to access main auth page, redirect to dashboard
  if (session && isAuthRoute && pathname === '/auth') {
    // Check if there's a redirect parameter in the URL
    const urlParams = new URLSearchParams(search);
    const hasRedirect = urlParams.has('redirect');
    
    // If no specific redirect, go to dashboard
    if (!hasRedirect) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Gate protected routes when unauthenticated
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/auth', req.url);
    redirectUrl.searchParams.set('mode', 'login');
    redirectUrl.searchParams.set('redirect', redirectDest);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle legacy auth routes (/auth/login, /auth/signup)
  if (pathname === '/auth/login' || pathname === '/auth/signup') {
    const mode = pathname === '/auth/login' ? 'login' : 'signup';
    const redirectUrl = new URL('/auth', req.url);
    redirectUrl.searchParams.set('mode', mode);
    
    // Preserve any existing redirect parameter
    const urlParams = new URLSearchParams(search);
    const existingRedirect = urlParams.get('redirect');
    if (existingRedirect) {
      redirectUrl.searchParams.set('redirect', existingRedirect);
    }
    
    return NextResponse.redirect(redirectUrl);
  }

  // For authenticated users accessing the home page, let them stay there
  // (not auto-redirecting to dashboard as per requirement)
  
  return res;
}

export const config = {
  // Exclude Next assets, favicon from middleware
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};