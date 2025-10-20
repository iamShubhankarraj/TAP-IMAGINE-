// app/editor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEditor } from '@/context/EditorContext';
import { 
  Upload, Sparkles, Sliders, Download, Image as ImageIcon, 
  Grid, ChevronLeft, ChevronRight, Undo, Redo, Save, Share2, 
  Maximize2, Camera
} from 'lucide-react';
import { StoredImage } from '@/types/editor';
import { TemplateData } from '@/types/templates';
import { ImageAdjustments, defaultAdjustments } from '@/types/adjustments';
import { generateImageWithGemini } from '@/services/geminiService';
import { v4 as uuidv4 } from 'uuid';

// Components
import ImageUploader from '@/components/editor/upload/ImageUploader';
import PromptInput from '@/components/editor/ai-prompt/PromptInput';
import TemplatesGrid from '@/components/editor/templates/TemplatesGrid';
import AdjustmentControls from '@/components/editor/adjustments/AdjustmentControls';
import FiltersPanel from '@/components/editor/filters/FiltersPanel';
import ImageComparison from '@/components/editor/canvas/ImageComparison';
import ExportModal from '@/components/editor/export/ExportModal';
import FunnyLoading from '@/components/animations/FunnyLoading';
import Alert from '@/components/shared/Alert';

type EditorTab = 'upload' | 'prompt' | 'templates' | 'adjust' | 'filters';

