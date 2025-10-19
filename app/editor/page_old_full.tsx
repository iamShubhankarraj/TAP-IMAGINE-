// app/editor/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  // State
  const [primaryImage, setPrimaryImage] = useState<StoredImage | null>(null);
  const [referenceImages, setReferenceImages] = useState<StoredImage[]>([]);
  const [generatedImage, setGeneratedImage] = useState<StoredImage | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(defaultAdjustments);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handlePrimaryImageUpload = (image: StoredImage) => {
    setPrimaryImage(image);
    setActiveTab('prompt');
  };

  const handleReferenceImageUpload = (image: StoredImage) => {
    setReferenceImages(prev => [...prev, image]);
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
    if (!primaryImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await generateImageWithGemini({
        primaryImage: primaryImage.url,
        referenceImages: referenceImages.map(img => img.url),
        prompt: inputPrompt,
      });

      if (result.success && result.generatedImage) {
        setGeneratedImage({
          id: uuidv4(),
          url: result.generatedImage,
          name: `edited-${primaryImage.name}`,
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
    setIsExportModalOpen(true);
  };

  const displayImage = generatedImage || primaryImage;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 text-white">
      {/* Loading Overlay */}
      {isProcessing && <FunnyLoading />}

      {/* Header */}
      <header className="h-16 border-b border-white/10 backdrop-blur-md bg-black/20 flex items-center justify-between px-4 md:px-6 z-10">
        <Link href="/" className="text-2xl font-bold flex items-center hover:opacity-80 transition-opacity">
          <span className="text-banana">TAP</span>
          <span className="text-white">[IMAGINE]</span>
        </Link>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Undo">
            <Undo className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Redo">
            <Redo className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Save">
            <Save className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Share">
            <Share2 className="h-5 w-5" />
          </button>
          <button 
            onClick={handleExport}
            className="ml-2 px-4 py-2 bg-banana hover:bg-banana-light text-gray-900 font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`${
            isSidebarCollapsed ? 'w-0' : 'w-80 lg:w-96'
          } border-r border-white/10 backdrop-blur-md bg-black/20 flex flex-col transition-all duration-300 overflow-hidden relative`}
        >
          {/* Sidebar Toggle */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-20 z-20 p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"
          >
            {isSidebarCollapsed ? 
              <ChevronRight className="h-4 w-4" /> : 
              <ChevronLeft className="h-4 w-4" />
            }
          </button>
          
          {/* Tabs */}
          <div className="flex border-b border-white/10 overflow-x-auto">
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
                className={`flex items-center justify-center py-3 px-4 flex-1 min-w-0 ${
                  activeTab === tab.id ? 'bg-white/10 border-b-2 border-banana' : 'hover:bg-white/5'
                } transition-colors`}
              >
                <tab.icon className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm truncate">{tab.label}</span>
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
        
        {/* Main Canvas */}
        <main className="flex-1 overflow-hidden relative">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
          
          {/* Canvas Content */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            {displayImage ? (
              <ImageComparison
                originalUrl={primaryImage?.url || ''}
                editedUrl={generatedImage?.url}
                adjustments={adjustments}
                filter={currentFilter || undefined}
              />
            ) : (
              <div className="text-center">
                <div className="backdrop-blur-md bg-black/30 rounded-2xl p-12 border border-white/10 shadow-2xl max-w-md">
                  <Camera className="h-20 w-20 text-white/30 mx-auto mb-6" />
                  <h3 className="text-2xl font-medium text-white mb-3">No Image Selected</h3>
                  <p className="text-white/60 mb-8">Upload an image to start creating amazing transformations</p>
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className="px-8 py-4 bg-banana hover:bg-banana-light text-gray-900 font-medium rounded-xl transition-all hover:scale-105 inline-flex items-center gap-2"
                  >
                    <Upload className="h-5 w-5" />
                    Upload Image
                  </button>
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