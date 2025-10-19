// app/auth/reset-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { X, Lock, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if we have a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });
      
      if (updateError) {
        setError(updateError.message || 'Failed to reset password. Please try again.');
      } else {
        setSuccess(true);
      }
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Success message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 z-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="p-10 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-white/15 to-white/5 shadow-2xl border border-white/20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-8">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-4">Password Reset!</h2>
            <p className="text-white/90 text-lg mb-8 leading-relaxed">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Link 
              href="/auth/login" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-banana to-yellow-400 text-gray-900 font-black text-lg rounded-xl hover:shadow-2xl hover:shadow-banana/50 transition-all duration-300 transform hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background with gradient and effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 z-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-60 h-60 bg-pink-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
      </div>
      
      {/* Main card */}
      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="p-10 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-white/15 to-white/5 shadow-2xl border border-white/20">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-banana to-yellow-400 mb-6">
              <Sparkles className="h-8 w-8 text-gray-900" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-3">
              Set New Password
            </h1>
            <p className="text-white/80 text-lg">
              Choose a strong password for your account
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
            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-white font-semibold text-sm mb-3">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-banana focus:border-transparent transition-all backdrop-blur-sm"
                  required
                  minLength={8}
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              </div>
              <p className="text-white/60 text-xs mt-2">Must be at least 8 characters</p>
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-white font-semibold text-sm mb-3">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-banana focus:border-transparent transition-all backdrop-blur-sm"
                  required
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              </div>
            </div>
            
            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-banana to-yellow-400 text-gray-900 font-black text-lg rounded-xl hover:shadow-2xl hover:shadow-banana/50 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </span>
              ) : 'Reset Password'}
            </button>
          </form>
          
          {/* Back to login link */}
          <p className="text-center text-white/80 text-sm mt-8">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-banana hover:text-yellow-300 font-bold transition-colors">
              Sign in
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
