import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createSupabaseServerClient = () => {
  const cookieStore = cookies();

  return createServerComponentClient({
    cookies: () => cookieStore,
  });
};

// Avoid creating a module-level singleton here; calling cookies() at module scope breaks Next.js build time.