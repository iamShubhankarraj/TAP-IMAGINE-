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

  // Ensure profile row exists and fetch it (map plan_type -> tier)
  let profile: Profile = null;
  try {
    // Upsert minimal row to guarantee existence
    await supabase
      .from('profiles')
      .upsert({ id: session.user.id }, { onConflict: 'id' });

    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, avatar_url, phone, plan_type')
      .eq('id', session.user.id)
      .single();

    if (!error && data) {
      profile = {
        first_name: (data as any).first_name ?? null,
        last_name: (data as any).last_name ?? null,
        avatar_url: (data as any).avatar_url ?? null,
        phone: (data as any).phone ?? null,
        tier: ((data as any).plan_type as 'free' | 'pro' | 'premium' | null) ?? null,
      };
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