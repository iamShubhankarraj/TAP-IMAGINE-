'use client';

import { useState, useEffect } from 'react';
import { SlidersHorizontal, RotateCw, Palette } from 'lucide-react';

type Adjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
};

type QuickAdjustmentsProps = {
  initialAdjustments?: Partial<Adjustments>;
  onAdjustmentsChange: (adjustments: Adjustments) => void;
  imageUrl: string;
};

export default function QuickAdjustments({ 
  initialAdjustments = {}, 
  onAdjustmentsChange,
  imageUrl 
}: QuickAdjustmentsProps) {
  const [adjustments, setAdjustments] = useState<Adjustments>({
    brightness: initialAdjustments.brightness || 0,
    contrast: initialAdjustments.contrast || 0,
    saturation: initialAdjustments.saturation || 0,
    rotation: initialAdjustments.rotation || 0,
  });

  useEffect(() => {
    onAdjustmentsChange(adjustments);
  }, [adjustments]);

  const handleAdjustment = (key: keyof Adjustments, value: number) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setAdjustments({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      rotation: 0,
    });
  };

  const handleRotate = () => {
    setAdjustments(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const presets = [
    { name: 'Vivid', adjustments: { brightness: 10, contrast: 20, saturation: 30, rotation: 0 } },
    { name: 'Cool', adjustments: { brightness: 0, contrast: 10, saturation: -20, rotation: 0 } },
    { name: 'Warm', adjustments: { brightness: 5, contrast: 15, saturation: 25, rotation: 0 } },
    { name: 'B&W', adjustments: { brightness: 0, contrast: 25, saturation: -100, rotation: 0 } },
  ];

  const applyPreset = (preset: { name: string; adjustments: Adjustments }) => {
    setAdjustments(preset.adjustments);
  };

  const getFilterStyle = () => {
    return {
      filter: `brightness(${100 + adjustments.brightness}%) contrast(${100 + adjustments.contrast}%) saturate(${100 + adjustments.saturation}%)`,
      transform: `rotate(${adjustments.rotation}deg)`,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
          <SlidersHorizontal className="h-5 w-5 text-banana" />
          Quick Adjustments
        </h3>
        <button
          onClick={handleReset}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Preview */}
      <div className="relative aspect-video bg-black/30 rounded-lg overflow-hidden">
        <img 
          src={imageUrl} 
          alt="Preview"
          className="w-full h-full object-contain transition-all duration-200"
          style={getFilterStyle()}
        />
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white/80 flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Presets
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-banana rounded-lg text-xs font-medium text-white transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Adjustments */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white/80">Manual Adjustments</h4>
        
        {/* Brightness */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-sm text-white/70">Brightness</label>
            <span className="text-xs text-white/50">{adjustments.brightness}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.brightness}
            onChange={(e) => handleAdjustment('brightness', parseInt(e.target.value))}
            className="w-full accent-banana"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-sm text-white/70">Contrast</label>
            <span className="text-xs text-white/50">{adjustments.contrast}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.contrast}
            onChange={(e) => handleAdjustment('contrast', parseInt(e.target.value))}
            className="w-full accent-banana"
          />
        </div>

        {/* Saturation */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-sm text-white/70">Saturation</label>
            <span className="text-xs text-white/50">{adjustments.saturation}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.saturation}
            onChange={(e) => handleAdjustment('saturation', parseInt(e.target.value))}
            className="w-full accent-banana"
          />
        </div>
      </div>

      {/* Rotate Button */}
      <button
        onClick={handleRotate}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-sm font-medium text-white transition-colors"
      >
        <RotateCw className="h-4 w-4" />
        Rotate 90°
      </button>
    </div>
  );
}
