'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor } from '@/context/EditorContext';
import Link from 'next/link';
import { 
  Download, ArrowLeft, Check, Sparkles, Image as ImageIcon,
  FileImage, Zap, Maximize2, Crop
} from 'lucide-react';
import { generateCSSFilter } from '@/lib/image-processing/adjustments';

export default function ExportPage() {
  const router = useRouter();
  const { 
    primaryImage, 
    generatedImage, 
    adjustments, 
    currentFilter,
    getDisplayImage 
  } = useEditor();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [quality, setQuality] = useState(90);
  const [aspectRatio, setAspectRatio] = useState<string>('original');
  const [size, setSize] = useState<string>('original');
  const [isExporting, setIsExporting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const displayImage = getDisplayImage();
  const cssFilter = generateCSSFilter(adjustments, currentFilter || undefined);

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
  
  // Redirect if no image
  useEffect(() => {
    if (!displayImage) {
      router.push('/editor');
    }
  }, [displayImage, router]);

  const handleExport = async () => {
    if (!displayImage || !canvasRef.current) return;
    
    setIsExporting(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = displayImage.url;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Apply CSS filter
      ctx.filter = cssFilter;
      ctx.drawImage(img, 0, 0);
      
      // Convert to blob and download
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${displayImage.name}.${format}`;
            a.click();
            URL.revokeObjectURL(url);
          }
          setIsExporting(false);
        },
        `image/${format}`,
        quality / 100
      );
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      alert('Export failed. Please try again.');
    }
  };

  const formatOptions = [
    { 
      value: 'jpeg', 
      label: 'JPEG', 
      icon: FileImage,
      desc: 'Perfect for photos',
      detail: 'Smaller file size, great for web'
    },
    { 
      value: 'png', 
      label: 'PNG', 
      icon: ImageIcon,
      desc: 'Lossless quality',
      detail: 'Supports transparency'
    },
    { 
      value: 'webp', 
      label: 'WebP', 
      icon: Sparkles,
      desc: 'Modern format',
      detail: 'Best quality-to-size ratio'
    },
  ];

  const sizeOptions = [
    { value: 'original', label: 'Original Size', pixels: 'Keep original' },
    { value: '4k', label: '4K Ultra HD', pixels: '3840 × 2160' },
    { value: '1080p', label: 'Full HD', pixels: '1920 × 1080' },
    { value: '720p', label: 'HD Ready', pixels: '1280 × 720' },
    { value: 'instagram', label: 'Instagram', pixels: '1080 × 1080' },
  ];

  const aspectRatios = [
    { value: 'original', label: 'Original' },
    { value: '1:1', label: '1:1', desc: 'Square' },
    { value: '16:9', label: '16:9', desc: 'Landscape' },
    { value: '9:16', label: '9:16', desc: 'Portrait' },
    { value: '4:3', label: '4:3', desc: 'Classic' },
    { value: '21:9', label: '21:9', desc: 'Ultrawide' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f]">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute top-0 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/20 via-fuchsia-500/10 to-transparent rounded-full blur-[120px] animate-float"
          style={{
            transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute -bottom-1/4 -right-1/4 w-[900px] h-[900px] bg-gradient-to-tr from-blue-500/20 via-cyan-500/10 to-transparent rounded-full blur-[120px] animate-float-delayed"
          style={{
            transform: `translate(${mousePos.x * -0.03}px, ${mousePos.y * -0.02}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/10 backdrop-blur-xl bg-white/5">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Link href="/editor" className="group flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition duration-300" />
                <div className="relative p-2 bg-white/10 rounded-full border border-white/20">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-white font-semibold">Back to Editor</span>
            </Link>

            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-banana to-yellow-400 rounded-full blur-lg opacity-50" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-banana to-yellow-400 rounded-full flex items-center justify-center">
                  <Download className="w-5 h-5 text-gray-900" />
                </div>
              </div>
              Export Your Masterpiece
            </h1>

            <div className="w-32" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 px-6 py-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Preview */}
            <div className="space-y-6 animate-fade-in-up">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000 animate-gradient-x" />
                
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl border border-white/20 shadow-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-banana" />
                    Preview
                  </h3>
                  
                  <div className="aspect-video bg-black/30 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center relative">
                    {displayImage ? (
                      <img 
                        src={displayImage.url}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                        style={{ filter: cssFilter }}
                      />
                    ) : (
                      <div className="text-white/40 text-center p-8">
                        <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                        <p>No image to export</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Hidden canvas for export */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Image Info */}
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-white/50 text-xs mb-1">Format</p>
                      <p className="text-white font-semibold uppercase">{format}</p>
                    </div>
                    <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-white/50 text-xs mb-1">Quality</p>
                      <p className="text-white font-semibold">{quality}%</p>
                    </div>
                    <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-white/50 text-xs mb-1">Size</p>
                      <p className="text-white font-semibold text-sm">~2.4 MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Settings */}
            <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              {/* Format Selection */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl border border-white/20 shadow-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FileImage className="w-5 h-5 text-banana" />
                    File Format
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {formatOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFormat(opt.value as any)}
                        className={`relative p-4 rounded-2xl transition-all duration-300 group/btn ${
                          format === opt.value
                            ? 'bg-gradient-to-br from-banana/20 to-yellow-400/10 border-2 border-banana shadow-lg shadow-banana/20'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        {format === opt.value && (
                          <div className="absolute top-2 right-2">
                            <div className="w-5 h-5 bg-banana rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-gray-900" />
                            </div>
                          </div>
                        )}
                        
                        <opt.icon className={`w-8 h-8 mx-auto mb-2 ${
                          format === opt.value ? 'text-banana' : 'text-white/60'
                        }`} />
                        <p className={`font-bold text-sm mb-1 ${
                          format === opt.value ? 'text-white' : 'text-white/80'
                        }`}>{opt.label}</p>
                        <p className="text-xs text-white/50">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quality Slider */}
              {(format === 'jpeg' || format === 'webp') && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-teal-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                  
                  <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl border border-white/20 shadow-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-banana" />
                        Quality
                      </h3>
                      <span className="text-2xl font-bold text-banana">{quality}%</span>
                    </div>
                    
                    <input
                      type="range"
                      min={60}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-6
                        [&::-webkit-slider-thumb]:h-6
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-gradient-to-r
                        [&::-webkit-slider-thumb]:from-banana
                        [&::-webkit-slider-thumb]:to-yellow-400
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:shadow-banana/50
                        [&::-webkit-slider-thumb]:border-2
                        [&::-webkit-slider-thumb]:border-white
                      "
                    />
                    <div className="flex justify-between text-xs text-white/50 mt-2">
                      <span>Smaller file</span>
                      <span>Best quality</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-red-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl border border-white/20 shadow-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Maximize2 className="w-5 h-5 text-banana" />
                    Output Size
                  </h3>
                  
                  <div className="space-y-2">
                    {sizeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSize(opt.value)}
                        className={`w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between ${
                          size === opt.value
                            ? 'bg-gradient-to-r from-banana/20 to-yellow-400/10 border-2 border-banana shadow-lg'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-left">
                          <p className={`font-semibold ${size === opt.value ? 'text-white' : 'text-white/80'}`}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-white/50">{opt.pixels}</p>
                        </div>
                        {size === opt.value && (
                          <div className="w-5 h-5 bg-banana rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-gray-900" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl border border-white/20 shadow-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Crop className="w-5 h-5 text-banana" />
                    Aspect Ratio
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {aspectRatios.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setAspectRatio(opt.value)}
                        className={`relative p-4 rounded-xl transition-all duration-300 ${
                          aspectRatio === opt.value
                            ? 'bg-gradient-to-br from-banana/20 to-yellow-400/10 border-2 border-banana shadow-lg'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <p className={`font-bold ${aspectRatio === opt.value ? 'text-white' : 'text-white/80'}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-white/50">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="relative group w-full overflow-hidden rounded-2xl p-1"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-200 animate-gradient-x" />
                <div className="relative flex items-center justify-center gap-3 px-8 py-6 bg-gradient-to-r from-banana to-yellow-400 rounded-xl font-bold text-xl text-gray-900 transform group-hover:scale-[1.02] transition-all duration-200">
                  {isExporting ? (
                    <>
                      <div className="w-6 h-6 border-3 border-gray-900 border-t-transparent rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      Download Image
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
