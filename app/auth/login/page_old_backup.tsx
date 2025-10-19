'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Mail, Lock, Sparkles, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  // Check if user is already logged in and redirect
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('✅ User already logged in, redirecting to:', redirect);
        window.location.replace(redirect);
      }
    };
    
    checkExistingSession();
  }, [redirect]);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login...');
      
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (err) {
        console.error('❌ Login error:', err);
        setError(err.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        console.log('✅ Login successful!');
        console.log('User:', data.user.email);
        console.log('Session created:', data.session.access_token ? 'Yes' : 'No');
        console.log('Redirecting to:', redirect);
        
        // Wait for session to be fully stored in browser storage
        // Then use window.location.replace for a clean redirect that forces middleware re-evaluation
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Use replace instead of href to avoid back button issues
        window.location.replace(redirect);
      } else {
        setError('No session created');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('❌ Exception during login:', err);
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f]">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs with Parallax */}
        <div 
          className="absolute top-0 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/30 via-fuchsia-500/20 to-transparent rounded-full blur-[120px] animate-float"
          style={{
            transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`,
            transition: 'transform 0.2s ease-out'
          }}
        />
        <div 
          className="absolute -bottom-1/4 -right-1/4 w-[900px] h-[900px] bg-gradient-to-tr from-blue-500/30 via-cyan-500/20 to-transparent rounded-full blur-[120px] animate-float-delayed"
          style={{
            transform: `translate(${mousePos.x * -0.03}px, ${mousePos.y * -0.02}px)`,
            transition: 'transform 0.2s ease-out'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/20 to-yellow-500/20 rounded-full blur-[100px] animate-pulse-slow"
          style={{
            transform: `translate(calc(-50% + ${mousePos.x * 0.01}px), calc(-50% + ${mousePos.y * 0.01}px))`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Glassmorphic Card */}
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-gradient-x" />
            
            {/* Main Card */}
            <div className="relative px-10 py-12 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl">
              {/* Logo Section */}
              <div className="text-center mb-8 space-y-6">
                {/* Animated Logo */}
                <div className="inline-flex relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-banana via-yellow-400 to-orange-400 rounded-2xl blur-md opacity-75 animate-pulse-slow" />
                  <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-banana to-yellow-400 rounded-2xl shadow-lg transform hover:scale-110 hover:rotate-3 transition-all duration-300">
                    <Sparkles className="w-10 h-10 text-gray-900 animate-pulse" />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/80 tracking-tight">
                    Welcome Back
                  </h1>
                  <p className="text-white/60 text-base font-medium">
                    Continue your creative journey
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm animate-shake">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-white/90 mb-2.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center">
                      <Mail className="absolute left-4 w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                        required
                        suppressHydrationWarning
                        autoComplete="email"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-sm font-semibold text-white/90">
                      Password
                    </label>
                    <Link 
                      href="/auth/forgot-password"
                      className="text-sm font-medium text-banana hover:text-yellow-300 transition-colors"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                        required
                        suppressHydrationWarning
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-white/40 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full mt-8"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-200 animate-gradient-x" />
                  <div className="relative flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-banana to-yellow-400 rounded-xl font-black text-lg text-gray-900 transform group-hover:scale-[1.02] transition-all duration-200 shadow-lg">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-white/60 text-sm">
                  Don't have an account?{' '}
                  <Link 
                    href="/auth/signup"
                    className="text-banana hover:text-yellow-300 font-bold transition-colors relative group inline-block"
                  >
                    <span className="relative z-10">Sign up for free</span>
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-banana to-yellow-300 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm font-medium transition-colors group"
            >
              <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
                <ArrowRight className="w-3 h-3 rotate-180" />
              </div>
              <span>Back to home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
