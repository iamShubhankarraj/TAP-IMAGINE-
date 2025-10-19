// app/auth/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { X, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user) {
      console.log('✅ User already logged in, redirecting to:', redirect);
      window.location.href = redirect;
    }
  }, [user, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    console.log('🔐 Starting login process...');
    console.log('Email:', email);
    console.log('Redirect target:', redirect);
    
    try {
      // Attempt login - use direct Supabase call
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Login response:', { 
        hasSession: !!data.session, 
        hasUser: !!data.user,
        error: signInError?.message 
      });
      
      if (signInError) {
        console.error('❌ Login error:', signInError);
        
        // Check for specific error types
        if (signInError.message.includes('Email not confirmed')) {
          setError('⚠️ Please verify your email first. Check your inbox for the confirmation link.');
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setError(signInError.message);
        }
        setIsLoading(false);
        return;
      }
      
      // Check if we have a session
      if (!data.session) {
        console.error('❌ No session created');
        setError('Login failed to create a session.');
        setIsLoading(false);
        return;
      }
      
      console.log('✅ Session created successfully!');
      console.log('User:', data.user?.email);
      console.log('Confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
      console.log('🚀 Forcing redirect to:', redirect);
      
      // Force hard redirect - this WILL work
      setTimeout(() => {
        window.location.replace(redirect);
      }, 100);
      
    } catch (error: any) {
      console.error('❌ Unexpected error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background with gradient and effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 z-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-60 h-60 bg-pink-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
      </div>
      
      {/* Main login card */}
      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="p-10 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-white/15 to-white/5 shadow-2xl border border-white/20">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-banana to-yellow-400 mb-6">
              <Sparkles className="h-8 w-8 text-gray-900" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-3">
              Welcome back
            </h1>
            <p className="text-white/80 text-lg">
              Sign in to continue creating
            </p>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-white flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-white font-semibold text-sm mb-3">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-banana focus:border-transparent transition-all backdrop-blur-sm"
                  required
                  suppressHydrationWarning
                  autoComplete="email"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              </div>
            </div>
            
            {/* Password field */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label htmlFor="password" className="block text-white font-semibold text-sm">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-banana hover:text-yellow-300 text-sm font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-banana focus:border-transparent transition-all backdrop-blur-sm"
                  required
                  suppressHydrationWarning
                  autoComplete="current-password"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              </div>
            </div>
            
            {/* Sign in button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-banana to-yellow-400 text-gray-900 font-black text-lg rounded-xl hover:shadow-2xl hover:shadow-banana/50 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
          
          {/* Sign up link */}
          <p className="text-center text-white/80 text-sm mt-8">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-banana hover:text-yellow-300 font-bold transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
        
        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-white/70 hover:text-white text-sm font-medium transition-colors inline-flex items-center gap-2">
            <X className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}