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
  const isSessionValid =
    !!session && (!session.expires_at || session.expires_at * 1000 > Date.now());

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
  if (isSessionValid && isAuthRoute && pathname === '/auth') {
    // Check if there's a redirect parameter in the URL
    const urlParams = new URLSearchParams(search);
    const hasRedirect = urlParams.has('redirect');
    
    // If no specific redirect, go to dashboard
    if (!hasRedirect) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Gate protected routes when unauthenticated
  if (!isSessionValid && isProtectedRoute) {
    const redirectUrl = new URL('/auth', req.url);
    redirectUrl.searchParams.set('mode', 'signup');
    redirectUrl.searchParams.set('redirect', redirectDest);
    return NextResponse.redirect(redirectUrl);
  }


  // If unauthenticated and landing page, redirect to Sign In first
  if (!isSessionValid && isPublicHome) {
    const redirectUrl = new URL('/auth', req.url);
    redirectUrl.searchParams.set('mode', 'signup');
    redirectUrl.searchParams.set('redirect', '/dashboard');
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