'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestSessionPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        setSessionInfo({
          hasSession: !!session,
          user: session?.user,
          error: error?.message || null,
          accessToken: session?.access_token ? 'Present' : 'Missing',
          expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A',
        });
      } catch (err: any) {
        setSessionInfo({
          error: err.message,
          hasSession: false,
        });
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white text-xl">Loading session info...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Session Test Page</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Information:</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Local Storage:</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
            {typeof window !== 'undefined' ? JSON.stringify(
              Object.keys(localStorage)
                .filter(key => key.includes('supabase'))
                .reduce((obj: any, key) => {
                  try {
                    obj[key] = localStorage.getItem(key);
                  } catch (e) {
                    obj[key] = 'Error reading';
                  }
                  return obj;
                }, {}),
              null,
              2
            ) : 'Window not available'}
          </pre>
        </div>
      </div>
    </div>
  );
}
