// components/editor/adjustments/HSLPanel.tsx
'use client';

import React, { useState } from 'react';
import { ImageAdjustments, HSLAdjustments } from '@/types/adjustments';
import { Palette } from 'lucide-react';

interface HSLPanelProps {
  adjustments: ImageAdjustments;
  onChange: (adjustments: Partial<ImageAdjustments>) => void;
}

type ColorChannel = keyof HSLAdjustments;

const COLOR_CHANNELS: { id: ColorChannel; label: string; color: string }[] = [
  { id: 'red', label: 'Red', color: '#ef4444' },
  { id: 'orange', label: 'Orange', color: '#f97316' },
  { id: 'yellow', label: 'Yellow', color: '#eab308' },
  { id: 'green', label: 'Green', color: '#22c55e' },
  { id: 'aqua', label: 'Aqua', color: '#06b6d4' },
  { id: 'blue', label: 'Blue', color: '#3b82f6' },
  { id: 'purple', label: 'Purple', color: '#a855f7' },
  { id: 'magenta', label: 'Magenta', color: '#ec4899' },
];

export default function HSLPanel({ adjustments, onChange }: HSLPanelProps) {
  const [selectedColor, setSelectedColor] = useState<ColorChannel>('red');

  const handleHSLChange = (
    color: ColorChannel,
    property: 'hue' | 'saturation' | 'luminance',
    value: number
  ) => {
    const newHSL = {
      ...adjustments.hsl,
      [color]: {
        ...adjustments.hsl[color],
        [property]: value,
      },
    };
    onChange({ hsl: newHSL });
  };

  const currentColor = adjustments.hsl[selectedColor];

  return (
    <div className="space-y-5">
      <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wide flex items-center gap-2">
        <Palette className="h-4 w-4" />
        HSL Color Mixer
      </h4>

      {/* Color Channel Selector */}
      <div className="grid grid-cols-4 gap-2">
        {COLOR_CHANNELS.map((channel) => (
          <button
            key={channel.id}
            onClick={() => setSelectedColor(channel.id)}
            className={`
              p-2 rounded-lg text-xs font-medium transition-all
              ${selectedColor === channel.id
                ? 'bg-white/20 ring-2 ring-white/40 shadow-lg'
                : 'bg-white/5 hover:bg-white/10'
              }
            `}
            style={{
              color: selectedColor === channel.id ? channel.color : '#fff',
            }}
          >
            {channel.label}
          </button>
        ))}
      </div>

      {/* HSL Controls for Selected Color */}
      <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: COLOR_CHANNELS.find(c => c.id === selectedColor)?.color }}
          />
          <span className="text-sm font-medium text-white">
            {COLOR_CHANNELS.find(c => c.id === selectedColor)?.label}
          </span>
        </div>

        {/* Hue */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-white/70">Hue</label>
            <span className="text-sm text-white/60 font-mono">{currentColor.hue}</span>
          </div>
          <input
            type="range"
            min={-100}
            max={100}
            value={currentColor.hue}
            onChange={(e) => handleHSLChange(selectedColor, 'hue', Number(e.target.value))}
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

        {/* Saturation */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-white/70">Saturation</label>
            <span className="text-sm text-white/60 font-mono">{currentColor.saturation}</span>
          </div>
          <input
            type="range"
            min={-100}
            max={100}
            value={currentColor.saturation}
            onChange={(e) => handleHSLChange(selectedColor, 'saturation', Number(e.target.value))}
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

        {/* Luminance */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-white/70">Luminance</label>
            <span className="text-sm text-white/60 font-mono">{currentColor.luminance}</span>
          </div>
          <input
            type="range"
            min={-100}
            max={100}
            value={currentColor.luminance}
            onChange={(e) => handleHSLChange(selectedColor, 'luminance', Number(e.target.value))}
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
    </div>
  );
}