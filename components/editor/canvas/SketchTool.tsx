'use client';

import { useRef, useState, useEffect } from 'react';
import { X, Pencil, Eraser, Minus, Plus, RotateCcw, Sparkles, Send, Square, Circle, Triangle } from 'lucide-react';

interface SketchToolProps {
  imageUrl: string;
  onClose: () => void;
  onSketchComplete: (sketchedImage: string, prompt: string) => void;
}

type Tool = 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'triangle';
type Color = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'orange' | 'black' | 'white';

export default function SketchTool({ imageUrl, onClose, onSketchComplete }: SketchToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pencil');
  const [brushSize, setBrushSize] = useState(5);
  const [prompt, setPrompt] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [color, setColor] = useState<Color>('red');
  const [shapeStart, setShapeStart] = useState<{x: number, y: number} | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{x: number, y: number} | null>(null);

  // Color palette
  const colors: Color[] = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'black', 'white'];
  
  // Map color names to actual color values
  const colorMap: Record<Color, string> = {
    red: '#FF0000',
    blue: '#0000FF',
    green: '#00FF00',
    yellow: '#FFFF00',
    purple: '#800080',
    pink: '#FFC0CB',
    orange: '#FFA500',
    black: '#000000',
    white: '#FFFFFF'
  };

  // Initialize canvas with image - SAME AS LASSO TOOL
  useEffect(() => {
    console.log('🎨 SketchTool: Starting image load, URL:', imageUrl.substring(0, 100));
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('❌ Canvas ref not available');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('❌ Canvas context not available');
      return;
    }

    // Load image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    // Timeout fallback
    const timeoutId = setTimeout(() => {
      if (!imageRef.current) {
        console.log('⏰ Image load timeout, setting loaded anyway');
        setImageLoaded(true);
      }
    }, 5000);
    
    img.onload = () => {
      console.log('✅ Image loaded successfully!', {
        width: img.width,
        height: img.height
      });
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      imageRef.current = img;
      setImageLoaded(true);
      
      console.log('✅ Canvas updated, imageLoaded set to true');
      clearTimeout(timeoutId);
    };
    
    img.onerror = (error) => {
      console.error('❌ Image failed to load:', error);
      console.log('Failed URL:', imageUrl);
      clearTimeout(timeoutId);
      
      // Set loaded anyway to show canvas
      setImageLoaded(true);
    };
    
    img.src = imageUrl;
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [imageUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    if (tool === 'pencil' || tool === 'eraser') {
      setIsDrawing(true);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);

      if (tool === 'pencil') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = colorMap[color];
        ctx.lineWidth = brushSize * scaleX; // Scale brush size to canvas
      } else {
        // Proper eraser implementation
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = brushSize * scaleX * 2; // Make eraser slightly larger
      }
    } else {
      // For shape tools
      setIsDrawing(true);
      setShapeStart({ x, y });
      setCurrentPoint({ x, y });
    }
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

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      // For shape tools, we'll draw a preview
      setCurrentPoint({ x, y });
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setShapeStart(null);
    setCurrentPoint(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Redraw original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas || !prompt.trim()) return;

    // Get the sketched image as base64
    const sketchedImage = canvas.toDataURL('image/png');
    onSketchComplete(sketchedImage, prompt.trim());
  };

  // Redraw canvas when imageLoaded changes
  useEffect(() => {
    if (imageLoaded && imageRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(imageRef.current, 0, 0);
        console.log('🎨 Canvas redrawn with image');
      }
    }
  }, [imageLoaded]);

  // Draw shape preview during drawing
  useEffect(() => {
    if (!isDrawing || !shapeStart || !currentPoint || 
        (tool !== 'rectangle' && tool !== 'circle' && tool !== 'triangle')) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save the current context
    ctx.save();
    
    // Clear the preview by redrawing the image
    if (imageRef.current) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0);
    }
    
    // Draw the preview shape
    const width = currentPoint.x - shapeStart.x;
    const height = currentPoint.y - shapeStart.y;
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = colorMap[color];
    ctx.lineWidth = brushSize * (canvas.width / canvas.getBoundingClientRect().width);
    ctx.setLineDash([5, 5]); // Dashed line for preview
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (tool === 'rectangle') {
      ctx.strokeRect(shapeStart.x, shapeStart.y, width, height);
    } else if (tool === 'circle') {
      const centerX = (shapeStart.x + currentPoint.x) / 2;
      const centerY = (shapeStart.y + currentPoint.y) / 2;
      const radiusX = Math.abs(width) / 2;
      const radiusY = Math.abs(height) / 2;
      
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(shapeStart.x + width / 2, shapeStart.y); // Top point
      ctx.lineTo(shapeStart.x, shapeStart.y + height); // Bottom left
      ctx.lineTo(shapeStart.x + width, shapeStart.y + height); // Bottom right
      ctx.closePath();
      ctx.stroke();
    }
    
    // Restore the context
    ctx.restore();
  }, [isDrawing, shapeStart, currentPoint, tool, color, brushSize, colorMap]);

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
              <div className="relative bg-gray-800/50 rounded-xl border border-white/10 overflow-hidden min-h-[400px] flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-auto cursor-crosshair"
                  style={{ 
                    maxHeight: '600px',
                    display: imageLoaded ? 'block' : 'none'
                  }}
                />
                <div 
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ display: imageLoaded ? 'none' : 'flex' }}
                >
                  <div className="text-white/60 text-center">
                    <div className="mb-2">Loading image...</div>
                    <div className="text-xs text-white/40 max-w-xs truncate">{imageUrl.substring(0, 60)}...</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="space-y-4">
              {/* Tool Selection */}
              <div className="bg-gray-800/50 rounded-xl border border-white/10 p-4">
                <label className="block text-white font-medium mb-3">Drawing Tool</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTool('pencil')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      tool === 'pencil'
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Pencil className="w-4 h-4" />
                    <span className="text-xs font-medium">Pencil</span>
                  </button>
                  <button
                    onClick={() => setTool('eraser')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      tool === 'eraser'
                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Eraser className="w-4 h-4" />
                    <span className="text-xs font-medium">Eraser</span>
                  </button>
                  <button
                    onClick={() => setTool('rectangle')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      tool === 'rectangle'
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Square className="w-4 h-4" />
                    <span className="text-xs font-medium">Rect</span>
                  </button>
                  <button
                    onClick={() => setTool('circle')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      tool === 'circle'
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Circle className="w-4 h-4" />
                    <span className="text-xs font-medium">Circle</span>
                  </button>
                  <button
                    onClick={() => setTool('triangle')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      tool === 'triangle'
                        ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/50'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Triangle className="w-4 h-4" />
                    <span className="text-xs font-medium">Tri</span>
                  </button>
                </div>
              </div>

              {/* Color Palette */}
              <div className="bg-gray-800/50 rounded-xl border border-white/10 p-4">
                <label className="block text-white font-medium mb-3">Color Palette</label>
                <div className="grid grid-cols-9 gap-1">
                  {colors.map((colorOption) => (
                    <button
                      key={colorOption}
                      onClick={() => setColor(colorOption)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        color === colorOption
                          ? 'border-white scale-110 shadow-lg'
                          : 'border-white/30 hover:border-white/60'
                      }`}
                      style={{ backgroundColor: colorMap[colorOption] }}
                      title={colorOption.charAt(0).toUpperCase() + colorOption.slice(1)}
                    />
                  ))}
                </div>
                <div className="mt-2 text-center text-sm text-white/70">
                  Selected: <span className="capitalize font-medium">{color}</span>
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
                      background: `linear-gradient(to right, ${colorMap[color]} 0%, ${colorMap[color]} ${(brushSize / 50) * 100}%, rgba(255,255,255,0.1) ${(brushSize / 50) * 100}%, rgba(255,255,255,0.1) 100%)`
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
                    className="rounded-full"
                    style={{ 
                      width: `${Math.min(brushSize * 2, 100)}px`, 
                      height: `${Math.min(brushSize * 2, 100)}px`,
                      backgroundColor: colorMap[color]
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