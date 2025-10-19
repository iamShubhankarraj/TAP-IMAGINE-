'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function TestLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('🔐 Attempting login...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login failed:', error);
        setMessage(`Error: ${error.message}`);
        setIsSuccess(false);
      } else if (data.session) {
        console.log('✅ Login successful!');
        setMessage(`Success! Logged in as ${data.user.email}`);
        setIsSuccess(true);
        
        // Wait 2 seconds then redirect
        setTimeout(() => {
          console.log('🚀 Redirecting to dashboard...');
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        setMessage('Login returned no session');
        setIsSuccess(false);
      }
    } catch (err: any) {
      console.error('❌ Exception:', err);
      setMessage(`Exception: ${err.message}`);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      alert(`You are logged in as: ${data.session.user.email}`);
    } else {
      alert('No active session');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <h1 className="text-3xl font-black text-white mb-6">🧪 Direct Login Test</h1>
          
          <p className="text-white/70 text-sm mb-6">
            This page bypasses the Auth Context to test Supabase authentication directly.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-banana text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login Now'
              )}
            </button>
          </form>

          {message && (
            <div className={`p-4 rounded-lg border ${
              isSuccess 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            } flex items-start gap-3`}>
              {isSuccess ? (
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${isSuccess ? 'text-green-200' : 'text-red-200'}`}>
                {message}
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
            <button
              onClick={checkCurrentSession}
              className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Check Current Session
            </button>
            
            <a
              href="/auth/login"
              className="block w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-lg transition-colors text-center"
            >
              Go to Regular Login
            </a>
            
            <a
              href="/debug-auth"
              className="block w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-lg transition-colors text-center"
            >
              Go to Debug Page
            </a>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-white/40 text-xs">
            Press F12 to see console logs
          </p>
        </div>
      </div>
    </div>
  );
}
