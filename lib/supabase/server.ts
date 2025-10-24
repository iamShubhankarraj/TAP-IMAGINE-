import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createSupabaseServerClient = () => {
  const cookieStore = cookies();

  return createServerComponentClient({
    cookies: () => cookieStore,
  });
};

// Export a singleton instance for consistency
export const supabaseServer = createSupabaseServerClient();