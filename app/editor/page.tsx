// app/editor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useImageStore } from '@/context/image-store';
import { generateImageWithNanoBanana } from '@/services/ai-processing/nano-banana';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import { 
  Upload, Sparkles, Sliders, Download, Image as ImageIcon, 
  Grid, Wand2, RotateCw, ChevronLeft, ChevronRight, Layers,
  SlidersHorizontal, Undo, Redo, Save, Share2, Palette,
  Maximize2, Loader2
} from 'lucide-react';

type EditorTab = 'upload' | 'prompt' | 'templates' | 'adjust';
type AspectRatioOption = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | 'original';

// Example templates
const templates = [
  { id: 1, name: 'You as a child', thumbnail: '/templates/child.jpg' },
  { id: 2, name: '80s Retro', thumbnail: '/templates/80s.jpg' },
  { id: 3, name: 'Cyberpunk', thumbnail: '/templates/cyberpunk.jpg' },
  { id: 4, name: 'Watercolor', thumbnail: '/templates/watercolor.jpg' },
  { id: 5, name: 'Anime Style', thumbnail: '/templates/anime.jpg' },
  { id: 6, name: 'Superhero', thumbnail: '/templates/superhero.jpg' },
];

// Funny loading messages
const funnyLoadingMessages = [
  "Teaching monkeys to use Photoshop...",
  "Polishing pixels to perfection...",
  "Consulting with Leonardo da Vinci...",
  "Negotiating with the color palette...",
  "Feeding the hamsters that power our servers...",
  "Making your photo look bananas!",
  "Convincing AI not to add laser eyes...",
  "Searching for the perfect filter in a parallel universe...",
  "Converting caffeine into creative code...",
  "Whispering sweet nothings to the algorithm..."
];

