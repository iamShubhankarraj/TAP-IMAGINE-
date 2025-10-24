import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(req: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  const isSessionValid =
    !!session && (!session.expires_at || session.expires_at * 1000 > Date.now());

  if (isSessionValid) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  const url = new URL('/auth', req.url);
  url.searchParams.set('mode', 'login');
  url.searchParams.set('redirect', '/dashboard');
  return NextResponse.redirect(url);
}