// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { 
  Plus, Image as ImageIcon, Clock, Grid, Star, 
  ArrowRight, Loader2, AlertCircle, Trash2, Edit2
} from 'lucide-react';

// Types for projects
type Project = {
  id: string;
  name: string;
  description: string | null;
  primary_image_url: string | null;
  generated_image_url: string | null;
  created_at: string;
  is_public: boolean;
};

// Types for templates
type Template = {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [popularTemplates, setPopularTemplates] = useState<Template[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Check authentication directly with Supabase (bypassing Auth Context)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.log('No session found, redirecting to login');
          router.push('/auth/login?redirect=/dashboard');
          return;
        }
        
        console.log('✅ User logged in:', session.user.email);
        setUser(session.user);
        
        // Try to fetch profile (optional)
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url, phone')
            .eq('id', session.user.id)
            .single();
          
          setProfile(profileData);
        } catch (profileError) {
          console.log('Profile not found (OK):', profileError);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/auth/login?redirect=/dashboard');
      } finally {
        setIsAuthLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  // Fetch user's recent projects
  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6);
        
        if (error) throw error;
        
        setRecentProjects(data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load your recent projects');
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [user]);

  // Fetch popular templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        
        const { data, error } = await supabase
          .from('templates')
          .select('id, name, description, thumbnail_url')
          .eq('is_public', true)
          .limit(6);
        
        if (error) throw error;
        
        setPopularTemplates(data || []);
      } catch (err) {
        console.error('Error fetching templates:', err);
        // We don't set the main error for templates as it's not critical
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // Create new project
  const handleCreateNewProject = () => {
    router.push('/editor');
  };

  // Delete a project
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
      
      // Remove from state
      setRecentProjects(prevProjects => 
        prevProjects.filter(project => project.id !== projectId)
      );
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project');
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
                <p className="text-white/70">Total Projects</p>
                <p className="text-2xl font-bold text-white">{recentProjects.length}</p>
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
                  {recentProjects.length > 0 
                    ? new Date(recentProjects[0].created_at).toLocaleDateString() 
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
                <p className="text-white/70">Templates Used</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Projects</h2>
            
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
          
          {isLoadingProjects ? (
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
          ) : recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ImageIcon className="h-12 w-12 text-white/30 mb-4" />
              <p className="text-white/80 mb-4">You haven't created any projects yet</p>
              <button 
                onClick={handleCreateNewProject}
                className="px-6 py-3 bg-banana text-gray-900 font-medium rounded-full hover:bg-banana-light transition-colors"
              >
                Create Your First Project
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <div key={project.id} className="relative group">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-800 border border-white/10 flex items-center justify-center">
                    {project.generated_image_url ? (
                      <img 
                        src={project.generated_image_url} 
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : project.primary_image_url ? (
                      <img 
                        src={project.primary_image_url} 
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-white/30" />
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2">
                        <Link 
                          href={`/editor?project=${project.id}`}
                          className="p-2 bg-banana text-gray-900 rounded-full"
                        >
                          <Edit2 className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 bg-red-500 text-white rounded-full"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-white font-medium truncate">{project.name}</h3>
                    <p className="text-white/60 text-sm">{new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="h-16 w-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    {project.generated_image_url ? (
                      <img 
                        src={project.generated_image_url} 
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : project.primary_image_url ? (
                      <img 
                        src={project.primary_image_url} 
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-white/30" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{project.name}</h3>
                    <p className="text-white/60 text-sm">{new Date(project.created_at).toLocaleDateString()}</p>
                    {project.description && (
                      <p className="text-white/70 text-sm truncate">{project.description}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                      href={`/editor?project=${project.id}`}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      <Edit2 className="h-5 w-5" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 bg-white/10 hover:bg-red-500 text-white hover:text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {recentProjects.length > 0 && (
            <div className="mt-6 text-center">
              <Link 
                href="/projects"
                className="text-banana hover:underline inline-flex items-center gap-1"
              >
                View all projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Popular Templates Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Popular Templates</h2>
            
            <Link 
              href="/templates"
              className="text-banana hover:underline inline-flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {isLoadingTemplates ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-banana" />
            </div>
          ) : popularTemplates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/70">No templates available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {popularTemplates.map((template) => (
                <Link 
                  key={template.id}
                  href={`/editor?template=${template.id}`}
                  className="group"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-800 border border-white/10 flex items-center justify-center">
                    {template.thumbnail_url ? (
                      <img 
                        src={template.thumbnail_url} 
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="text-white/30 group-hover:text-white/50 transition-colors">
                        {template.name.substring(0, 2)}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-white text-sm text-center truncate">{template.name}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}