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

    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/projects/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ name: 'Untitled Project' }),
      });

      const json = await resp.json();

      if (resp.ok && json?.id) {
        redirect(`/editor?project=${json.id}`);
      } else {
        console.error('Failed to create project via API:', json?.details || json?.error || 'unknown_error');
        // Safe fallback: continue to editor without project id
        return <EditorClientPage />;
      }
    } catch (err) {
      console.error('Failed to create project via API:', err);
      // Safe fallback
      return <EditorClientPage />;
    }
  }

  return <EditorClientPage />;
}