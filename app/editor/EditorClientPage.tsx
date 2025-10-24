// app/editor/EditorClientPage.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEditor } from '@/context/EditorContext';
import {
  Upload, Sparkles, Sliders, Download, Image as ImageIcon,
  Grid, ChevronLeft, ChevronRight, Undo, Redo, Save, Share2,
  Maximize2, Camera, Scissors
} from 'lucide-react';
import { StoredImage } from '@/types/editor';
import { TemplateData } from '@/types/templates';
import { ImageAdjustments } from '@/types/adjustments';
import { generateImageWithGemini } from '@/services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { useHistory, createAdjustmentsChangeOp, createStateSetterOp } from '@/context/history-context';

// Components
import ImageUploader from '@/components/editor/upload/ImageUploader';
import PromptInput from '@/components/editor/ai-prompt/PromptInput';
import TemplatesGrid from '@/components/editor/templates/TemplatesGrid';
import AdjustmentControls from '@/components/editor/adjustments/AdjustmentControls';
import FiltersPanel from '@/components/editor/filters/FiltersPanel';
import ImageComparison from '@/components/editor/canvas/ImageComparison';
import FloatingLassoButton from '@/components/editor/canvas/FloatingLassoButton';
import FloatingSketchButton from '@/components/editor/canvas/FloatingSketchButton';
import ExportModal from '@/components/editor/export/ExportModal';
import LassoSelectionTool from '@/components/editor/canvas/LassoSelectionTool';
import SketchTool from '@/components/editor/canvas/SketchTool';
import AreaEditModal from '@/components/editor/canvas/AreaEditModal';
import FunnyLoading from '@/components/animations/FunnyLoading';
import Alert from '@/components/shared/Alert';

type EditorTab = 'upload' | 'prompt' | 'templates' | 'adjust' | 'filters';

