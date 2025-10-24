import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      // Unauthenticated; middleware should already guard /editor, but return 401 for safety
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Try to fetch the most recent project for this user
    const { data: recentProjects, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      // If fetching existing projects failed, log and continue to attempt creation
      console.error('Error fetching recent projects:', fetchError);
    }

    if (recentProjects && recentProjects.length > 0) {
      return NextResponse.json({ id: recentProjects[0].id });
    }

    // If no project exists, create a new one
    const { data: created, error: createError } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: 'Untitled Project',
        data: {},
        is_public: false,
      })
      .select('id')
      .single();

    if (createError || !created) {
      console.error('Error creating new project:', createError);
      return NextResponse.json({ error: 'failed_to_create_project' }, { status: 500 });
    }

    return NextResponse.json({ id: created.id });
  } catch (err) {
    console.error('Unexpected error in /api/projects/start:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}