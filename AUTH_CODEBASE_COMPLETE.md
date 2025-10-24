# Complete Authentication Codebase for TAP[IMAGINE]

This document contains all authentication-related code in the project for easy reference and debugging.

## Table of Contents
1. [Auth Pages](#auth-pages)
2. [Auth Context](#auth-context)
3. [Middleware](#middleware)
4. [Supabase Configuration](#supabase-configuration)
5. [Database Schema](#database-schema)
6. [Testing Components](#testing-components)

---

## Auth Pages

### Main Auth Page
**File**: [`app/auth/page.tsx`](app/auth/page.tsx)

```tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Mail, Lock, Sparkles, AlertCircle, ArrowRight, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

type Mode = 'login' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  
  // Initialize Supabase client with auth helpers
  const supabase = createClientComponentClient();

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
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`
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
              ) : (
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
```

### Legacy Login Redirect
**File**: [`app/auth/login/page.tsx`](app/auth/login/page.tsx)

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Legacy Login redirect
 * Fresh auth structure centralizes all auth at /auth with mode switch.
 * This page simply forwards to /auth?mode=login and preserves ?redirect=...
 */
export default function LegacyLoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve any incoming redirect param from /auth/login?redirect=/editor ...
    const redirect = searchParams.get('redirect');
    const dest =
      redirect && redirect.startsWith('/')
        ? `/auth?mode=login&redirect=${encodeURIComponent(redirect)}`
        : '/auth?mode=login';

    // Use replace to avoid adding an extra history entry
    router.replace(dest);
  }, [router, searchParams]);

  // Minimal fallback UI while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
      <div className="text-center">
        <p className="text-white/80 text-sm">Redirecting to Sign In...</p>
      </div>
    </div>
  );
}
```

### Legacy Signup Redirect
**File**: [`app/auth/signup/page.tsx`](app/auth/signup/page.tsx)

```tsx
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
```

### Auth Callback Route
**File**: [`app/auth/callback/route.ts`](app/auth/callback/route.ts)

```ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';
  const error = requestUrl.searchParams.get('error');

  if (error) {
    console.error('Auth error from callback:', error);
    return NextResponse.redirect(`${requestUrl.origin}/auth?mode=login&error=${encodeURIComponent(error)}`);
  }

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${requestUrl.origin}/auth?mode=login&error=${encodeURIComponent(error.message)}`);
      }

      // Successfully authenticated, check if user needs profile creation
      if (data.user) {
        try {
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email,
                first_name: data.user.user_metadata?.first_name || null,
                last_name: data.user.user_metadata?.last_name || null,
                avatar_url: data.user.user_metadata?.avatar_url || null,
                tier: 'free'
              });

            if (insertError) {
              console.error('Error creating profile:', insertError);
              // Don't fail the auth, just log the error
            }
          }
        } catch (profileErr) {
          console.error('Profile check error:', profileErr);
          // Don't fail the auth, just log the error
        }
      }
    } catch (error) {
      console.error('Unexpected error exchanging code for session:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth?mode=login&error=${encodeURIComponent('Authentication failed')}`);
    }
  }

  // Redirect to the specified next URL or dashboard
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
```

---

## Auth Context

### Authentication Context Provider
**File**: [`context/auth-context.tsx`](context/auth-context.tsx)

```tsx
// context/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Types for profile data
type ProfileData = {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
};

// Types for authentication context
type AuthContextType = {
  user: User | null;
  profile: ProfileData | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string; phone?: string }) => Promise<{ error: AuthError | Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: AuthError | Error | null }>;
  signInWithApple: () => Promise<{ error: AuthError | Error | null }>;
  updateProfile: (updates: Partial<ProfileData>) => Promise<{ error: any | null }>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | Error | null }>;
};