export default function EditorClientPage() {
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
  const { push, undo, redo, isUndoAvailable, isRedoAvailable } = useHistory();
  
  // Lasso selection state
  const [showLassoTool, setShowLassoTool] = useState(false);
  const [showAreaEditModal, setShowAreaEditModal] = useState(false);
  const [selectionData, setSelectionData] = useState<{
    imageData: string;
    maskImage: string;
    boundingBox: { x: number; y: number; width: number; height: number };
  } | null>(null);

  // Sketch tool state
  const [showSketchTool, setShowSketchTool] = useState(false);

  // History is managed via HistoryContext; pushes occur in action handlers.

  const handleUndo = () => {
    undo();
  };
  
  const handleRedo = () => {
    redo();
  };

  // Keyboard shortcuts: Undo/Redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;

      const key = e.key.toLowerCase();

      // Cmd/Ctrl+Shift+Z -> Redo
      if (key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }

      // Cmd/Ctrl+Z -> Undo
      if (key === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Y (Windows/Linux) -> Redo
      if (!isMac && key === 'y') {
        e.preventDefault();
        redo();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // History-aware setters
  const applyAdjustments = (next: ImageAdjustments, label?: string) => {
    const prev = adjustments;
    if (JSON.stringify(prev) === JSON.stringify(next)) return;
    setAdjustments(next);
    push(createAdjustmentsChangeOp(prev, next, setAdjustments, label));
  };

  const applyFilter = (filterId: string) => {
    const prevFilter = currentFilter;
    const applyFn = () => setCurrentFilter(filterId);
    const undoFn = () => setCurrentFilter(prevFilter);
    // Apply immediately then push op
    applyFn();
    push(createStateSetterOp('Filter Apply', 'filter_apply', applyFn, undoFn, { prev: prevFilter, next: filterId }, ['filters']));
  };

  // Handlers
  const handlePrimaryImageUpload = (image: StoredImage) => {
    const prev = primaryImage;
    const applyFn = () => setPrimaryImage(image);
    const undoFn = () => setPrimaryImage(prev);
    // Apply then push to history
    applyFn();
    push(createStateSetterOp('Set Primary Image', 'set_primary_image', applyFn, undoFn, { prev: prev?.url, next: image?.url }, ['images']));
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
        const prev = generatedImage;
        const nextImg = {
          id: uuidv4(),
          url: result.generatedImage,
          name: `edited-${primaryImage?.name || 'image'}`,
          createdAt: new Date(),
        } as StoredImage;
        const applyFn = () => setGeneratedImage(nextImg);
        const undoFn = () => setGeneratedImage(prev);
        applyFn();
        push(createStateSetterOp('Image Generation', 'image_generation', applyFn, undoFn, { prev: prev?.url, next: nextImg.url, prompt: inputPrompt }, ['ai', 'generation']));
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

  const handleLassoSelection = () => {
    if (!displayImage) {
      setError('Please upload an image first');
      return;
    }
    setShowLassoTool(true);
  };

  const handleSketchTool = () => {
    if (!displayImage) {
      setError('Please upload an image first');
      return;
    }
    console.log('🎨 Opening sketch tool with image:', {
      url: displayImage.url,
      name: displayImage.name,
      isDataURL: displayImage.url.startsWith('data:'),
      urlPreview: displayImage.url.substring(0, 100)
    });
    setShowSketchTool(true);
  };

  const handleSketchComplete = async (sketchedImage: string, sketchPrompt: string) => {
    setShowSketchTool(false);
    setIsProcessing(true);
    setError(null);

    try {
      // Create detailed prompt for sketch-based generation
      const detailedPrompt = `Using the red sketch marks as a guide, ${sketchPrompt}. The red lines indicate where and what shape to create. Make it look realistic and natural, blending perfectly with the rest of the image. Remove all red sketch marks in the final result.`;

      const result = await generateImageWithGemini({
        primaryImage: sketchedImage, // Send the sketched image
        referenceImages: referenceImages.map(img => img.url),
        prompt: detailedPrompt,
      });

      if (result.success && result.generatedImage) {
        const prev = generatedImage;
        const nextImg = {
          id: uuidv4(),
          url: result.generatedImage,
          name: `sketch-generated-${primaryImage?.name || 'image'}`,
          createdAt: new Date(),
        } as StoredImage;
        const applyFn = () => setGeneratedImage(nextImg);
        const undoFn = () => setGeneratedImage(prev);
        applyFn();
        push(createStateSetterOp('Sketch Generation', 'image_generation', applyFn, undoFn, { prev: prev?.url, next: nextImg.url, prompt: sketchPrompt }, ['ai', 'sketch']));
        setActiveTab('adjust');
      } else {
        setError(result.error || 'Failed to generate from sketch');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectionComplete = (maskData: {
    imageData: string;
    maskImage: string;
    boundingBox: { x: number; y: number; width: number; height: number };
  }) => {
    setSelectionData(maskData);
    setShowLassoTool(false);
    setShowAreaEditModal(true);
  };

  const handleAreaEditSubmit = async (areaPrompt: string) => {
    if (!selectionData || !displayImage) return;

    setIsProcessing(true);
    setError(null);
    setShowAreaEditModal(false);

    try {
      // Create a detailed prompt for area-specific editing
      const { boundingBox } = selectionData;
      const detailedPrompt = `In this image, modify ONLY the selected area at position x:${Math.round(boundingBox.x)}, y:${Math.round(boundingBox.y)}, width:${Math.round(boundingBox.width)}, height:${Math.round(boundingBox.height)}. ${areaPrompt}. Keep all other parts of the image exactly the same. Do not change anything outside this specific area.`;

      const result = await generateImageWithGemini({
        primaryImage: displayImage.url,
        referenceImages: referenceImages.map(img => img.url),
        prompt: detailedPrompt,
      });

      if (result.success && result.generatedImage) {
        const prev = generatedImage;
        const nextImg = {
          id: uuidv4(),
          url: result.generatedImage,
          name: `area-edited-${primaryImage?.name || 'image'}`,
          createdAt: new Date(),
        } as StoredImage;
        const applyFn = () => setGeneratedImage(nextImg);
        const undoFn = () => setGeneratedImage(prev);
        applyFn();
        push(createStateSetterOp('Area Edit Generation', 'image_generation', applyFn, undoFn, { prev: prev?.url, next: nextImg.url, areaPrompt }, ['ai', 'area-edit']));
        setSelectionData(null);
      } else {
        setError(result.error || 'Failed to edit area');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
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
            disabled={!isUndoAvailable}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={handleRedo}
            disabled={!isRedoAvailable}
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
                  <div className="pt-6 border-t border.white/10">
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
                referenceImages={referenceImages}
                onReferenceImagesChange={setReferenceImages}
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
                onChange={applyAdjustments}
              />
            )}
            
            {activeTab === 'filters' && (
              <FiltersPanel
                currentFilter={currentFilter}
                onFilterChange={applyFilter}
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
                
                {/* Floating Lasso Button */}
                <FloatingLassoButton 
                  onClick={handleLassoSelection}
                  disabled={!displayImage}
                />

                {/* Floating Sketch Button */}
                <FloatingSketchButton 
                  onClick={handleSketchTool}
                  disabled={!displayImage}
                />
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
                    
                    <h3 className="text-2xl font-bold text.white mb-3">No Image Selected</h3>
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

      {/* Lasso Selection Tool */}
      {showLassoTool && displayImage && (
        <LassoSelectionTool
          imageUrl={displayImage.url}
          onSelectionComplete={handleSelectionComplete}
          onCancel={() => {
            setShowLassoTool(false);
            setSelectionData(null);
          }}
        />
      )}

      {/* Sketch Tool */}
      {showSketchTool && displayImage && (
        <SketchTool
          imageUrl={displayImage.url}
          onClose={() => setShowSketchTool(false)}
          onSketchComplete={handleSketchComplete}
        />
      )}

      {/* Area Edit Modal */}
      <AreaEditModal
        isOpen={showAreaEditModal}
        onClose={() => {
          setShowAreaEditModal(false);
          setSelectionData(null);
        }}
        onSubmit={handleAreaEditSubmit}
        isProcessing={isProcessing}
      />
    </div>
  );
}