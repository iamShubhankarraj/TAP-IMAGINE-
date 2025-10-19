'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Wand2, Upload, ChevronLeft, Download, 
  Zap, Layers, Palette, Image as ImageIcon, Home
} from 'lucide-react';

export default function EditorPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePanel, setActivePanel] = useState<'upload' | 'prompt' | 'adjust'>('upload');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setActivePanel('prompt');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsGenerating(false);
      setActivePanel('adjust');
    }, 3000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f]">
      {/* Ultra-premium animated background */}
      <div className="fixed inset-0 z-0">
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
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="group flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-banana to-yellow-400 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition duration-300" />
                <div className="relative p-2 bg-gradient-to-br from-banana to-yellow-400 rounded-xl">
                  <Home className="w-5 h-5 text-gray-900" />
                </div>
              </div>
              <span className="text-white font-bold text-lg">Back to Dashboard</span>
            </Link>

            <button className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-200 animate-gradient-x" />
              <div className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-banana to-yellow-400 rounded-xl font-bold text-gray-900">
                <Download className="w-5 h-5" />
                <span>Export</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex gap-6 px-6 pb-6 h-[calc(100vh-88px)]">
        {/* Left Sidebar - Tools */}
        <div className="w-80 space-y-4">
          {/* Upload Panel */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500 animate-gradient-x" />
            
            <div className="relative px-6 py-6 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg">Upload Image</h3>
              </div>

              <label className="relative group/upload cursor-pointer block">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="relative px-6 py-12 bg-white/5 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white/20 hover:border-purple-400 transition-all duration-300 group-hover/upload:bg-white/10">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center group-hover/upload:scale-110 transition-transform">
                      <ImageIcon className="w-8 h-8 text-white/60" />
                    </div>
                    <p className="text-white/80 font-medium">Click to upload</p>
                    <p className="text-white/50 text-sm">or drag and drop</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* AI Prompt Panel */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500 animate-gradient-x" />
            
            <div className="relative px-6 py-6 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg">AI Prompt</h3>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe how you want to transform your image..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 backdrop-blur-sm min-h-[120px] resize-none"
                  />
                  
                  <div className="absolute bottom-3 right-3">
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || !uploadedImage || isGenerating}
                  className="group/btn relative w-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl blur opacity-50 group-hover/btn:opacity-75 transition duration-200 animate-gradient-x" />
                  <div className="relative flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white transform group-hover/btn:scale-[1.02] transition-all duration-200">
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating Magic...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Generate</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500 animate-gradient-x" />
            
            <div className="relative px-6 py-6 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg">Quick Styles</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['Vintage', 'Cyberpunk', 'Oil Paint', 'Watercolor'].map((style, index) => (
                  <button
                    key={style}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-400 text-white text-sm font-medium transition-all duration-300 transform hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000 animate-gradient-x" />
          
          <div className="relative h-full px-8 py-8 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Canvas Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-xl">Creative Canvas</h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <span className="text-white/60 text-sm">1920 × 1080</span>
                </div>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="relative h-[calc(100%-80px)] bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              {uploadedImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Decorative corners */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-purple-400 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-400 rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-400 rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-purple-400 rounded-br-lg" />

                  {/* Image */}
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    style={{
                      filter: isGenerating ? 'blur(4px) brightness(0.8)' : 'none',
                      transition: 'filter 0.5s ease'
                    }}
                  />

                  {/* Generating Overlay */}
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-75 animate-pulse" />
                          <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-white animate-spin" />
                          </div>
                        </div>
                        <p className="text-white text-xl font-bold">AI is working its magic...</p>
                        <p className="text-white/60 text-sm">This might take a few moments</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse-slow" />
                      <div className="relative w-32 h-32 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-white/40" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white text-xl font-bold">Your Canvas Awaits</p>
                      <p className="text-white/60">Upload an image to start creating</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