// Create the context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps app and makes auth context available
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize Supabase client with auth helpers
  const supabase = createClientComponentClient();

  // Fetch user profile from Supabase (non-blocking - app works without profiles table)
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url, phone')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Profiles table doesn't exist or no row for user - this is OK
        // The app will work fine without profile data
        return null;
      }
      
      return data as ProfileData;
    } catch (error) {
      // Silently fail - profile is optional
      return null;
    }
  };

  // Refresh user profile data
  const refreshProfile = async () => {
    if (!user) return;
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  };

  // Initialize auth state on component mount
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Get session and user
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          setUser(currentSession.user);
          const profileData = await fetchProfile(currentSession.user.id);
          if (mounted) setProfile(profileData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          const profileData = await fetchProfile(newSession.user.id);
          if (mounted) setProfile(profileData);
        } else {
          if (mounted) setProfile(null);
        }
        
        if (mounted) setIsLoading(false);
      }
    );

    // Clean up subscription on unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (
    email: string, 
    password: string,
    metadata?: { first_name?: string; last_name?: string; phone?: string }
  ) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      // If signup successful and user is created (no email confirmation required)
      if (data.user && !error) {
        // Create profile immediately
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              first_name: metadata?.first_name || null,
              last_name: metadata?.last_name || null,
              phone: metadata?.phone || null,
              tier: 'free'
            });
          
          if (profileError) {
            console.error('Error creating profile during signup:', profileError);
            // Don't fail the signup, just log the error
          }
        } catch (profileErr) {
          console.error('Profile creation error during signup:', profileErr);
          // Don't fail the signup, just log the error
        }
      }
      
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // If sign in successful, ensure profile exists
      if (data.user && !error) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email,
                first_name: data.user.user_metadata?.first_name || null,
                last_name: data.user.user_metadata?.last_name || null,
                avatar_url: data.user.user_metadata?.avatar_url || null,
                tier: 'free'
              });

            if (insertError) {
              console.error('Error creating profile during signin:', insertError);
            }
          }
        } catch (profileErr) {
          console.error('Profile check error during signin:', profileErr);
        }
      }
      
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      return { error };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with Apple
  const signInWithApple = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      return { error };
    } catch (error) {
      console.error('Apple sign in error:', error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user) return { error: new Error('User not authenticated') };
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (!error) {
        // Refresh profile data after update
        await refreshProfile();
      }
      
      return { error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Create context value object
  const value = {
    user,
    profile,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    signInWithApple,
    updateProfile,
    refreshProfile,
    resetPassword
  };

  // Provide context to children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
```

---

## Middleware

### Route Protection Middleware
**File**: [`middleware.ts`](middleware.ts)

```ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  const search = url.search;
  const redirectDest = `${pathname}${search}`;

  const { data: { session } } = await supabase.auth.getSession();

  const isPublicHome = pathname === '/';
  const isAuthRoute = pathname.startsWith('/auth');
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/editor');

  // Handle auth callback and reset password routes
  if (pathname.includes('/callback') || pathname.includes('/reset-password')) {
    // Let these routes pass through - they handle their own auth logic
    return res;
  }

  // If user is authenticated and trying to access main auth page, redirect to dashboard
  if (session && isAuthRoute && pathname === '/auth') {
    // Check if there's a redirect parameter in URL
    const urlParams = new URLSearchParams(search);
    const hasRedirect = urlParams.has('redirect');
    
    // If no specific redirect, go to dashboard
    if (!hasRedirect) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Gate protected routes when unauthenticated
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/auth', req.url);
    redirectUrl.searchParams.set('mode', 'login');
    redirectUrl.searchParams.set('redirect', redirectDest);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle legacy auth routes (/auth/login, /auth/signup)
  if (pathname === '/auth/login' || pathname === '/auth/signup') {
    const mode = pathname === '/auth/login' ? 'login' : 'signup';
    const redirectUrl = new URL('/auth', req.url);
    redirectUrl.searchParams.set('mode', mode);
    
    // Preserve any existing redirect parameter
    const urlParams = new URLSearchParams(search);
    const existingRedirect = urlParams.get('redirect');
    if (existingRedirect) {
      redirectUrl.searchParams.set('redirect', existingRedirect);
    }
    
    return NextResponse.redirect(redirectUrl);
  }

  // For authenticated users accessing the home page, let them stay there
  // (not auto-redirecting to dashboard as per requirement)
  
  return res;
}

export const config = {
  // Exclude Next assets, favicon from middleware
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Supabase Configuration

### Client Configuration
**File**: [`lib/supabase/client.ts`](lib/supabase/client.ts)

```ts
// lib/supabase/client.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please check your .env.local file.',
    { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey }
  );
}

// Initialize the Supabase client with auth helpers for consistency
export const supabase = createClientComponentClient();

// Export type for use in other files
export type SupabaseClient = typeof supabase;

/**
 * Helper function to get user profile from Supabase
 * @param userId The user ID to fetch profile for
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }
}

/**
 * Helper function to update user profile
 * @param userId The user ID to update profile for
 * @param updates The profile updates to apply
 */
export async function updateUserProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }
}

/**
 * Helper function to upload an image to Supabase storage
 * @param bucket The storage bucket name
 * @param path The path within the bucket
 * @param file The file to upload
 */
export async function uploadImage(bucket: string, path: string, file: File) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600',
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: publicURL } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return { data: publicURL, error: null };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { data: null, error };
  }
}
```

### Server Configuration
**File**: [`lib/supabase/server.ts`](lib/supabase/server.ts)

```ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createSupabaseServerClient = () => {
  const cookieStore = cookies();

  return createServerComponentClient({
    cookies: () => cookieStore,
  });
};

// Export a singleton instance for consistency
export const supabaseServer = createSupabaseServerClient();
```

---

## Database Schema

### Migration Script
**File**: [`supabase/migrations/001_create_profiles.sql`](supabase/migrations/001_create_profiles.sql)

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  primary_image_url TEXT,
  generated_image_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create profile automatically when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url, tier)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Projects RLS policies
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public projects are viewable by everyone"
  ON projects FOR SELECT
  USING (is_public = true);

-- Templates RLS policies
CREATE POLICY "Templates are viewable by everyone"
  ON templates FOR SELECT
  USING (is_public = true);

CREATE POLICY "Authenticated users can create templates"
  ON templates FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Template creators can update their templates"
  ON templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Template creators can delete their templates"
  ON templates FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Testing Components

### Complete Auth Test Page
**File**: [`app/test-auth-complete/page.tsx`](app/test-auth-complete/page.tsx)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2, User, Mail, LogOut } from 'lucide-react';

export default function TestAuthComplete() {
  const router = useRouter();
  const { user, profile, isLoading, signOut } = useAuth();
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});
  const [runningTests, setRunningTests] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    runAuthTests();
  }, [user, profile]);

  const runAuthTests = async () => {
    setRunningTests(true);
    const results: {[key: string]: boolean} = {};

    // Test 1: Check if user session exists
    results.session = !!user;

    // Test 2: Check if profile exists
    results.profile = !!profile;

    // Test 3: Test database connection
    try {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        results.database = !error && !!data;
      } else {
        results.database = false;
      }
    } catch (error) {
      results.database = false;
    }

    // Test 4: Test auth context
    results.authContext = !isLoading;

    // Test 5: Test user metadata
    results.userMetadata = !!user?.user_metadata;

    setTestResults(results);
    setRunningTests(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleGoToAuth = () => {
    router.push('/auth');
  };

  if (isLoading || runningTests) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-banana mx-auto mb-4" />
          <p className="text-white text-lg">Running authentication tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Authentication System Test
        </h1>

        {/* User Info Card */}
        <Card className="mb-8 bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-white">
                Status: {user ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </div>
            {user && (
              <>
                <div className="flex items-center gap-2 text-white/80">
                  <Mail className="h-4 w-4" />
                  <span>Email: {user.email}</span>
                </div>
                <div className="text-white/80">
                  <span>User ID: {user.id}</span>
                </div>
                {profile && (
                  <div className="text-white/80">
                    <span>Profile: {profile.first_name || 'No first name'} {profile.last_name || ''}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card className="mb-8 bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(testResults).map(([test, passed]) => (
              <div key={test} className="flex items-center justify-between">
                <span className="text-white/80 capitalize">
                  {test.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                {passed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          {user ? (
            <>
              <Button
                onClick={handleGoToDashboard}
                className="bg-banana text-gray-900 hover:bg-yellow-400"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              onClick={handleGoToAuth}
              className="bg-banana text-gray-900 hover:bg-yellow-400"
            >
              Go to Sign In
            </Button>
          )}
          <Button
            onClick={runAuthTests}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Run Tests Again
          </Button>
        </div>

        {/* Instructions */}
        <Card className="mt-8 bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white">How to Use This Test</CardTitle>
          </CardHeader>
          <CardContent className="text-white/70 space-y-2">
            <p>1. If not authenticated, click "Go to Sign In" to test login flow</p>
            <p>2. After signing in, you should be redirected back here automatically</p>
            <p>3. All tests should show green checkmarks if auth is working correctly</p>
            <p>4. Click "Go to Dashboard" to test protected route access</p>
            <p>5. Test sign out and sign in flow to ensure everything works</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## Environment Configuration

### Environment Variables Example
**File**: [`.env.example`](.env.example)

```env
# Google Gemini API Key (for standalone React app)
# Get your API key from https://makersuite.google.com/app/apikey
API_KEY=your_gemini_api_key_here

# Google Nano Banana API Key (for Next.js editor)
# This is optional - the app will use simulation mode if not provided
GOOGLE_NANO_BANANA_API_KEY=your_nano_banana_api_key_here

# Supabase Configuration (required for authentication)
# Get these from your Supabase project settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Set to 'production' to use real API calls (requires API keys)
# Leave as 'development' to use simulated responses
NODE_ENV=development
```

---

## Package Dependencies

### Relevant Dependencies from package.json
```json
{
  "dependencies": {
    "@supabase/auth-helpers-nextjs": "latest",
    "@supabase/supabase-js": "latest",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest"
  }
}
```

---

## Root Layout Integration

### App Layout with Auth Provider
**File**: [`app/layout.tsx`](app/layout.tsx)

```tsx
// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/auth-context';
import { ImageStoreProvider } from '@/context/image-store';
import { ExportQueueProvider } from '@/context/export-queue-context';
import { EditorProvider } from '@/context/EditorContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TAP[IMAGINE] - AI Image Editor',
  description: 'Advanced AI-powered image editor using Google Nano Banana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800`}>
        <AuthProvider>
          <ImageStoreProvider>
            <ExportQueueProvider>
              <EditorProvider>
                <main className="min-h-screen">
                  {children}
                </main>
              </EditorProvider>
            </ExportQueueProvider>
          </ImageStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## Summary

This complete authentication codebase includes:

1. **Full Auth Flow**: Signup, signin, email confirmation, password reset
2. **Profile Management**: Automatic profile creation and updates
3. **Route Protection**: Middleware-based protection for authenticated routes
4. **Database Integration**: Complete Supabase setup with RLS policies
5. **Testing Infrastructure**: Comprehensive testing page for verification
6. **Error Handling**: Graceful error handling throughout the system
7. **UI Components**: Beautiful glassmorphic auth interface
8. **Security**: Row-level security and proper session management

All components work together to provide a seamless authentication experience for TAP[IMAGINE] users.