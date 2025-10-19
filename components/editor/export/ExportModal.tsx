// components/editor/export/ExportModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { ImageAdjustments } from '@/types/adjustments';
import { exportImage } from '@/lib/image-processing/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  adjustments: ImageAdjustments;
}

type AspectRatioOption = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | 'original';
type FormatOption = 'png' | 'jpeg' | 'webp';

export default function ExportModal({ isOpen, onClose, imageUrl, adjustments }: ExportModalProps) {
  const [format, setFormat] = useState<FormatOption>('jpeg');
  const [quality, setQuality] = useState(90);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('original');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !imageUrl) return null;

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const blob = await exportImage(imageUrl, adjustments, {
        format,
        quality: quality / 100,
        aspectRatio: aspectRatio === 'original' ? undefined : aspectRatio,
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tap-imagine-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Close modal after successful export
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    { value: 'jpeg' as FormatOption, label: 'JPEG', desc: 'Best for photos, smaller file size' },
    { value: 'png' as FormatOption, label: 'PNG', desc: 'Lossless, supports transparency' },
    { value: 'webp' as FormatOption, label: 'WebP', desc: 'Modern format, great quality' },
  ];

  const aspectRatioOptions = [
    { value: 'original' as AspectRatioOption, label: 'Original' },
    { value: '1:1' as AspectRatioOption, label: '1:1 (Square)' },
    { value: '16:9' as AspectRatioOption, label: '16:9 (Landscape)' },
    { value: '9:16' as AspectRatioOption, label: '9:16 (Portrait)' },
    { value: '4:3' as AspectRatioOption, label: '4:3 (Classic)' },
    { value: '3:4' as AspectRatioOption, label: '3:4 (Portrait)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl max-w-2xl w-full border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Download className="h-6 w-6 text-banana" />
            Export Image
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/90">Format</label>
            <div className="grid grid-cols-3 gap-3">
              {formatOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value)}
                  className={`
                    p-4 rounded-lg text-left transition-all
                    ${format === opt.value
                      ? 'bg-banana text-gray-900 ring-2 ring-banana shadow-lg'
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                    }
                  `}
                >
                  <div className="font-medium mb-1">{opt.label}</div>
                  <div className={`text-xs ${format === opt.value ? 'text-gray-700' : 'text-white/60'}`}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (for JPEG and WebP) */}
          {(format === 'jpeg' || format === 'webp') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/90">Quality</label>
                <span className="text-sm text-white/60 font-mono">{quality}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-banana
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-lg
                "
              />
              <div className="flex justify-between text-xs text-white/50">
                <span>Smaller file</span>
                <span>Best quality</span>
              </div>
            </div>
          )}

          {/* Aspect Ratio */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/90">Aspect Ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatioOption)}
              className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-banana focus:ring-2 focus:ring-banana/20"
            >
              {aspectRatioOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-gray-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/90">Preview</label>
            <div className="aspect-video bg-black/30 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 px-6 py-3 bg-banana hover:bg-banana-light text-gray-900 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Download Image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}