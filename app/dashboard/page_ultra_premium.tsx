'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { Sparkles, Wand2, Image as ImageIcon, Zap, LogOut, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const router = useRouter();

  useEffect(() => {
    checkUser();
    
    // Mouse parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/auth?mode=login');
      return;
    }

    setUser(session.user);
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/auth?mode=login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
        {/* Animated loading background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full blur-xl opacity-75 animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white animate-spin" />
              </div>
            </div>
            <p className="text-white text-xl font-semibold">Loading your creative space...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f]">
      {/* Ultra-premium animated background */}
      <div className="fixed inset-0 z-0">
        {/* Animated gradient orbs with parallax */}
        <div 
          className="absolute top-0 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/30 via-fuchsia-500/20 to-transparent rounded-full blur-[120px] animate-float"
          style={{
            transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute -bottom-1/4 -right-1/4 w-[900px] h-[900px] bg-gradient-to-tr from-blue-500/30 via-cyan-500/20 to-transparent rounded-full blur-[120px] animate-float-delayed"
          style={{
            transform: `translate(${mousePos.x * -0.03}px, ${mousePos.y * -0.02}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/20 to-yellow-500/20 rounded-full blur-[100px] animate-pulse-slow"
          style={{
            transform: `translate(calc(-50% + ${mousePos.x * 0.01}px), calc(-50% + ${mousePos.y * 0.01}px))`,
            transition: 'transform 0.4s ease-out'
          }}
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header with glassmorphism */}
        <div className="relative group mb-8 animate-fade-in-up">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000 animate-gradient-x" />
          
          <div className="relative px-8 py-6 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-banana to-yellow-400 rounded-full blur-md opacity-75 animate-pulse-slow" />
                    <div className="relative w-12 h-12 bg-gradient-to-br from-banana to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-gray-900" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/80">
                      Welcome Back, Creator
                    </h1>
                    <p className="text-white/60 text-sm font-medium">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="group relative px-6 py-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-200" />
                <div className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/90 to-pink-500/90 backdrop-blur-sm rounded-xl font-semibold text-white transform group-hover:scale-105 transition-all duration-200">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions - Ultra Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* AI Editor Card */}
          <Link
            href="/editor"
            className="relative group animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition duration-500 animate-gradient-x" />
            
            <div className="relative h-full px-8 py-10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden transform group-hover:scale-[1.02] transition-all duration-500">
              {/* Animated particles */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
              </div>
              
              {/* Icon */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition duration-300" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white">AI Editor</h2>
                  <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <p className="text-white/70 text-base leading-relaxed">
                  Transform images with AI-powered magic
                </p>
                
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-semibold text-white">Start Creating</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Templates Card */}
          <Link
            href="/templates"
            className="relative group animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition duration-500 animate-gradient-x" />
            
            <div className="relative h-full px-8 py-10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden transform group-hover:scale-[1.02] transition-all duration-500">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.7s' }} />
              </div>
              
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition duration-300" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white">Templates</h2>
                  <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <p className="text-white/70 text-base leading-relaxed">
                  Discover pre-made creative templates
                </p>
                
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-white">Browse Gallery</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Features Card */}
          <Link
            href="/features"
            className="relative group animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition duration-500 animate-gradient-x" />
            
            <div className="relative h-full px-8 py-10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden transform group-hover:scale-[1.02] transition-all duration-500">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
              </div>
              
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition duration-300" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white">Features</h2>
                  <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <p className="text-white/70 text-base leading-relaxed">
                  Explore powerful creative tools
                </p>
                
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-semibold text-white">Discover More</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Account Info - Premium Glass Card */}
        <div className="relative group animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition duration-1000 animate-gradient-x" />
          
          <div className="relative px-8 py-6 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              Account Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="px-6 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <p className="text-white/50 text-sm font-medium mb-1">Email Address</p>
                <p className="text-white font-semibold">{user.email}</p>
              </div>
              
              <div className="px-6 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <p className="text-white/50 text-sm font-medium mb-1">User ID</p>
                <p className="text-white font-mono text-sm">{user.id.substring(0, 20)}...</p>
              </div>
              
              <div className="px-6 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <p className="text-white/50 text-sm font-medium mb-1">Member Since</p>
                <p className="text-white font-semibold">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