export default function EditorPage() {
  // Get editor context
  const {
    primaryImage,
    setPrimaryImage,
    generatedImage,
    setGeneratedImage,
    referenceImages,
    setReferenceImages,
    adjustments,
    setAdjustments,
    currentFilter,
    setCurrentFilter,
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    prompt,
    setPrompt,
    getDisplayImage,
    getImageForProcessing,
  } = useEditor();
  
  // Local state
  const [activeTab, setActiveTab] = useState<EditorTab>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Add to history when adjustments change
  useEffect(() => {
    // Only add to history if adjustments actually changed
    const lastHistoryItem = history[historyIndex];
    if (JSON.stringify(lastHistoryItem) !== JSON.stringify(adjustments)) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(adjustments);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [adjustments]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setAdjustments(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setAdjustments(history[newIndex]);
    }
  };

  // Handlers
  const handlePrimaryImageUpload = (image: StoredImage) => {
    setPrimaryImage(image);
    setActiveTab('prompt');
  };

  const handleReferenceImageUpload = (image: StoredImage) => {
    setReferenceImages([...referenceImages, image]);
  };

  const handleTemplateSelect = async (template: TemplateData) => {
    if (!primaryImage) {
      setError('Please upload an image first');
      return;
    }

    setPrompt(template.prompt);
    await processImage(template.prompt);
  };

  const handlePromptSubmit = async () => {
    if (!prompt.trim() || !primaryImage) {
      setError('Please upload an image and enter a prompt');
      return;
    }
    await processImage(prompt);
  };

  const processImage = async (inputPrompt: string) => {
    // Use the latest edited image if available, otherwise use primary
    const imageToProcess = getImageForProcessing();
    
    if (!imageToProcess) {
      setError('No image available for processing');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await generateImageWithGemini({
        primaryImage: imageToProcess, // Use edited image for chaining
        referenceImages: referenceImages.map(img => img.url),
        prompt: inputPrompt,
      });

      if (result.success && result.generatedImage) {
        setGeneratedImage({
          id: uuidv4(),
          url: result.generatedImage,
          name: `edited-${primaryImage?.name || 'image'}`,
          createdAt: new Date(),
        });
        setActiveTab('adjust');
      } else {
        setError(result.error || 'Failed to generate image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    if (!generatedImage && !primaryImage) {
      setError('No image to export');
      return;
    }
    // Redirect to new export page
    router.push('/editor/export');
  };

  const displayImage = getDisplayImage();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0a0a0f] text-white">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/20 via-fuchsia-500/10 to-transparent rounded-full blur-[120px] animate-float" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[900px] h-[900px] bg-gradient-to-tr from-blue-500/20 via-cyan-500/10 to-transparent rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      {/* Loading Overlay */}
      {isProcessing && <FunnyLoading />}

      {/* Header - Premium Glass */}
      <header className="relative z-10 h-16 border-b border-white/10 backdrop-blur-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 flex items-center justify-between px-4 md:px-6">
        <Link href="/" className="group text-2xl font-bold flex items-center transition-all">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-banana to-yellow-400 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-banana to-yellow-400">TAP</span>
          </div>
          <span className="text-white ml-1">[IMAGINE]</span>
        </Link>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group disabled:opacity-30 disabled:cursor-not-allowed" 
            title="Undo"
          >
            <Undo className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group disabled:opacity-30 disabled:cursor-not-allowed" 
            title="Redo"
          >
            <Redo className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group" title="Save">
            <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group" title="Share">
            <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={handleExport}
            className="relative group/export ml-2 px-4 py-2.5 overflow-hidden rounded-xl"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-banana via-yellow-400 to-orange-400 rounded-xl blur opacity-50 group-hover/export:opacity-75 transition duration-200 animate-gradient-x" />
            <div className="relative flex items-center gap-2 px-2 py-0.5 bg-gradient-to-r from-banana to-yellow-400 rounded-lg text-gray-900 font-semibold transform group-hover/export:scale-105 transition-all duration-200">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </div>
          </button>
        </div>
      </header>
      
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Sidebar - Premium Glass */}
        <aside 
          className={`${
            isSidebarCollapsed ? 'w-0' : 'w-80 lg:w-96'
          } border-r border-white/10 backdrop-blur-xl bg-gradient-to-b from-white/5 via-white/10 to-white/5 flex flex-col transition-all duration-300 overflow-hidden relative shadow-2xl`}
        >
          {/* Sidebar Toggle - Enhanced */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-20 z-20 p-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg group"
          >
            {isSidebarCollapsed ? 
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /> : 
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            }
          </button>
          
          {/* Tabs - Premium Glass Tabs */}
          <div className="flex border-b border-white/10 overflow-x-auto bg-white/5">
            {[
              { id: 'upload' as EditorTab, icon: Upload, label: 'Upload' },
              { id: 'prompt' as EditorTab, icon: Sparkles, label: 'Prompt' },
              { id: 'templates' as EditorTab, icon: Grid, label: 'Templates' },
              { id: 'adjust' as EditorTab, icon: Sliders, label: 'Adjust' },
              { id: 'filters' as EditorTab, icon: ImageIcon, label: 'Filters' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center justify-center py-3 px-4 flex-1 min-w-0 group ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-b from-white/15 to-white/10 border-b-2 border-banana shadow-lg' 
                    : 'hover:bg-white/5'
                } transition-all duration-300`}
              >
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-banana/10 to-transparent" />
                )}
                <tab.icon className={`h-5 w-5 mr-2 flex-shrink-0 ${
                  activeTab === tab.id ? 'text-banana' : 'text-white/60 group-hover:text-white'
                } transition-colors`} />
                <span className={`text-sm truncate ${
                  activeTab === tab.id ? 'text-white font-semibold' : 'text-white/70'
                }`}>{tab.label}</span>
              </button>
            ))}
          </div>
          
          {/* Tab Content - Enhanced Scrollbar */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {activeTab === 'upload' && (
              <div className="space-y-6">
                <ImageUploader 
                  onImageUpload={handlePrimaryImageUpload}
                  title="Primary Image"
                />
                
                {primaryImage && (
                  <div className="pt-6 border-t border-white/10">
                    <ImageUploader 
                      onImageUpload={handleReferenceImageUpload}
                      title="Reference Images (Optional)"
                      multiple
                    />
                    
                    {referenceImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {referenceImages.map((img, i) => (
                          <div key={img.id} className="aspect-square rounded-lg overflow-hidden border border-white/10">
                            <img src={img.url} alt={`Reference ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'prompt' && (
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                onSubmit={handlePromptSubmit}
                isProcessing={isProcessing}
                disabled={!primaryImage}
              />
            )}
            
            {activeTab === 'templates' && (
              <TemplatesGrid
                onTemplateSelect={handleTemplateSelect}
                userImage={primaryImage?.url}
              />
            )}
            
            {activeTab === 'adjust' && (
              <AdjustmentControls
                adjustments={adjustments}
                onChange={setAdjustments}
              />
            )}
            
            {activeTab === 'filters' && (
              <FiltersPanel
                currentFilter={currentFilter}
                onFilterChange={setCurrentFilter}
                previewImage={displayImage?.url}
              />
            )}
          </div>
        </aside>
        
        {/* Main Canvas - Premium Glass Container */}
        <main className="flex-1 overflow-hidden relative">
          {/* Premium Grid Background with Glow */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
          </div>
          
          {/* Canvas Content */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            {displayImage ? (
              <div className="relative w-full h-full">
                {/* Glass frame for image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative max-w-7xl max-h-full">
                    {/* Glow effect */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-2xl opacity-50" />
                    {/* Glass container */}
                    <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl border border-white/20 shadow-2xl p-4">
                      <ImageComparison
                        originalUrl={primaryImage?.url || ''}
                        editedUrl={generatedImage?.url}
                        adjustments={adjustments}
                        filter={currentFilter || undefined}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000 animate-gradient-x" />
                  
                  {/* Glass card */}
                  <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl p-12 border border-white/20 shadow-2xl max-w-md">
                    {/* Icon with glow */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse-slow" />
                      <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border border-white/10">
                        <Camera className="h-12 w-12 text-white/40" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3">No Image Selected</h3>
                    <p className="text-white/60 mb-8 leading-relaxed">Upload an image to start creating amazing transformations with AI</p>
                    
                    <button 
                      onClick={() => setActiveTab('upload')}
                      className="relative group/btn overflow-hidden"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-banana via-yellow-400 to-orange-400 rounded-xl blur opacity-50 group-hover/btn:opacity-75 transition duration-200 animate-gradient-x" />
                      <div className="relative px-8 py-4 bg-gradient-to-r from-banana to-yellow-400 rounded-xl text-gray-900 font-bold inline-flex items-center gap-2 transform group-hover/btn:scale-105 transition-all duration-200">
                        <Upload className="h-5 w-5" />
                        Upload Image
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        imageUrl={displayImage?.url || null}
        adjustments={adjustments}
      />
    </div>
  );
}