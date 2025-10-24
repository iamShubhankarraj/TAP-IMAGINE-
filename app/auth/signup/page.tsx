'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Legacy Signup redirect
 * Fresh auth structure centralizes all auth at /auth with mode switch.
 * This page forwards to /auth?mode=signup and preserves ?redirect=...
 */
export default function LegacySignupRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve any incoming redirect param from /auth/signup?redirect=/editor ...
    const redirect = searchParams.get('redirect');
    const dest =
      redirect && redirect.startsWith('/')
        ? `/auth?mode=signup&redirect=${encodeURIComponent(redirect)}`
        : '/auth?mode=signup';

    // Use replace to avoid adding an extra history entry
    router.replace(dest);
  }, [router, searchParams]);

  // Minimal fallback UI while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
      <div className="text-center">
        <p className="text-white/80 text-sm">Redirecting to Sign Up...</p>
      </div>
    </div>
  );
}
