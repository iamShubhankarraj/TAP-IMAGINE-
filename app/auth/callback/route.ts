import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';
  const error = requestUrl.searchParams.get('error');
  const intent = requestUrl.searchParams.get('intent') || 'login';

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

      // Successfully authenticated, apply intent-based gating and profile handling
      if (data.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const origin = requestUrl.origin;

          if (intent === 'login') {
            // Require existing registered account for login with Google
            if (profileError && profileError.code === 'PGRST116') {
              await supabase.auth.signOut();
              return NextResponse.redirect(`${origin}/auth?mode=signup&error=${encodeURIComponent('No account found for this Google user. Please sign up first.')}`);
            }
            // If schema includes is_registered flag and it's false, force sign-up
            if ((profile as any)?.is_registered === false) {
              await supabase.auth.signOut();
              return NextResponse.redirect(`${origin}/auth?mode=signup&error=${encodeURIComponent('Please complete sign up first.')}`);
            }
          } else {
            // intent === 'signup' -> ensure profile exists and mark registered
            if (profileError && profileError.code === 'PGRST116') {
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  email: data.user.email,
                  first_name: data.user.user_metadata?.first_name || null,
                  last_name: data.user.user_metadata?.last_name || null,
                  avatar_url: data.user.user_metadata?.avatar_url || null,
                  tier: 'free',
                  is_registered: true,
                });
              if (insertError) {
                console.error('Error creating profile:', insertError);
              }
            } else {
              // Update registration flag if present
              if ((profile as any) && (profile as any)?.is_registered === false) {
                const { error: updateError } = await supabase
                  .from('profiles')
                  .update({ is_registered: true })
                  .eq('id', data.user.id);
                if (updateError) {
                  console.error('Error updating profile registration flag:', updateError);
                }
              }
            }
          }
        } catch (profileErr) {
          console.error('Profile check error:', profileErr);
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