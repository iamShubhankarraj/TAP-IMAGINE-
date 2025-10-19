// components/editor/adjustments/ColorAdjustments.tsx
'use client';

import React from 'react';
import { ImageAdjustments } from '@/types/adjustments';
import { Droplets } from 'lucide-react';

interface ColorAdjustmentsProps {
  adjustments: ImageAdjustments;
  onChange: (adjustments: Partial<ImageAdjustments>) => void;
}

export default function ColorAdjustments({ adjustments, onChange }: ColorAdjustmentsProps) {
  const handleColorGradingChange = (
    zone: 'shadows' | 'midtones' | 'highlights',
    property: 'hue' | 'saturation',
    value: number
  ) => {
    const newColorGrading = {
      ...adjustments.colorGrading,
      [zone]: {
        ...adjustments.colorGrading[zone],
        [property]: value,
      },
    };
    onChange({ colorGrading: newColorGrading });
  };

  const handleBalanceChange = (value: number) => {
    onChange({
      colorGrading: {
        ...adjustments.colorGrading,
        balance: value,
      },
    });
  };

  return (
    <div className="space-y-5">
      <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wide flex items-center gap-2">
        <Droplets className="h-4 w-4" />
        Color Grading
      </h4>

      {/* Shadows */}
      <div className="space-y-3 p-3 bg-black/20 rounded-lg border border-white/10">
        <h5 className="text-xs font-medium text-white/70 uppercase">Shadows</h5>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-white/70">Hue</label>
            <span className="text-sm text-white/60 font-mono">
              {adjustments.colorGrading.shadows.hue}
            </span>
          </div>
          <input
            type="range"
            min={-180}
            max={180}
            value={adjustments.colorGrading.shadows.hue}
            onChange={(e) => handleColorGradingChange('shadows', 'hue', Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-lg
            "
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-white/70">Saturation</label>
            <span className="text-sm text-white/60 font-mono">
              {adjustments.colorGrading.shadows.saturation}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={adjustments.colorGrading.shadows.saturation}
            onChange={(e) => handleColorGradingChange('shadows', 'saturation', Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-banana
              [&::-webkit-slider-thumb]:cursor-pointer
            "
          />
        </div>
      </div>

      {/* Midtones */}
      <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/10">
        <h5 className="text-xs font-medium text-white/70 uppercase">Midtones</h5>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-white/70">Hue</label>
            <span className="text-sm text-white/60 font-mono">
              {adjustments.colorGrading.midtones.hue}
            </span>
          </div>
          <input
            type="range"
            min={-180}
            max={180}
            value={adjustments.colorGrading.midtones.hue}
            onChange={(e) => handleColorGradingChange('midtones', 'hue', Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-lg
            "
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-white/70">Saturation</label>
            <span className="text-sm text-white/60 font-mono">
              {adjustments.colorGrading.midtones.saturation}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={adjustments.colorGrading.midtones.saturation}
            onChange={(e) => handleColorGradingChange('midtones', 'saturation', Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-banana
              [&::-webkit-slider-thumb]:cursor-pointer
            "
          />
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/10">
        <h5 className="text-xs font-medium text-white/70 uppercase">Highlights</h5>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-white/70">Hue</label>
            <span className="text-sm text-white/60 font-mono">
              {adjustments.colorGrading.highlights.hue}
            </span>
          </div>
          <input
            type="range"
            min={-180}
            max={180}
            value={adjustments.colorGrading.highlights.hue}
            onChange={(e) => handleColorGradingChange('highlights', 'hue', Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-lg
            "
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-white/70">Saturation</label>
            <span className="text-sm text-white/60 font-mono">
              {adjustments.colorGrading.highlights.saturation}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={adjustments.colorGrading.highlights.saturation}
            onChange={(e) => handleColorGradingChange('highlights', 'saturation', Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-banana
              [&::-webkit-slider-thumb]:cursor-pointer
            "
          />
        </div>
      </div>

      {/* Balance */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm text-white/70">Balance</label>
          <span className="text-sm text-white/60 font-mono">
            {adjustments.colorGrading.balance}
          </span>
        </div>
        <input
          type="range"
          min={-100}
          max={100}
          value={adjustments.colorGrading.balance}
          onChange={(e) => handleBalanceChange(Number(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-banana
            [&::-webkit-slider-thumb]:cursor-pointer
          "
        />
      </div>
    </div>
  );
}