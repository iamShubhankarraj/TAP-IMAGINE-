// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getUserImageSessions, deleteImageSession, ImageSession } from '@/lib/supabase/image-sessions';
import { 
  Plus, Image as ImageIcon, Clock, Grid, Star, 
  ArrowRight, Loader2, AlertCircle, Trash2, Edit2, Eye
} from 'lucide-react';

// Types for templates
type Template = {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
};

export default function DashboardPage() {
  const { user, profile, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  
  const [recentSessions, setRecentSessions] = useState<ImageSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isAuthLoading, router]);

  // Fetch user's recent sessions
  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      try {
        setIsLoadingSessions(true);
        
        const { data, error } = await getUserImageSessions(20);
        
        if (error) throw error;
        
        setRecentSessions(data || []);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load your recent sessions');
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [user]);

  // Create new project
  const handleCreateNewProject = () => {
    router.push('/editor');
  };

  // Delete a session
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      const { error } = await deleteImageSession(sessionId);
      
      if (error) throw error;
      
      // Remove from state
      setRecentSessions(prevSessions => 
        prevSessions.filter(session => session.id !== sessionId)
      );
    } catch (err) {
      console.error('Error deleting session:', err);
      alert('Failed to delete session');
    }
  };

  // If loading auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-banana" />
      </div>
    );
  }

  // If not logged in (should redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome, {profile?.first_name || user.email?.split('@')[0] || 'Creator'}
              </h1>
              <p className="text-white/70">
                Create something amazing today with TAP[IMAGINE]
              </p>
            </div>
            
            <button
              onClick={handleCreateNewProject}
              className="px-6 py-3 bg-banana text-gray-900 font-medium rounded-full hover:bg-banana-light transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              New Project
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="bg-banana/20 p-3 rounded-full">
                <ImageIcon className="h-6 w-6 text-banana" />
              </div>
              <div>
                <p className="text-white/70">Total Sessions</p>
                <p className="text-2xl font-bold text-white">{recentSessions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="bg-banana/20 p-3 rounded-full">
                <Clock className="h-6 w-6 text-banana" />
              </div>
              <div>
                <p className="text-white/70">Last Active</p>
                <p className="text-2xl font-bold text-white">
                  {recentSessions.length > 0 
                    ? new Date(recentSessions[0].created_at).toLocaleDateString() 
                    : 'No activity'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="bg-banana/20 p-3 rounded-full">
                <Star className="h-6 w-6 text-banana" />
              </div>
              <div>
                <p className="text-white/70">Images Generated</p>
                <p className="text-2xl font-bold text-white">
                  {recentSessions.filter(s => s.generated_image_url).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sessions Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Sessions</h2>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
              >
                <Clock className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {isLoadingSessions ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-banana" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
              <p className="text-white/80 mb-2">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-banana hover:underline"
              >
                Try again
              </button>
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ImageIcon className="h-12 w-12 text-white/30 mb-4" />
              <p className="text-white/80 mb-4">You haven't created any sessions yet</p>
              <button 
                onClick={handleCreateNewProject}
                className="px-6 py-3 bg-banana text-gray-900 font-medium rounded-full hover:bg-banana-light transition-colors"
              >
                Create Your First Project
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {recentSessions.map((session) => (
                <div key={session.id} className="relative group">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-800 border border-white/10 flex items-center justify-center">
                    {session.generated_image_url ? (
                      <img 
                        src={session.generated_image_url} 
                        alt={session.session_name || 'Session'}
                        className="w-full h-full object-cover"
                      />
                    ) : session.original_image_url ? (
                      <img 
                        src={session.original_image_url} 
                        alt={session.session_name || 'Session'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-white/30" />
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2">
                        <Link 
                          href={`/results/${session.id}`}
                          className="p-2 bg-banana text-gray-900 rounded-full"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteSession(session.id)}
                          className="p-2 bg-red-500 text-white rounded-full"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-white font-medium truncate">{session.session_name || 'Untitled Session'}</h3>
                    <p className="text-white/60 text-sm">{new Date(session.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="h-16 w-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    {session.generated_image_url ? (
                      <img 
                        src={session.generated_image_url} 
                        alt={session.session_name || 'Session'}
                        className="w-full h-full object-cover"
                      />
                    ) : session.original_image_url ? (
                      <img 
                        src={session.original_image_url} 
                        alt={session.session_name || 'Session'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-white/30" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{session.session_name || 'Untitled Session'}</h3>
                    <p className="text-white/60 text-sm">{new Date(session.created_at).toLocaleDateString()}</p>
                    {session.prompt && (
                      <p className="text-white/70 text-sm truncate">{session.prompt}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                      href={`/results/${session.id}`}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-2 bg-white/10 hover:bg-red-500 text-white hover:text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {recentSessions.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm">
                {recentSessions.length} session{recentSessions.length !== 1 ? 's' : ''} total
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}