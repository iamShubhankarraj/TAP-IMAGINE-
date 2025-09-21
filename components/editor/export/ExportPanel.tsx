// components/editor/export/ExportPanel.tsx
'use client';

import { useState } from 'react';
import { useImageStore } from '@/context/image-store';
import { Download, Share2, Copy, Check, ArrowRight, FileText } from 'lucide-react';
import { dataURLtoBlob, createDownloadLink } from '@/services/ai-processing/nano-banana';

type ExportFormat = 'png' | 'jpg' | 'webp';
type ExportQuality = 'high' | 'medium' | 'low';
type AspectRatio = 'original' | '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

type ExportPanelProps = {
  onClose?: () => void;
  disabled?: boolean;
};

export default function ExportPanel({ onClose, disabled = false }: ExportPanelProps) {
  const { generatedImage } = useImageStore();
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState<ExportQuality>('high');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('original');
  const [filename, setFilename] = useState('tap-imagine-export');
  const [copied, setCopied] = useState(false);
  
  // Handle download
  const handleDownload = () => {
    if (!generatedImage) return;
    
    // In a real implementation, you would apply the format, quality, and aspect ratio
    // This simplified version just downloads the current image
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const downloadFilename = `${filename || 'tap-imagine'}-${timestamp}.${format}`;
    
    createDownloadLink(generatedImage.url, downloadFilename);
  };
  
  // Handle copy to clipboard
  const handleCopy = async () => {
    if (!generatedImage) return;
    
    try {
      const blob = dataURLtoBlob(generatedImage.url);
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy image:', err);
      alert('Failed to copy image to clipboard');
    }
  };
  
  // Handle share
  const handleShare = async () => {
    if (!generatedImage || !navigator.share) return;
    
    try {
      const blob = dataURLtoBlob(generatedImage.url);
      const file = new File([blob], `${filename || 'tap-imagine'}.${format}`, { type: blob.type });
      
      await navigator.share({
        title: 'TAP[IMAGINE] Creation',
        text: 'Check out this image I created with TAP[IMAGINE]!',
        files: [file]
      });
    } catch (err) {
      console.error('Failed to share image:', err);
      // User likely canceled share operation
    }
  };

  return (
    <div className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-5 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Export Image</h3>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {!generatedImage ? (
        <div className="text-center py-8">
          <p className="text-white/70">No image available to export</p>
          <p className="text-white/50 text-sm mt-2">Generate an image first</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <label className="block text-white/80 text-sm mb-2">Filename</label>
            <div className="flex items-center">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="flex-1 p-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-banana"
                placeholder="Enter filename"
                disabled={disabled}
              />
              <span className="ml-2 text-white/50">.{format}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-white/80 text-sm mb-2">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {(['png', 'jpg', 'webp'] as ExportFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  disabled={disabled}
                  className={`
                    p-2 rounded-lg text-center transition-colors
                    ${format === fmt 
                      ? 'bg-banana/20 text-banana border border-banana/30' 
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-transparent'}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  .{fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-white/80 text-sm mb-2">Quality</label>
            <div className="grid grid-cols-3 gap-2">
              {(['high', 'medium', 'low'] as ExportQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  disabled={disabled || format === 'png'} // PNG is lossless
                  className={`
                    p-2 rounded-lg text-center transition-colors
                    ${quality === q 
                      ? 'bg-banana/20 text-banana border border-banana/30' 
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-transparent'}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {q.charAt(0).toUpperCase() + q.slice(1)}
                </button>
              ))}
            </div>
            {format === 'png' && (
              <p className="text-white/50 text-xs mt-1">PNG is lossless and always high quality</p>
            )}
          </div>
          
          <div>
            <label className="block text-white/80 text-sm mb-2">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {(['original', '1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  disabled={disabled}
                  className={`
                    p-2 rounded-lg text-center transition-colors
                    ${aspectRatio === ratio 
                      ? 'bg-banana/20 text-banana border border-banana/30' 
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-transparent'}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {ratio === 'original' ? 'Original' : ratio}
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-4 grid grid-cols-3 gap-3">
            <button
              onClick={handleDownload}
              disabled={disabled || !generatedImage}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-banana text-gray-900 font-medium rounded-lg hover:bg-banana-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-6 w-6" />
              <span>Download</span>
            </button>
            
            <button
              onClick={handleCopy}
              disabled={disabled || !generatedImage}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            
            <button
              onClick={handleShare}
              disabled={disabled || !generatedImage || !navigator.canShare}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="h-6 w-6" />
              <span>Share</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}