'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Sparkles,
  Crown,
  UserCircle,
  LogOut,
  Upload,
  Camera,
  Image as ImageIcon,
  ArrowRight,
  Loader2,
  AlertCircle,
  Star,
  Grid,
  CheckCircle2,
  Shield,
  Rocket,
  LogIn,
  Settings,
} from 'lucide-react';
import { persistPrimaryImage, persistGeneratedImage, persistReferenceImage } from '@/services/project-service';
import { listLocalProjects, updateLocalProject, markLocalProjectSynced, appendLocalProjectEvent } from '@/services/local-projects';
import type { LocalProject } from '@/services/local-projects';

type User = {
  id: string;
  email: string;
};

type Profile = {
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  tier?: 'free' | 'pro' | 'premium' | null;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  primary_image_url: string | null;
  generated_image_url: string | null;
  created_at: string;
  is_public: boolean;
};

type Template = {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
};

export default function DashboardClient({ user, profile }: { user: User; profile: Profile | null }) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Data sections
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [popularTemplates, setPopularTemplates] = useState<Template[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // Local unsynced projects state (from localStorage)
  const [localProjects, setLocalProjects] = useState<LocalProject[]>([]);
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);

  // UI state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  // Derived tier (fallback to "free" if not present in profile)
  const tier: 'free' | 'pro' | 'premium' =
    profile?.tier === 'pro' || profile?.tier === 'premium' ? (profile?.tier as 'pro' | 'premium') : 'free';

  // Fetch user's recent projects
  useEffect(() => {
    if (!user?.id) return;
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
  }, [user?.id, supabase]);

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
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, [supabase]);

  // Load local projects from localStorage
  useEffect(() => {
    setLocalProjects(listLocalProjects());
  }, []);

  // Helper: refresh remote recent projects
  const refreshRecentProjects = async () => {
    if (!user?.id) return;
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
      console.error('Error refreshing projects:', err);
      setError('Failed to refresh your projects');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Background sync: after 60s, attempt to sync pending local projects to Supabase
  useEffect(() => {
    if (!user?.id) return;
    const timer = setTimeout(async () => {
      await syncPendingLocalProjects();
    }, 60000); // 60 seconds
    return () => clearTimeout(timer);
  }, [user?.id, localProjects]);

  const handleCreateNewProject = () => {
    router.push('/editor');
  };

  // Local project: title edit
  const handleLocalTitleSave = (id: string, name: string) => {
    updateLocalProject(id, { name });
    setLocalProjects(listLocalProjects());
  };

  // Sync a single local project to Supabase immediately
  const syncSingleLocalProject = async (p: LocalProject) => {
    if (!user?.id) return;
    setIsSyncingLocal(true);
    appendLocalProjectEvent(p.id, { label: 'Sync start', timestamp: Date.now(), action: 'sync_start' });
    try {
      // Create remote project via API to honor server-side policies
      const res = await fetch('/api/projects/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: p.name }),
      });
      const json = await res.json();
      if (!res.ok || !json?.id) {
        throw new Error(json?.details || 'Failed to create remote project');
      }
      const remoteId = json.id as string;

      // Upload images best-effort
      if (p.primaryImage?.url?.startsWith('data:')) {
        await persistPrimaryImage(p.primaryImage.url, user.id, remoteId);
      }
      if (p.generatedImage?.url?.startsWith('data:')) {
        await persistGeneratedImage(p.generatedImage.url, user.id, remoteId);
      }
      for (const ref of p.referenceImages || []) {
        if (ref.url?.startsWith('data:')) {
          await persistReferenceImage(ref.url, user.id, remoteId, `${ref.id}.png`);
        }
      }

      // Mark local as synced and refresh local+remote lists
      markLocalProjectSynced(p.id, remoteId);
      appendLocalProjectEvent(p.id, { label: 'Sync success', timestamp: Date.now(), action: 'sync_success', payload: { remoteId } });
      setLocalProjects(listLocalProjects());
      await refreshRecentProjects();
    } catch (err: any) {
      console.error('Local project sync failed:', err);
      appendLocalProjectEvent(p.id, { label: 'Sync failed', timestamp: Date.now(), action: 'sync_failure', payload: { error: err?.message } });
    } finally {
      setIsSyncingLocal(false);
    }
  };

  // Sync all pending local projects
  const syncPendingLocalProjects = async () => {
    const pending = (localProjects || []).filter((p) => p.status === 'pending');
    for (const p of pending) {
      await syncSingleLocalProject(p);
    }
  };

  // Avatar upload handler
  const handleAvatarSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingAvatar(true);
    setUpdateMessage(null);

    try {
      // Upload to Supabase Storage bucket "avatars"
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const publicUrl = publicData?.publicUrl;
      if (!publicUrl) {
        throw new Error('Failed to obtain public URL for avatar');
      }

      // Update profile with new avatar URL
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Refresh local profile state
      setUpdateMessage('Profile picture updated successfully!');
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setUpdateMessage(err?.message || 'Failed to upload avatar. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
// Start-from-image flow: file input and handlers
const imageInputRef = useRef<HTMLInputElement | null>(null);

const handleStartFromImageClick = () => {
  imageInputRef.current?.click();
};

const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !user) return;

  try {
    // Read selected image as base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;

      try {
        // Create a new project via API
        const res = await fetch('/api/projects/new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: file.name }),
        });
        const json = await res.json();

        if (!res.ok || !json?.id) {
          setError('Failed to create project');
          return;
        }

        const projectId = json.id as string;

        // Persist primary image to Supabase Storage and update project row
        const { error: persistError } = await persistPrimaryImage(base64, user.id, projectId);
        if (persistError) {
          console.warn('Primary image upload failed:', persistError);
        }

        // Redirect to editor with the created project
        router.push(`/editor?project=${projectId}`);
      } catch (err) {
        console.error('Start-from-image flow error:', err);
        setError('Failed to start project from image');
      } finally {
        if (imageInputRef.current) imageInputRef.current.value = '';
      }
    };

    reader.readAsDataURL(file);
  } catch (err) {
    console.error('Image file read error:', err);
    setError('Failed to read image file');
  }
};

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/auth?mode=login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Determine display name
  const displayName =
    (profile?.first_name || '') + (profile?.last_name ? ` ${profile?.last_name}` : '') ||
    user.email?.split('@')[0] ||
    'Creator';

  const tierStyles = {
    free: 'from-cyan-400/30 via-blue-400/20 to-transparent text-cyan-200 border-cyan-300/20',
    pro: 'from-violet-400/30 via-purple-400/20 to-transparent text-violet-200 border-purple-300/20',
    premium: 'from-yellow-400/30 via-orange-400/20 to-transparent text-yellow-200 border-yellow-300/20',
  } as const;

  const tierLabel = tier === 'premium' ? 'Premium' : tier === 'pro' ? 'Pro' : 'Free';

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f] text-white">
      {/* Ultra 4K Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Deep Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#120a28] to-[#09061a]" />
        {/* Floating Orbs */}
        <div className="absolute -top-1/3 -left-1/3 w-[1400px] h-[1400px] bg-gradient-to-br from-fuchsia-500/25 via-purple-500/20 to-transparent rounded-full blur-[180px] animate-float" />
        <div className="absolute -bottom-1/3 -right-1/4 w-[1600px] h-[1600px] bg-gradient-to-tr from-cyan-500/25 via-blue-500/20 to-transparent rounded-full blur-[200px] animate-float-delayed" />
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:120px_120px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,black_40%,transparent)]" />
        {/* Noise */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 h-20 border-b border-white/10 backdrop-blur-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 flex items-center justify-between px-6">
        <Link href="/" className="group text-2xl font-extrabold flex items-center transition-all">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-banana to-yellow-400 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-banana to-yellow-400">TAP</span>
          </div>
          <span className="text-white ml-1">[IMAGINE]</span>
        </Link>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border bg-gradient-to-r ${tierStyles[tier]}`}
            title={`Current Plan: ${tierLabel}`}
          >
            {tierLabel}
          </span>
          <button
            onClick={handleCreateNewProject}
            className="relative group/export ml-2 px-4 py-2.5 overflow-hidden rounded-xl"
            title="New Project"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-banana via-yellow-400 to-orange-400 rounded-xl blur opacity-50 group-hover/export:opacity-75 transition duration-200 animate-gradient-x" />
            <div className="relative flex items-center gap-2 px-2 py-0.5 bg-gradient-to-r from-banana to-yellow-400 rounded-lg text-gray-900 font-semibold transform group-hover/export:scale-105 transition-all duration-200">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">New</span>
            </div>
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg.white/20 transition-all flex items-center gap-2"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10">
        {/* Hero Profile Panel */}
        <section className="px-6 pt-8">
          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-8">
            {/* Profile Card */}
            <div className="relative group overflow-hidden rounded-3xl border border.white/15 bg-gradient-to-br from.white/10 via.white/5 to-transparent backdrop-blur-2xl shadow-2xl">
              {/* Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-700 animate-gradient-x pointer-events-none" />
              <div className="relative p-8">
                <div className="flex items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-banana to-yellow-400 rounded-2xl blur-md opacity-60 animate-pulse-slow" />
                    <div className="relative w-24 h-24 rounded-2xl border border-white/20 overflow-hidden bg-white/10 backdrop-blur">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url || ''} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <UserCircle className="h-12 w-12 text-white/60" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleAvatarSelect}
                      className="absolute -bottom-2 -right-2 rounded-xl px-3 py-1 bg-gradient-to-r from-banana to-yellow-400 text-gray-900 text-xs font-bold shadow-lg hover:scale-105 transition"
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? 'Uploading...' : 'Change'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarFileChange}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-extrabold tracking-tight">{displayName}</h1>
                      {tier === 'premium' && (
                        <span title="Premium Creator">
                          <Crown className="h-5 w-5 text-yellow-400" />
                        </span>
                      )}
                    </div>
                    <p className="text-white/70 text-sm">{user.email}</p>

                    {/* Badges */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs">
                        <Shield className="h-4 w-4 text-green-400" />
                        Secure Account
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs">
                        <Rocket className="h-4 w-4 text-banana" />
                        Gemini Nano Banana
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs">
                        <Star className="h-4 w-4 text-pink-400" />
                        {tierLabel} Plan
                      </span>
                    </div>

                    {/* Upgrade CTA */}
                    <div className="mt-6 flex gap-3">
                      <Link
                        href="/pricing"
                        className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-bold hover:scale-105 transition"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 rounded-xl blur opacity-40 group-hover:opacity-70 animate-gradient-x" />
                        <span className="relative z-10 inline-flex items-center gap-2">
                          Upgrade Plan
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Link>
                      <Link
                        href="/auth?mode=login"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
                      >
                        <LogIn className="h-4 w-4" />
                        Manage Account
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Update message */}
                {updateMessage && (
                  <div className="mt-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-200 text-sm">
                    {updateMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Illustration + Quick Actions */}
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl shadow-2xl">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 rounded-3xl blur-xl opacity-30 animate-gradient-x pointer-events-none" />
              <div className="relative p-8">
                {/* Illustration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative rounded-2xl bg-white/5 border border-white/10 p-6 overflow-hidden">
                    <div className="absolute -inset-8 bg-gradient-to-br from-fuchsia-500/20 via-purple-500/10 to-transparent rounded-3xl blur-3xl" />
                    <div className="relative flex items-center gap-3">
                      <Camera className="h-6 w-6 text-white/80" />
                      <div>
                        <p className="text-sm text-white/80">Start from Image</p>
                        <p className="text-xs text-white/50">Upload and edit instantly</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/editor')}
                      className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-banana to-yellow-400 text-gray-900 font-bold hover:scale-105 transition"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileChange}
                    />
                  </div>
                  <div className="relative rounded-2xl bg-white/5 border border-white/10 p-6 overflow-hidden">
                    <div className="absolute -inset-8 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent rounded-3xl blur-3xl" />
                    <div className="relative flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-white/80" />
                      <div>
                        <p className="text-sm text-white/80">Use a Template</p>
                        <p className="text-xs text-white/50">Curated styles</p>
                      </div>
                    </div>
                    <Link
                      href="/templates"
                      className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
                    >
                      <Grid className="h-4 w-4" />
                      Browse Templates
                    </Link>
                  </div>
                </div>

                {/* Feature pills */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {[
                    { icon: CheckCircle2, text: 'Instant Processing' },
                    { icon: Star, text: 'AI Powered' },
                    { icon: Shield, text: 'Secure & Private' },
                    { icon: Rocket, text: 'Blazing Fast' },
                  ].map((f, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg.white/5 border border.white/10 text-white/70 text-xs"
                    >
                      <f.icon className="h-4 w-4 text-banana" />
                      {f.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Projects */}
        <section className="px-6 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Projects</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list' ? 'bg-white/10 text.white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
              </div>
            </div>


            {(() => {
              const normalizedLocal = (localProjects || []).map((p) => ({
                id: p.id,
                name: p.name,
                date: new Date((p.updatedAt || p.createdAt) as string),
                thumbnail: p.thumbnailDataUrl || null,
                kind: 'local' as const,
                status: p.status,
              }));
              const normalizedRemote = (recentProjects || []).map((project) => ({
                id: project.id,
                name: project.name,
                date: new Date(project.created_at),
                thumbnail: project.generated_image_url || project.primary_image_url || null,
                kind: 'remote' as const,
                status: 'synced' as const,
              }));
              const combined = [...normalizedLocal, ...normalizedRemote].sort((a, b) => b.date.getTime() - a.date.getTime());

              if (error) {
                return (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                    <p className="text-white/80 mb-2">{error}</p>
                    <button onClick={() => window.location.reload()} className="text-banana hover:underline">
                      Try again
                    </button>
                  </div>
                );
              }

              if (combined.length === 0) {
                return isLoadingProjects ? (
                  <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-banana" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <ImageIcon className="h-12 w-12 text-white/30 mb-4" />
                    <p className="text-white/80 mb-4">You haven't created any projects yet</p>
                    <button
                      onClick={handleCreateNewProject}
                      className="px-6 py-3 bg-banana text-gray-900 font-medium rounded-full hover:bg-yellow-300 transition-colors"
                    >
                      Create Your First Project
                    </button>
                  </div>
                );
              }

              if (viewMode === 'grid') {
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {combined.map((item) => (
                      <div key={`${item.kind}-${item.id}`} className="relative group rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                        <div className="aspect-[4/3] w-full h-auto">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-10 w-10 text-white/30" />
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-2">
                            <Link
                              href={item.kind === 'local' ? `/editor?local=${item.id}` : `/editor?project=${item.id}`}
                              className="px-4 py-2 rounded-xl bg-banana text-gray-900 font-bold hover:scale-105 transition"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-white font-medium truncate">{item.name}</h3>
                            {item.kind === 'local' && (
                              <span className="px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white/70 text-xs">
                                {item.status === 'pending'
                                  ? 'Local • Pending Sync'
                                  : item.status === 'failed'
                                  ? 'Local • Failed'
                                  : 'Local • Synced'}
                              </span>
                            )}
                          </div>
                          <p className="text-white/60 text-sm">{item.date.toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {combined.map((item) => (
                    <div
                      key={`${item.kind}-${item.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border border-white/10"
                    >
                      <div className="h-16 w-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-white/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-medium truncate">{item.name}</h3>
                          {item.kind === 'local' && (
                            <span className="px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white/70 text-xs">
                              {item.status === 'pending'
                                ? 'Local • Pending Sync'
                                : item.status === 'failed'
                                ? 'Local • Failed'
                                : 'Local • Synced'}
                            </span>
                          )}
                        </div>
                        <p className="text-white/60 text-sm">{item.date.toLocaleDateString()}</p>
                      </div>
                      <Link
                        href={item.kind === 'local' ? `/editor?local=${item.id}` : `/editor?project=${item.id}`}
                        className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
                      >
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </section>

        {/* Popular Templates */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Popular Templates</h2>
              <Link href="/templates" className="text-banana hover:underline inline-flex items-center gap-1">
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
                <p className="text-white/70">No templates yet — our AI is brewing inspiration. Check back soon or start your first project!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {popularTemplates.map((template) => (
                  <Link key={template.id} href={`/editor?template=${template.id}`} className="group">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify.center">
                      {template.thumbnail_url ? (
                        <img
                          src={template.thumbnail_url}
                          alt={template.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="text-white/40 group-hover:text-white/60 transition-colors text-2xl font-bold">
                          {template.name.substring(0, 2)}
                        </div>
                      )}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from.white/10 via.white/5 to-transparent" />
                    </div>
                    <p className="mt-2 text-white text-sm text-center truncate">{template.name}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}