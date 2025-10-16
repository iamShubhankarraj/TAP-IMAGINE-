'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, SlidersHorizontal, Clock, Share2, Edit, 
  Sparkles, Info, Loader2, AlertCircle 
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useImageStore } from '@/context/image-store';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import VersionsList from '@/components/VersionsList';
import QuickAdjustments from '@/components/QuickAdjustments';
import ShareExportPanel from '@/components/ShareExportPanel';
import {
  getImageSession,
  getSessionVersions,
  updateImageSession,
  createImageVersion,
  shareImageSession,
  ImageSession,
  ImageVersion,
} from '@/lib/supabase/image-sessions';

type ViewMode = 'comparison' | 'versions' | 'adjustments' | 'share';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { setPrimaryImage, setGeneratedImage } = useImageStore();
  
  const [session, setSession] = useState<ImageSession | null>(null);
  const [versions, setVersions] = useState<ImageVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<ImageVersion | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('comparison');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adjustedImageUrl, setAdjustedImageUrl] = useState<string | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);

  const sessionId = params.id as string;

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: sessionData, error: sessionError } = await getImageSession(sessionId);
      
      if (sessionError || !sessionData) {
        setError('Session not found or you do not have access');
        return;
      }

      setSession(sessionData);

      const { data: versionsData } = await getSessionVersions(sessionId);
      if (versionsData) {
        setVersions(versionsData);
        if (versionsData.length > 0) {
          setCurrentVersion(versionsData[versionsData.length - 1]);
        }
      }
    } catch (err) {
      console.error('Error loading session:', err);
      setError('Failed to load session data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustmentsChange = (adjustments: any) => {
    if (!session?.generated_image_url) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.filter = `brightness(${100 + adjustments.brightness}%) contrast(${100 + adjustments.contrast}%) saturate(${100 + adjustments.saturation}%)`;
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((adjustments.rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        
        setAdjustedImageUrl(canvas.toDataURL('image/png'));
      }
    };
    
    img.crossOrigin = 'anonymous';
    img.src = session.generated_image_url;
  };

  const handleSaveAdjustments = async (adjustments: any) => {
    if (!session || !adjustedImageUrl) return;

    try {
      await updateImageSession(session.id, {
        adjustments,
        generated_image_url: adjustedImageUrl,
      });

      const newVersion: ImageVersion = {
        id: `temp-${Date.now()}`,
        session_id: session.id,
        version_number: versions.length + 1,
        image_url: adjustedImageUrl,
        adjustments,
        created_at: new Date().toISOString(),
      };

      await createImageVersion({
        session_id: session.id,
        version_number: newVersion.version_number,
        image_url: adjustedImageUrl,
        adjustments,
      });

      setVersions([...versions, newVersion]);
      setCurrentVersion(newVersion);
      
      alert('Adjustments saved successfully!');
    } catch (error) {
      console.error('Error saving adjustments:', error);
      alert('Failed to save adjustments');
    }
  };

  const handleGenerateShareLink = async (): Promise<string> => {
    if (!session) throw new Error('No session');
    
    const { shareUrl, error } = await shareImageSession(session.id);
    
    if (error || !shareUrl) {
      throw new Error('Failed to generate share link');
    }
    
    return shareUrl;
  };

  const handleReopenEditor = () => {
    if (!session) return;

    setPrimaryImage({
      id: 'restored',
      url: session.original_image_url,
      name: session.original_image_name || 'image',
      createdAt: new Date(session.created_at),
    });

    if (session.generated_image_url) {
      setGeneratedImage({
        id: 'restored-generated',
        url: session.generated_image_url,
        name: session.generated_image_name || 'edited',
        createdAt: new Date(session.updated_at),
      });
    }

    router.push('/editor');
  };

  const getCurrentImageUrl = () => {
    if (adjustedImageUrl) return adjustedImageUrl;
    if (currentVersion) return currentVersion.image_url;
    if (session?.generated_image_url) return session.generated_image_url;
    return session?.original_image_url || '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-banana mb-4" />
          <p className="text-white/70">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-white/70 mb-6">{error || 'Session not found'}</p>
          <Link 
            href="/editor"
            className="inline-flex items-center gap-2 px-6 py-3 bg-banana text-gray-900 font-medium rounded-lg hover:bg-banana-light transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Editor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/editor"
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">
                  {session.session_name || 'Untitled Session'}
                </h1>
                <p className="text-sm text-white/60">
                  Created {new Date(session.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMetadata(!showMetadata)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
              >
                <Info className="h-4 w-4" />
                <span className="hidden md:inline">Info</span>
              </button>
              <button
                onClick={handleReopenEditor}
                className="flex items-center gap-2 px-4 py-2 bg-banana text-gray-900 font-medium rounded-lg hover:bg-banana-light transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden md:inline">Continue Editing</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Metadata Panel */}
      {showMetadata && session && (
        <div className="border-b border-white/10 bg-black/30 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-white/50">Prompt:</span>
                <p className="text-white/90">{session.prompt || 'N/A'}</p>
              </div>
              <div>
                <span className="text-white/50">Aspect Ratio:</span>
                <p className="text-white/90">{session.aspect_ratio || 'Original'}</p>
              </div>
              <div>
                <span className="text-white/50">Versions:</span>
                <p className="text-white/90">{versions.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <div className="flex-1 space-y-4">
            {/* View Mode Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setViewMode('comparison')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  viewMode === 'comparison'
                    ? 'bg-banana text-gray-900'
                    : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Before/After
              </button>
              <button
                onClick={() => setViewMode('versions')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  viewMode === 'versions'
                    ? 'bg-banana text-gray-900'
                    : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                <Clock className="h-4 w-4" />
                Versions ({versions.length})
              </button>
              <button
                onClick={() => setViewMode('adjustments')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  viewMode === 'adjustments'
                    ? 'bg-banana text-gray-900'
                    : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Adjust
              </button>
              <button
                onClick={() => setViewMode('share')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  viewMode === 'share'
                    ? 'bg-banana text-gray-900'
                    : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>

            {/* Content based on view mode */}
            <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
              {viewMode === 'comparison' && (
                <div className="aspect-video">
                  <BeforeAfterSlider
                    beforeImage={session.original_image_url}
                    afterImage={getCurrentImageUrl()}
                    className="w-full h-full"
                  />
                </div>
              )}

              {viewMode === 'versions' && (
                <div className="p-6">
                  <VersionsList
                    versions={versions}
                    currentVersion={currentVersion?.version_number || 1}
                    onSelectVersion={(version) => setCurrentVersion(version)}
                  />
                </div>
              )}

              {viewMode === 'adjustments' && (
                <div className="p-6">
                  <QuickAdjustments
                    initialAdjustments={session.adjustments}
                    onAdjustmentsChange={handleAdjustmentsChange}
                    imageUrl={getCurrentImageUrl()}
                  />
                  <button
                    onClick={() => handleSaveAdjustments(session.adjustments)}
                    className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 bg-banana text-gray-900 font-medium rounded-lg hover:bg-banana-light transition-colors"
                  >
                    Save as New Version
                  </button>
                </div>
              )}

              {viewMode === 'share' && (
                <div className="p-6">
                  <ShareExportPanel
                    imageUrl={getCurrentImageUrl()}
                    imageName={session.generated_image_name || 'edited-image'}
                    shareUrl={session.share_token ? `${window.location.origin}/results/${session.share_token}` : undefined}
                    onGenerateShareLink={handleGenerateShareLink}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Current Image Preview */}
          <aside className="lg:w-80 space-y-4">
            <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold mb-3 text-white/80">Current View</h3>
              <div className="aspect-square bg-black/30 rounded-lg overflow-hidden mb-3">
                <img
                  src={getCurrentImageUrl()}
                  alt="Current"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-xs text-white/60 space-y-1">
                <p>Version: {currentVersion?.version_number || session.version}</p>
                <p>Size: High Quality PNG</p>
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold mb-3 text-white/80">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setViewMode('adjustments')}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Quick Adjust
                </button>
                <button
                  onClick={() => setViewMode('share')}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share/Download
                </button>
                <button
                  onClick={handleReopenEditor}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Full Editor
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
