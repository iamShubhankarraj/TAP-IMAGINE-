// app/auth/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { X, Mail, Lock, User, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { signUp, signIn } = useAuth();
  const router = useRouter();

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
      const { error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        // Check if email confirmation is disabled
        if (signUpError.message?.includes('email') && signUpError.message?.includes('confirmed')) {
          // Auto-login if confirmation is disabled
          const { error: signInError } = await signIn(email, password);
          if (!signInError) {
            // Wait for session to settle before redirecting
            setTimeout(() => {
              router.push('/dashboard');
              router.refresh();
            }, 100);
            return;
          }
        }
        setError(signUpError.message || 'Failed to create account. Please try again.');
        setIsLoading(false);
      } else {
        // Check if we're auto-confirmed (no email verification required)
        // If so, sign in immediately
        const { error: signInError } = await signIn(email, password);
        if (!signInError) {
          // Wait for session to settle before redirecting
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 100);
        } else {
          setSuccess(true);
        }
        setIsLoading(false);
      }
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error(error);
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
            <h2 className="text-3xl font-extrabold text-white mb-4">Check Your Email</h2>
            <p className="text-white/90 text-lg mb-8 leading-relaxed">
              We've sent a confirmation link to <strong>{email}</strong>. Click the link in the email to verify your account.
            </p>
            <Link 
              href="/auth/login" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-banana to-yellow-400 text-gray-900 font-black text-lg rounded-xl hover:shadow-2xl hover:shadow-banana/50 transition-all duration-300 transform hover:scale-105"
            >
              Continue to Sign In
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
      
      {/* Main signup card */}
      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="p-10 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-white/15 to-white/5 shadow-2xl border border-white/20">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-banana to-yellow-400 mb-6">
              <Sparkles className="h-8 w-8 text-gray-900" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-3">
              Create Your Account
            </h1>
            <p className="text-white/80 text-lg">
              Start transforming images with AI
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
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              </div>
            </div>
            
            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-white font-semibold text-sm mb-3">
                Password
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
                Confirm Password
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
            
            {/* Sign up button */}
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
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>

            {/* Terms */}
            <p className="text-white/60 text-xs text-center mt-4">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-banana hover:text-yellow-300 transition-colors">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-banana hover:text-yellow-300 transition-colors">
                Privacy Policy
              </Link>
            </p>
          </form>
          
          {/* Sign in link */}
          <p className="text-center text-white/80 text-sm mt-8">
            Already have an account?{' '}
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
