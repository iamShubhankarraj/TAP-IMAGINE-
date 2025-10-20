'use client';

import { useRef, useState, useEffect } from 'react';
import { X, Pencil, Eraser, Minus, Plus, RotateCcw, Sparkles, Send, Loader2, AlertCircle } from 'lucide-react';

interface SketchToolProps {
  imageUrl: string;
  onClose: () => void;
  onSketchComplete: (sketchedImage: string, prompt: string) => void;
}

type Tool = 'pencil' | 'eraser';

export default function SketchTool({ imageUrl, onClose, onSketchComplete }: SketchToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pencil');
  const [brushSize, setBrushSize] = useState(5);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initialize canvas with image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    
    // Handle both data URLs and regular URLs
    if (imageUrl.startsWith('data:')) {
      // Data URL - no CORS issues
      img.src = imageUrl;
    } else {
      // Regular URL - try with and without CORS
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
    }

    img.onload = () => {
      console.log('✅ Image loaded successfully:', {
        width: img.width,
        height: img.height,
        src: imageUrl.substring(0, 50) + '...'
      });
      
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);
      setIsLoading(false);
      setLoadError(null);
    };

    img.onerror = (error) => {
      console.error('❌ Failed to load image:', error);
      console.log('Image URL:', imageUrl);
      
      // Try without CORS as fallback
      const imgFallback = new Image();
      imgFallback.src = imageUrl; // No crossOrigin
      
      imgFallback.onload = () => {
        console.log('✅ Image loaded with fallback (no CORS)');
        canvas.width = imgFallback.width;
        canvas.height = imgFallback.height;
        ctx.drawImage(imgFallback, 0, 0);
        setIsLoading(false);
      };
      
      imgFallback.onerror = () => {
        console.error('❌ Fallback also failed');
        setIsLoading(false);
        setLoadError('Failed to load image. The image might be in an unsupported format.');
      };
    };
  }, [imageUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'pencil') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#FF0000'; // Red for visibility
      ctx.lineWidth = brushSize * scaleX; // Scale brush size to canvas
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2 * scaleX; // Scale eraser size to canvas
    }

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reload original image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas || !prompt.trim()) return;

    // Get the sketched image as base64
    const sketchedImage = canvas.toDataURL('image/png');
    onSketchComplete(sketchedImage, prompt.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-white/20 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sketch & Create with AI</h2>
              <p className="text-sm text-white/60">Draw your idea and let AI bring it to life</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center group"
          >
            <X className="w-5 h-5 text-white/70 group-hover:text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Canvas Area */}
            <div className="lg:col-span-2">
              <div className="relative bg-gray-800/50 rounded-xl border border-white/10 overflow-hidden">
                {isLoading ? (
                  <div className="w-full h-96 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                    <div className="text-white/60">Loading image...</div>
                    <div className="text-white/40 text-xs max-w-md text-center px-4">
                      Image URL: {imageUrl.substring(0, 60)}...
                    </div>
                  </div>
                ) : loadError ? (
                  <div className="w-full h-96 flex flex-col items-center justify-center gap-4 p-8">
                    <AlertCircle className="w-12 h-12 text-red-400" />
                    <div className="text-red-300 font-medium">Error Loading Image</div>
                    <div className="text-white/60 text-sm text-center max-w-md">{loadError}</div>
                    <button
                      onClick={onClose}
                      className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    >
                      Close & Try Again
                    </button>
                  </div>
                ) : (
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-auto cursor-crosshair"
                    style={{ maxHeight: '600px' }}
                  />
                )}
              </div>
            </div>

            {/* Controls Panel */}
            <div className="space-y-4">
              {/* Tool Selection */}
              <div className="bg-gray-800/50 rounded-xl border border-white/10 p-4">
                <label className="block text-white font-medium mb-3">Drawing Tool</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTool('pencil')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                      tool === 'pencil'
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Pencil className="w-4 h-4" />
                    <span className="text-sm font-medium">Pencil</span>
                  </button>
                  <button
                    onClick={() => setTool('eraser')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                      tool === 'eraser'
                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Eraser className="w-4 h-4" />
                    <span className="text-sm font-medium">Eraser</span>
                  </button>
                </div>
              </div>

              {/* Brush Size */}
              <div className="bg-gray-800/50 rounded-xl border border-white/10 p-4">
                <label className="block text-white font-medium mb-3">
                  Brush Size: {brushSize}px
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4 text-white" />
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${(brushSize / 50) * 100}%, rgba(255,255,255,0.1) ${(brushSize / 50) * 100}%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                  <button
                    onClick={() => setBrushSize(Math.min(50, brushSize + 1))}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
                {/* Brush preview */}
                <div className="mt-3 flex items-center justify-center">
                  <div 
                    className="rounded-full bg-purple-500"
                    style={{ 
                      width: `${Math.min(brushSize * 2, 100)}px`, 
                      height: `${Math.min(brushSize * 2, 100)}px` 
                    }}
                  />
                </div>
              </div>

              {/* Clear Button */}
              <button
                onClick={clearCanvas}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="font-medium">Clear Sketch</span>
              </button>

              {/* AI Prompt */}
              <div className="bg-gray-800/50 rounded-xl border border-white/10 p-4">
                <label className="block text-white font-medium mb-3">
                  Tell AI what to create
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Add a beautiful crow at the sketched location' or 'Create a realistic shark where I drew'"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                  rows={4}
                />
                <p className="text-xs text-white/50 mt-2">
                  💡 Describe what the AI should create where you sketched
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleSubmit}
                disabled={!prompt.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate with AI</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
