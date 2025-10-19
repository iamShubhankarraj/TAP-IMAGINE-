'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle, UserPlus, LogIn } from 'lucide-react';

export default function QuickSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('📝 Attempting signup for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        console.error('❌ Signup failed:', error);
        setMessage(`Signup Error: ${error.message}`);
        setIsSuccess(false);
      } else {
        console.log('✅ Signup successful!', data);
        setMessage(`Success! Account created for ${email}. You can now login!`);
        setIsSuccess(true);
        
        // Auto-switch to login mode after 2 seconds
        setTimeout(() => {
          setMode('login');
          setMessage('');
        }, 2000);
      }
    } catch (err: any) {
      console.error('❌ Exception:', err);
      setMessage(`Exception: ${err.message}`);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('🔐 Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login failed:', error);
        setMessage(`Login Error: ${error.message}`);
        setIsSuccess(false);
      } else if (data.session) {
        console.log('✅ Login successful!', data.session);
        console.log('User:', data.user.email);
        console.log('Session expires:', new Date(data.session.expires_at! * 1000));
        console.log('Access token:', data.session.access_token.substring(0, 20) + '...');
        
        setMessage(`Success! Logged in as ${data.user.email}. Redirecting to dashboard...`);
        setIsSuccess(true);
        
        // Store session data explicitly in localStorage to ensure persistence
        const sessionData = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          user: data.user
        };
        
        localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData));
        
        // Wait longer for cookies to be properly set (2 seconds)
        // Redirect to simple-dashboard which doesn't use middleware
        setTimeout(() => {
          console.log('🚀 Redirecting to simple dashboard (no middleware)...');
          window.location.replace('/simple-dashboard');
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

  const testConnection = async () => {
    setMessage('Testing Supabase connection...');
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setMessage(`Connection Error: ${error.message}`);
        setIsSuccess(false);
      } else {
        setMessage(`✅ Supabase connected! Session: ${data.session ? 'Active' : 'None'}`);
        setIsSuccess(true);
      }
    } catch (err: any) {
      setMessage(`Connection failed: ${err.message}`);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <h1 className="text-3xl font-black text-white mb-2">
            {mode === 'signup' ? '📝 Quick Signup' : '🔐 Quick Login'}
          </h1>
          <p className="text-white/60 text-sm mb-6">
            {mode === 'signup' 
              ? 'Create your account instantly (no email confirmation needed)'
              : 'Login to access your dashboard'
            }
          </p>

          {/* Mode Switcher */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setMode('signup');
                setMessage('');
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-banana text-gray-900'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <UserPlus className="inline h-4 w-4 mr-2" />
              Signup
            </button>
            <button
              onClick={() => {
                setMode('login');
                setMessage('');
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-banana text-gray-900'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <LogIn className="inline h-4 w-4 mr-2" />
              Login
            </button>
          </div>

          <form onSubmit={mode === 'signup' ? handleSignup : handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-banana/50 focus:ring-2 focus:ring-banana/20"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Password {mode === 'signup' && <span className="text-white/40">(min 6 characters)</span>}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-banana/50 focus:ring-2 focus:ring-banana/20"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-banana text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {mode === 'signup' ? 'Creating Account...' : 'Logging In...'}
                </>
              ) : (
                <>
                  {mode === 'signup' ? (
                    <>
                      <UserPlus className="h-5 w-5" />
                      Create Account
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      Login Now
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {message && (
            <div className={`p-4 rounded-lg border mb-6 ${
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

          <div className="space-y-2 pt-6 border-t border-white/10">
            <button
              onClick={testConnection}
              disabled={loading}
              className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              🔌 Test Supabase Connection
            </button>
            
            <a
              href="/debug-auth"
              className="block w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-lg transition-colors text-center"
            >
              🔍 Go to Debug Page
            </a>
            
            <a
              href="/dashboard"
              className="block w-full px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 border border-purple-500/30 text-white text-sm font-medium rounded-lg transition-colors text-center"
            >
              📊 Try Dashboard
            </a>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-white/40 text-xs">
            💡 Tip: Create an account first, then login with the same credentials
          </p>
        </div>
      </div>
    </div>
  );
}