export default function EditorPage() {
  const { primaryImage, referenceImages, generatedImage, setPrimaryImage, setGeneratedImage } = useImageStore();
  const [activeTab, setActiveTab] = useState<EditorTab>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [adjustments, setAdjustments] = useState<Record<string, number>>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
  });
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('original');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        const randomMessage = funnyLoadingMessages[Math.floor(Math.random() * funnyLoadingMessages.length)];
        setLoadingMessage(randomMessage);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPrimaryImage({
        id: uuidv4(),
        url: base64,
        name: file.name,
        createdAt: new Date(),
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePromptSubmit = () => {
    if (!prompt.trim() || !primaryImage) return;
    processImage(prompt);
  };

  const handleTemplateSelect = (templateName: string) => {
    const templatePrompt = `Transform this image in the style of ${templateName}`;
    setPrompt(templatePrompt);
    processImage(templatePrompt);
  };

  const processImage = async (inputPrompt: string) => {
    if (!primaryImage) {
      alert('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    setLoadingMessage(funnyLoadingMessages[Math.floor(Math.random() * funnyLoadingMessages.length)]);

    try {
      const referenceImageBase64 = referenceImages.map(img => img.url);
      
      const result = await generateImageWithNanoBanana({
        primaryImage: primaryImage.url,
        referenceImages: referenceImageBase64,
        prompt: inputPrompt,
        aspectRatio: aspectRatio === 'original' ? undefined : aspectRatio,
      });

      if (result.status === 'success') {
        setGeneratedImage({
          id: uuidv4(),
          url: result.generatedImage,
          name: `edited-${primaryImage.name}`,
          createdAt: new Date(),
        });
      } else {
        alert(`Error: ${result.message || 'Failed to generate image'}`);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdjustmentChange = (name: string, value: number) => {
    setAdjustments(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 text-white">
      {/* Header with logo and actions */}
      <header className="h-16 border-b border-white/10 backdrop-blur-md bg-black/20 flex items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-2xl font-bold flex items-center">
          <span className="text-banana">TAP</span>
          <span className="text-white">[IMAGINE]</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Undo className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Redo className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Save className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`${
            isSidebarCollapsed ? 'w-16' : 'w-64 md:w-80'
          } border-r border-white/10 backdrop-blur-md bg-black/20 flex flex-col transition-all duration-300 overflow-hidden`}
        >
          {/* Sidebar toggle */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute top-20 left-0 ml-3 p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors z-10"
          >
            {isSidebarCollapsed ? 
              <ChevronRight className="h-4 w-4" /> : 
              <ChevronLeft className="h-4 w-4" />
            }
          </button>
          
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center justify-center py-4 flex-1 ${activeTab === 'upload' ? 'bg-white/10' : 'hover:bg-white/5'} transition-colors`}
            >
              {isSidebarCollapsed ? (
                <Upload className="h-5 w-5" />
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  <span>Upload</span>
                </>
              )}
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex items-center justify-center py-4 flex-1 ${activeTab === 'prompt' ? 'bg-white/10' : 'hover:bg-white/5'} transition-colors`}
            >
              {isSidebarCollapsed ? (
                <Sparkles className="h-5 w-5" />
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  <span>Prompt</span>
                </>
              )}
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center justify-center py-4 flex-1 ${activeTab === 'templates' ? 'bg-white/10' : 'hover:bg-white/5'} transition-colors`}
            >
              {isSidebarCollapsed ? (
                <Grid className="h-5 w-5" />
              ) : (
                <>
                  <Grid className="h-5 w-5 mr-2" />
                  <span>Templates</span>
                </>
              )}
            </button>
            <button
              onClick={() => setActiveTab('adjust')}
              className={`flex items-center justify-center py-4 flex-1 ${activeTab === 'adjust' ? 'bg-white/10' : 'hover:bg-white/5'} transition-colors`}
            >
              {isSidebarCollapsed ? (
                <Sliders className="h-5 w-5" />
              ) : (
                <>
                  <Sliders className="h-5 w-5 mr-2" />
                  <span>Adjust</span>
                </>
              )}
            </button>
          </div>
          
          {/* Tab content */}
          <div className={`flex-1 p-4 ${isSidebarCollapsed ? 'hidden' : 'overflow-y-auto'}`}>
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Upload Image</h3>
                <div 
                  className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-banana transition-colors"
                  onClick={() => document.getElementById('imageUpload')?.click()}
                >
                  <Upload className="h-10 w-10 mx-auto text-white/50 mb-3" />
                  <p className="text-white/70">Drag & drop or click to upload</p>
                  <p className="text-white/50 text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
                  <input 
                    type="file" 
                    id="imageUpload" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Reference Images</h3>
                  <div 
                    className="border-2 border-dashed border-white/30 rounded-lg p-4 text-center cursor-pointer hover:border-banana transition-colors"
                    onClick={() => document.getElementById('referenceImageUpload')?.click()}
                  >
                    <p className="text-white/70 text-sm">Add reference images (optional)</p>
                    <input 
                      type="file" 
                      id="referenceImageUpload" 
                      className="hidden" 
                      accept="image/*" 
                      multiple 
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Export Options</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Aspect Ratio</label>
                      <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value as AspectRatioOption)}
                        className="w-full bg-white/5 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:border-banana"
                      >
                        <option value="original">Original</option>
                        <option value="1:1">1:1 (Square)</option>
                        <option value="16:9">16:9 (Landscape)</option>
                        <option value="9:16">9:16 (Portrait)</option>
                        <option value="4:3">4:3 (Classic)</option>
                        <option value="3:4">3:4 (Portrait)</option>
                      </select>
                    </div>
                    
                    <button 
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-banana text-gray-900 font-medium rounded-lg hover:bg-banana-light transition-colors disabled:opacity-50"
                      disabled={!generatedImage}
                    >
                      <Download className="h-5 w-5" />
                      Download Image
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'prompt' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">AI Prompt</h3>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe how you want to transform your image..."
                    className="w-full p-3 h-32 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-banana resize-none"
                  />
                </div>
                
                <button 
                  onClick={handlePromptSubmit}
                  disabled={!prompt.trim() || !primaryImage || isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-banana text-gray-900 font-medium rounded-lg hover:bg-banana-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      Generate Image
                    </>
                  )}
                </button>
                
                <div className="mt-6">
                  <h3 className="text-md font-medium flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-banana" />
                    Try these prompts
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Make it look like an oil painting",
                      "Add cyberpunk neon elements",
                      "Convert to watercolor style",
                      "Add dramatic lighting",
                      "Make it look vintage"
                    ].map((example, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(example)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-sm transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'templates' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Templates</h3>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.name)}
                      className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-banana transition-all group"
                    >
                      <div className="aspect-square bg-white/10 flex items-center justify-center">
                        {/* In a real app, show actual template thumbnails */}
                        <span className="text-white/70">{template.name}</span>
                      </div>
                      <div className="p-2 text-left">
                        <h4 className="text-sm font-medium truncate group-hover:text-banana transition-colors">{template.name}</h4>
                      </div>
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handleTemplateSelect("Surprise Me!")}
                  className="w-full mt-4 py-3 px-4 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-5 w-5 text-banana" />
                  Surprise Me!
                </button>
              </div>
            )}
            
            {activeTab === 'adjust' && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-banana" />
                  Adjustments
                </h3>
                
                {[
                  { name: 'brightness', label: 'Brightness', min: -100, max: 100 },
                  { name: 'contrast', label: 'Contrast', min: -100, max: 100 },
                  { name: 'saturation', label: 'Saturation', min: -100, max: 100 },
                  { name: 'sharpness', label: 'Sharpness', min: 0, max: 100 }
                ].map(adj => (
                  <div key={adj.name} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-white/80">{adj.label}</label>
                      <span className="text-xs text-white/60">{adjustments[adj.name]}</span>
                    </div>
                    <input
                      type="range"
                      min={adj.min}
                      max={adj.max}
                      value={adjustments[adj.name]}
                      onChange={(e) => handleAdjustmentChange(adj.name, parseInt(e.target.value))}
                      className="w-full accent-banana bg-white/10 h-2 rounded-full appearance-none"
                    />
                  </div>
                ))}
                
                <div className="pt-4">
                  <h3 className="text-md font-medium mb-3">Filters</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['Vintage', 'B&W', 'Sepia', 'Cool', 'Warm', 'Film'].map((filter, i) => (
                      <button
                        key={i}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-center transition-colors"
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 flex justify-center gap-4">
                  <button className="p-2 bg-white/10 hover:bg-white/15 rounded-full transition-colors">
                    <RotateCw className="h-5 w-5" />
                  </button>
                  <button className="p-2 bg-white/10 hover:bg-white/15 rounded-full transition-colors">
                    <Palette className="h-5 w-5" />
                  </button>
                  <button className="p-2 bg-white/10 hover:bg-white/15 rounded-full transition-colors">
                    <Layers className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
        
        {/* Main canvas area */}
        <main className="flex-1 overflow-hidden relative">
          {/* Canvas background with grid pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
          
          {/* Canvas content */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="relative max-w-full max-h-full">
              {isProcessing ? (
                <div className="backdrop-blur-md bg-black/30 rounded-xl p-8 border border-white/10 shadow-2xl">
                  <Loader2 className="h-16 w-16 animate-spin mx-auto text-banana mb-4" />
                  <p className="text-center text-white/80 text-lg">{loadingMessage}</p>
                </div>
              ) : generatedImage ? (
                <div className="relative group">
                  <img 
                    src={generatedImage.url} 
                    alt="Generated"
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-lg">
                    <button className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
                      <Download className="h-6 w-6" />
                    </button>
                    <button className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
                      <Share2 className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              ) : primaryImage ? (
                <img 
                  src={primaryImage.url} 
                  alt="Original"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-xl"
                />
              ) : (
                <div className="backdrop-blur-md bg-black/30 rounded-xl p-8 border border-white/10 shadow-2xl text-center">
                  <ImageIcon className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Image Selected</h3>
                  <p className="text-white/60 mb-6">Upload an image to get started with editing</p>
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className="px-6 py-3 bg-banana text-gray-900 font-medium rounded-lg hover:bg-banana-light transition-colors inline-flex items-center gap-2"
                  >
                    <Upload className="h-5 w-5" />
                    Upload Image
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}