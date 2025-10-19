'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function SessionTestPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      console.log('Session check result:', { data, error });
      
      setSessionInfo({
        hasSession: !!data.session,
        user: data.session?.user,
        expiresAt: data.session?.expires_at,
        error: error?.message
      });
      
      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex items-center justify-center">
        <p className="text-white">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
        <h1 className="text-2xl font-black text-white mb-6">Session Status</h1>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {sessionInfo.hasSession ? (
              <CheckCircle2 className="h-6 w-6 text-green-400" />
            ) : (
              <XCircle className="h-6 w-6 text-red-400" />
            )}
            <span className="text-white text-lg">
              {sessionInfo.hasSession ? 'Session Active' : 'No Session'}
            </span>
          </div>

          {sessionInfo.hasSession && (
            <div className="bg-black/30 rounded-lg p-4 space-y-2">
              <p className="text-white/70 text-sm">
                <strong>Email:</strong> {sessionInfo.user?.email}
              </p>
              <p className="text-white/70 text-sm">
                <strong>User ID:</strong> {sessionInfo.user?.id?.substring(0, 20)}...
              </p>
              <p className="text-white/70 text-sm">
                <strong>Expires:</strong> {new Date((sessionInfo.expiresAt || 0) * 1000).toLocaleString()}
              </p>
            </div>
          )}

          {sessionInfo.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-200 text-sm">{sessionInfo.error}</p>
            </div>
          )}

          <div className="pt-6 border-t border-white/10 space-y-3">
            {sessionInfo.hasSession ? (
              <>
                <a
                  href="/dashboard"
                  className="block w-full px-6 py-3 bg-banana text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors text-center"
                >
                  Go to Dashboard <ArrowRight className="inline h-5 w-5 ml-2" />
                </a>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}
                  className="w-full px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-200 font-medium rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <a
                href="/quick-signup"
                className="block w-full px-6 py-3 bg-banana text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors text-center"
              >
                Go to Login/Signup
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
