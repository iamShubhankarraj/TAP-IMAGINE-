export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import AuthPageClient from './AuthPageClient';

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/70">Loading...</div>}>
      <AuthPageClient />
    </Suspense>
  );
}