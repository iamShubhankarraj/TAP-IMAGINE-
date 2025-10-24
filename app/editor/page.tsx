export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import EditorClientPage from './EditorClientPage';

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditorPage({ searchParams }: PageProps) {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth?mode=login&redirect=/editor');
  }

  const sp = searchParams ? await searchParams : undefined;
  const qp = sp?.project;
  let projectId = Array.isArray(qp) ? qp[0] : qp;

  if (!projectId) {
    const { data: recent, error: recentError } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentError) {
      // Fall through to creation if fetch fails
      console.error('Failed to fetch recent projects:', recentError);
    }

    if (recent && recent.length > 0) {
      redirect(`/editor?project=${recent[0].id}`);
    }

    const { data: created, error: createError } = await supabase
      .from('projects')
      .insert({
        user_id: session.user.id,
        name: 'Untitled Project',
        data: {},
        is_public: false,
      })
      .select('id')
      .single();

    if (createError || !created) {
      console.error('Failed to create project:', createError);
      // As a safe fallback, continue to editor without project id
      return <EditorClientPage />;
    }

    redirect(`/editor?project=${created.id}`);
  }

  return <EditorClientPage />;
}