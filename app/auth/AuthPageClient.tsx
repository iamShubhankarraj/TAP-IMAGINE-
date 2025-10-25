'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Mail, Lock, Sparkles, AlertCircle, ArrowRight, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

type Mode = 'login' | 'signup';

export default function AuthPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  
  // Initialize Supabase client with auth helpers
  const supabase = createClientComponentClient();
  // Base site URL for OAuth redirects; supports Vercel previews/custom domains
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  const redirect = useMemo(() => searchParams.get('redirect') || '/dashboard', [searchParams]);
  const initialMode = (searchParams.get('mode') as Mode) || 'login';

  const [mode, setMode] = useState<Mode>(initialMode);

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Signup-only
  const [confirmPassword, setConfirmPassword] = useState('');
  // UI
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        // User is already logged in, redirect to destination
        router.replace(redirect);
      }
    }
  }, [user, authLoading, router, redirect]);

  // Surface error messages coming via URL (e.g., gated Google login requires signup first)
  useEffect(() => {
    const errParam = searchParams.get('error');
    if (errParam) {
      setError(errParam);
    }
  }, [searchParams]);

  // Mouse parallax effect
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const redirectUri = `${siteUrl}/auth/callback?next=${encodeURIComponent(redirect)}&intent=login`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          // Optional: request refresh token and force consent for stable sessions
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // In browsers, Supabase will typically auto-redirect.
      // Fallback: navigate to the returned URL if provided.
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (ex: any) {
      setError(ex?.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  // Google OAuth Signup
  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const redirectUri = `${siteUrl}/auth/callback?next=${encodeURIComponent(redirect)}&intent=signup`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (ex: any) {
      setError(ex?.message || 'Google sign-up failed');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Login successful, redirect to destination
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
          router.replace(redirect);
        }, 1000);
      } else {
        setError('Login failed. Please try again.');
        setLoading(false);
      }
    } catch (ex: any) {
      setError(ex?.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(redirect)}&intent=signup`
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Auto-logged in (if email confirmation disabled)
        setSuccessMessage('Account created successfully! Redirecting...');
        try {
          const userId =
            (data as any)?.user?.id ||
            (data as any)?.session?.user?.id ||
            null;
          if (userId) {
            // Mark the profile as registered so future Google "login" is allowed
            await supabase
              .from('profiles')
              .update({ is_registered: true })
              .eq('id', userId);
          }
        } catch (regErr) {
          console.error('Error marking profile as registered after signup:', regErr);
          // do not block redirect
        }
        setTimeout(() => {
          router.replace(redirect);
        }, 1000);
      } else {
        // Email confirmation required
        setSuccessMessage('Account created! Please check your email to confirm your account.');
        setLoading(false);
      }
    } catch (ex: any) {
      setError(ex?.message || 'Signup failed');
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    // Keep redirect param in URL for consistency
    const params = new URLSearchParams();
    params.set('mode', m);
    if (redirect) params.set('redirect', redirect);
    // Use push to update URL without full reload
    router.push(`/auth?${params.toString()}`);
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
            <div className="relative px-8 md:px-10 py-10 md:py-12 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl">
              {/* Logo Section */}
              <div className="text-center mb-8 space-y-6">
                {/* Animated Logo */}
                <div className="inline-flex relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-banana via-yellow-400 to-orange-400 rounded-2xl blur-md opacity-75 animate-pulse-slow" />
                  <div className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-banana to-yellow-400 rounded-2xl shadow-lg">
                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-gray-900 animate-pulse" />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/80 tracking-tight">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h1>
                  <p className="text-white/60 text-sm md:text-base font-medium">
                    {mode === 'login'
                      ? 'Continue your creative journey'
                      : 'Start creating with TAP[IMAGINE]'}
                  </p>
                </div>
              </div>

              {/* Mode Switch */}
              <div className="mb-8 grid grid-cols-2 gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
                <button
                  onClick={() => switchMode('login')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                    mode === 'login'
                      ? 'bg-white/10 border border-white/20 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="text-sm font-semibold">Sign In</span>
                </button>
                <button
                  onClick={() => switchMode('signup')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                    mode === 'signup'
                      ? 'bg-white/10 border border-white/20 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm font-semibold">Sign Up</span>
                </button>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-200 font-medium">{successMessage}</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Forms */}
              {mode === 'login' ? (
                <>
                  {/* Social Sign-in */}
                  <div className="space-y-5">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="group relative w-full"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 via-white/10 to-transparent rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-200" />
                      <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-900 rounded-xl font-bold text-base transform group-hover:scale-[1.02] transition-all duration-200 shadow-lg">
                        {/* Google 'G' logo SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 48 48">
                          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.9-6.4 8.5-11.8 8.5C16 36.5 9.5 30 9.5 22S16 7.5 24 7.5c3.3 0 6.3 1.2 8.6 3.2l5.6-5.6C34.7 1.8 29.6 0 24 0 10.8 0 0 10.8 0 24s10.8 24 24 24c13.2 0 24-10.8 24-24 0-1.5-.2-3-.4-4.5z"/>
                          <path fill="#FF3D00" d="M0 24c0 6.5 2.5 12.4 6.5 16.8l6.1-4.9C9.2 33.7 7.5 29.1 7.5 24S9.2 14.3 12.6 11.1L6.5 6.2C2.5 11.6 0 17.5 0 24z"/>
                          <path fill="#4CAF50" d="M24 48c6.5 0 12.4-2.5 16.8-6.5l-6.1-4.9C32.6 38.8 28.5 40.5 24 40.5c-5.4 0-10.1-3.6-12.1-8.6l-6.1 4.9C11.6 45.5 17.5 48 24 48z"/>
                          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3 5.4-5.6 7.1l6.1 4.9C39.5 37.3 43.5 31.4 43.6 24c0-1.5-.2-3-.4-4.5z"/>
                        </svg>
                        <span>Sign in with Google</span>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-white/10"></div>
                      <span className="text-white/50 text-xs">or</span>
                      <div className="h-px flex-1 bg-white/10"></div>
                    </div>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email */}
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
                            autoComplete="email"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Password */}
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
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 text-white/40 hover:text-white/60 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full mt-6"
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
                </>
              ) : (
                <>
                  {/* Social Sign-up */}
                  <div className="space-y-5">
                    <button
                      type="button"
                      onClick={handleGoogleSignup}
                      disabled={loading}
                      className="group relative w-full"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 via-white/10 to-transparent rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-200" />
                      <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-900 rounded-xl font-bold text-base transform group-hover:scale-[1.02] transition-all duration-200 shadow-lg">
                        {/* Google 'G' logo SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 48 48">
                          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.9-6.4 8.5-11.8 8.5C16 36.5 9.5 30 9.5 22S16 7.5 24 7.5c3.3 0 6.3 1.2 8.6 3.2l5.6-5.6C34.7 1.8 29.6 0 24 0 10.8 0 0 10.8 0 24s10.8 24 24 24c13.2 0 24-10.8 24-24 0-1.5-.2-3-.4-4.5z"/>
                          <path fill="#FF3D00" d="M0 24c0 6.5 2.5 12.4 6.5 16.8l6.1-4.9C9.2 33.7 7.5 29.1 7.5 24S9.2 14.3 12.6 11.1L6.5 6.2C2.5 11.6 0 17.5 0 24z"/>
                          <path fill="#4CAF50" d="M24 48c6.5 0 12.4-2.5 16.8-6.5l-6.1-4.9C32.6 38.8 28.5 40.5 24 40.5c-5.4 0-10.1-3.6-12.1-8.6l-6.1 4.9C11.6 45.5 17.5 48 24 48z"/>
                          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3 5.4-5.6 7.1l6.1 4.9C39.5 37.3 43.5 31.4 43.6 24c0-1.5-.2-3-.4-4.5z"/>
                        </svg>
                        <span>Sign up with Google</span>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-white/10"></div>
                      <span className="text-white/50 text-xs">or</span>
                      <div className="h-px flex-1 bg-white/10"></div>
                    </div>
                  </div>

                  <form onSubmit={handleSignup} className="space-y-5">
                    {/* Email */}
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
                            autoComplete="email"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Password */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-white/90 mb-2.5">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-center">
                          <Lock className="absolute left-4 w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Choose a strong password"
                            className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                            required
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 text-white/40 hover:text-white/60 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Confirm Password */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-white/90 mb-2.5">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-center">
                          <Lock className="absolute left-4 w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                            required
                            autoComplete="new-password"
                          />
                        </div>
                      </div>
                    </div>
  
                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full mt-6"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-200 animate-gradient-x" />
                      <div className="relative flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-banana to-yellow-400 rounded-xl font-black text-lg text-gray-900 transform group-hover:scale-[1.02] transition-all duration-200 shadow-lg">
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Creating account...</span>
                          </>
                        ) : (
                          <>
                            <span>Create Account</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </button>
                  </form>
                </>
              )}

              {/* Back/Home Links */}
              <div className="mt-8 text-center text-white/70 text-sm">
                {mode === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      onClick={() => switchMode('signup')}
                      className="text-banana hover:text-yellow-300 font-bold transition-colors"
                    >
                      Sign up for free
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      onClick={() => switchMode('login')}
                      className="text-banana hover:text-yellow-300 font-bold transition-colors"
                    >
                      Sign in
                    </button>
                  </p>
                )}
                <div className="mt-4">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 font-medium transition-colors group"
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
        </div>
      </div>
    </div>
  );
}