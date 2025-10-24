export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

type Profile = {
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  tier?: 'free' | 'pro' | 'premium' | null;
} | null;

export default async function DashboardPage() {
  // Server-side auth gate: never show dashboard to unauthenticated users
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Unauthenticated: send to signup with redirect back to dashboard after auth
    redirect('/auth?mode=signup&redirect=/dashboard');
  }

  // Fetch profile server-side (best-effort; allow null)
  let profile: Profile = null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, avatar_url, phone, tier')
      .eq('id', session.user.id)
      .single();

    if (!error) {
      profile = data as Profile;
    }
  } catch {
    // ignore and keep profile null
  }

  // Render the client dashboard with server-fetched user+profile props
  return (
    <DashboardClient
      user={{ id: session.user.id, email: session.user.email || '' }}
      profile={profile}
    />
  );
}