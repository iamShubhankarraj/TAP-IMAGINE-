'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';

export default function DebugAuthPage() {
  const [directSession, setDirectSession] = useState<any>(null);
  const [checkingDirect, setCheckingDirect] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkDirectSession = async () => {
      try {
        console.log('🔍 Checking Supabase session...');
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          setError(sessionError.message);
        } else {
          console.log('✅ Session check complete:', data.session ? 'Logged in' : 'Not logged in');
          setDirectSession(data.session);
        }
      } catch (err: any) {
        console.error('❌ Exception during session check:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setCheckingDirect(false);
      }
    };
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (checkingDirect) {
        console.error('⏱️ Session check timeout');
        setError('Session check timed out - possible configuration issue');
        setCheckingDirect(false);
      }
    }, 5000); // 5 second timeout
    
    checkDirectSession();
    
    return () => clearTimeout(timeout);
  }, []);

  if (!mounted || checkingDirect) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-banana" />
        <p className="text-white/60 text-sm">Checking authentication...</p>
        {!mounted && <p className="text-white/40 text-xs">Initializing...</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8">
          <h1 className="text-3xl font-black text-white mb-8">🔍 Authentication Debug</h1>
          
          {/* Error Display */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-semibold">Error Detected</p>
                  <p className="text-red-200 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Direct Supabase Check */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Direct Supabase Check</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {directSession ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                <span className="text-white">
                  Direct Session: {directSession ? `✓ ${directSession.user?.email}` : '✗ No session'}
                </span>
              </div>
            </div>
          </div>

          {/* User Details */}
          {directSession?.user && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">User Details</h2>
              <div className="bg-black/30 rounded-lg p-4 overflow-auto">
                <pre className="text-sm text-white/80">
                  {JSON.stringify(
                    {
                      id: directSession.user.id,
                      email: directSession.user.email,
                      email_confirmed: directSession.user.email_confirmed_at ? 'Yes' : 'No',
                      created_at: directSession.user.created_at,
                      last_sign_in: directSession.user.last_sign_in_at,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          )}

          {/* Session Details */}
          {directSession && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Session Details</h2>
              <div className="bg-black/30 rounded-lg p-4 overflow-auto">
                <pre className="text-sm text-white/80">
                  {JSON.stringify(
                    {
                      access_token: directSession.access_token ? 'Present ✓' : 'Missing ✗',
                      refresh_token: directSession.refresh_token ? 'Present ✓' : 'Missing ✗',
                      expires_at: new Date((directSession.expires_at || 0) * 1000).toLocaleString(),
                      token_type: directSession.token_type,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          )}



          {/* Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Quick Actions</h2>
            
            {!directSession ? (
              <div className="space-y-3">
                <p className="text-white/70">You are not logged in. Please login first:</p>
                <a
                  href="/auth/login?redirect=/debug-auth"
                  className="inline-block px-6 py-3 bg-banana text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors"
                >
                  Go to Login
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-white/70">You are logged in! Try accessing protected routes:</p>
                <div className="flex gap-3">
                  <a 
                    href="/dashboard"
                    className="inline-block px-6 py-3 bg-banana text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors"
                  >
                    Go to Dashboard
                  </a>
                  <a 
                    href="/editor"
                    className="inline-block px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Go to Editor
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Browser Info */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Browser Info</h2>
            <div className="space-y-2 text-white/70 text-sm">
              <p>User Agent: {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
              <p>Cookies Enabled: {typeof navigator !== 'undefined' ? (navigator.cookieEnabled ? 'Yes ✓' : 'No ✗') : 'N/A'}</p>
              <p>Local Storage: {typeof window !== 'undefined' && window.localStorage ? 'Available ✓' : 'Not available ✗'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
