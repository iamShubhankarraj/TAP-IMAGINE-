// app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { X, Mail, Lock, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (error: any) {
      setError('Invalid email or password. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background with gradient and effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 z-0">
        {/* Animated gradient orbs/flares */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-50 animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-50 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-60 h-60 bg-pink-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
      </div>
      
      {/* Main login card with glassmorphism */}
      <div className="w-full max-w-md p-8 rounded-2xl backdrop-blur-lg bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/20 z-10">
        {/* Close button */}
        <button 
          onClick={() => router.push('/')}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        {/* Tabs */}
        <div className="flex mb-8 border-b border-white/20">
          <button 
            onClick={() => router.push('/auth/signup')}
            className="pb-4 text-white/50 font-medium text-sm hover:text-white/80 transition-colors"
          >
            Sign up
          </button>
          <button className="pb-4 ml-8 text-white font-medium text-sm relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-banana">
            Sign in
          </button>
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-6">Welcome back</h1>
        
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-white text-sm">
            {error}
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-white/70 text-sm mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-banana/50 focus:border-transparent transition-all"
                required
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
            </div>
          </div>
          
          {/* Password field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-white/70 text-sm">
                Password
              </label>
              <Link href="/auth/forgot-password" className="text-banana hover:text-banana-light text-xs transition-colors">
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
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-banana/50 focus:border-transparent transition-all"
                required
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
            </div>
          </div>
          
          {/* Remember me checkbox */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center focus:outline-none group"
            >
              <div className={`w-5 h-5 rounded border ${rememberMe ? 'bg-banana border-banana' : 'border-white/30'} flex items-center justify-center mr-3 transition-colors`}>
                {rememberMe && <CheckCircle className="h-4 w-4 text-gray-900" />}
              </div>
              <span className="text-white/70 text-sm group-hover:text-white transition-colors">Remember me</span>
            </button>
          </div>
          
          {/* Sign in button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white text-gray-900 font-medium rounded-full hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
          
          {/* Divider */}
          <div className="flex items-center mt-6">
            <div className="flex-1 h-px bg-white/20"></div>
            <div className="px-4 text-xs text-white/50 font-medium">OR SIGN IN WITH</div>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>
          
          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center py-3 px-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-white text-sm">Google</span>
            </button>
            
            <button
              type="button"
              className="flex items-center justify-center py-3 px-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all"
            >
              <svg className="h-5 w-5 mr-2 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
              </svg>
              <span className="text-white text-sm">Apple</span>
            </button>
          </div>
          
          {/* Sign up link */}
          <p className="text-center text-white/70 text-sm mt-6">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-banana hover:text-banana-light transition-colors">
              Sign up
            </Link>
          </p>
        </form>
      </div>
      
      {/* Decorative floating elements */}
      <div className="absolute top-1/4 left-1/4 w-12 h-12 border border-white/20 rounded-lg backdrop-blur-sm bg-white/5 rotate-12 z-10 hidden md:block"></div>
      <div className="absolute bottom-1/4 right-1/4 w-8 h-8 border border-white/20 rounded-full backdrop-blur-sm bg-white/5 z-10 hidden md:block"></div>
    </div>
  );
}