'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  Plus, Image as ImageIcon, Clock, Loader2, Sparkles
} from 'lucide-react';

export default function SimpleDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session, redirecting to login');
        router.push('/quick-signup');
        return;
      }
      
      console.log('✅ User logged in:', session.user.email);
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-banana" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Welcome Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">
                🎉 Welcome to Your Dashboard!
              </h1>
              <p className="text-white/70 text-lg">
                Logged in as: <span className="text-banana font-semibold">{user.email}</span>
              </p>
              <p className="text-white/60 text-sm mt-2">
                ✅ Authentication working perfectly!
              </p>
            </div>
            
            <Link
              href="/editor"
              className="px-8 py-4 bg-banana text-gray-900 font-bold text-lg rounded-xl hover:bg-yellow-300 transition-colors flex items-center gap-3 shadow-lg hover:shadow-banana/30"
            >
              <Plus className="h-6 w-6" />
              New Project
            </Link>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-green-500/20 p-3 rounded-full">
              <Sparkles className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2">
                Dashboard Access Successful!
              </h2>
              <p className="text-white/80 text-lg leading-relaxed">
                You've successfully logged in and accessed the dashboard. The authentication system is working correctly! This is a simplified dashboard that bypasses middleware issues.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/20 p-4 rounded-xl">
                <ImageIcon className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Projects</p>
                <p className="text-3xl font-black text-white">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-4 rounded-xl">
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Last Active</p>
                <p className="text-xl font-bold text-white">Just now</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="bg-banana/20 p-4 rounded-xl">
                <Sparkles className="h-8 w-8 text-banana" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Account</p>
                <p className="text-xl font-bold text-white">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <h2 className="text-2xl font-black text-white mb-6">🚀 Getting Started</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="bg-banana/20 p-2 rounded-lg">
                <span className="text-2xl">1️⃣</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Create Your First Project</h3>
                <p className="text-white/70">Click "New Project" to start editing images with AI</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <span className="text-2xl">2️⃣</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Upload an Image</h3>
                <p className="text-white/70">Start with any image you want to transform</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <span className="text-2xl">3️⃣</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Apply AI Magic</h3>
                <p className="text-white/70">Use natural language to transform your images</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="mt-8 text-center">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}
            className="px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-200 font-semibold rounded-xl hover:bg-red-500/30 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
