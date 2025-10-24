import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';
  const error = requestUrl.searchParams.get('error');

  if (error) {
    console.error('Auth error from callback:', error);
    return NextResponse.redirect(`${requestUrl.origin}/auth?mode=login&error=${encodeURIComponent(error)}`);
  }

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${requestUrl.origin}/auth?mode=login&error=${encodeURIComponent(error.message)}`);
      }

      // Successfully authenticated, check if user needs profile creation
      if (data.user) {
        try {
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email,
                first_name: data.user.user_metadata?.first_name || null,
                last_name: data.user.user_metadata?.last_name || null,
                avatar_url: data.user.user_metadata?.avatar_url || null,
                tier: 'free'
              });

            if (insertError) {
              console.error('Error creating profile:', insertError);
              // Don't fail the auth, just log the error
            }
          }
        } catch (profileErr) {
          console.error('Profile check error:', profileErr);
          // Don't fail the auth, just log the error
        }
      }
    } catch (error) {
      console.error('Unexpected error exchanging code for session:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth?mode=login&error=${encodeURIComponent('Authentication failed')}`);
    }
  }

  // Redirect to the specified next URL or dashboard
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}