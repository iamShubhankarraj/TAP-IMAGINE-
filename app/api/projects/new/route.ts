import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * Create a new project row for the signed-in user.
 * If SUPABASE_SERVICE_ROLE_KEY is configured, use service client to bypass RLS safely on the server.
 * Otherwise use the cookies-based client which requires proper RLS policies.
 */
export async function POST(request: Request) {
  try {
    // Attempt to use service role client if available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Read optional payload values
    let payload: any = {};
    try {
      payload = await request.json();
    } catch {
      payload = {};
    }

    // Fallback to route handler client (requires RLS policies)
    let userId: string | null = null;

    // If no service key, use auth session from cookies
    if (!serviceKey) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }
      userId = session.user.id;

      const name: string | undefined = payload?.name;
      const prompt: string | undefined = payload?.prompt;
      const template_id: string | undefined = payload?.template_id;

      const insertPayload: Record<string, any> = {
        user_id: userId,
        name: name || 'Untitled Project',
        primary_image_url: null,
        generated_image_url: null,
        prompt: prompt ?? null,
        template_id: template_id ?? null,
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(insertPayload)
        .select('id')
        .single();

      if (error || !data) {
        const details = error ? (error.message || JSON.stringify(error)) : 'unknown_error';
        console.error('Error creating project (RLS client):', error);
        return NextResponse.json(
          { error: 'failed_to_create_project', details, hint: 'Ensure RLS policies allow insert: user_id = auth.uid()' },
          { status: 500 }
        );
      }

      return NextResponse.json({ id: data.id }, { status: 201 });
    }

    // Service role path (bypasses RLS) - requires supabaseUrl + SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'missing_supabase_url', details: 'NEXT_PUBLIC_SUPABASE_URL not set' },
        { status: 500 }
      );
    }

    const serviceClient = createClient(supabaseUrl, serviceKey);

    // We still need the authenticated user id for ownership; get session via route handler client
    const cookieStore = cookies();
    const authClient = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await authClient.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    userId = session.user.id;

    const name: string | undefined = payload?.name;
    const prompt: string | undefined = payload?.prompt;
    const template_id: string | undefined = payload?.template_id;

    const insertPayload: Record<string, any> = {
      user_id: userId,
      name: name || 'Untitled Project',
      primary_image_url: null,
      generated_image_url: null,
      prompt: prompt ?? null,
      template_id: template_id ?? null,
    };

    const { data, error } = await serviceClient
      .from('projects')
      .insert(insertPayload)
      .select('id')
      .single();

    if (error || !data) {
      const details = error ? (error.message || JSON.stringify(error)) : 'unknown_error';
      console.error('Error creating project (service client):', error);
      return NextResponse.json(
        { error: 'failed_to_create_project', details, hint: 'Check table columns and service role key validity' },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (err: any) {
    const details = err?.message || 'internal_error';
    console.error('Unexpected error in /api/projects/new:', err);
    return NextResponse.json({ error: 'internal_error', details }, { status: 500 });
  }
}