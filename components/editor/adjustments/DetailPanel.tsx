// components/editor/adjustments/DetailPanel.tsx
'use client';

import React from 'react';
import { ImageAdjustments } from '@/types/adjustments';
import { Sparkles, Focus, Wind, Brain as GrainIcon } from 'lucide-react';

interface DetailPanelProps {
  adjustments: ImageAdjustments;
  onChange: (adjustments: Partial<ImageAdjustments>) => void;
}

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  icon?: React.ReactNode;
}

function SliderControl({ label, value, onChange, min = -100, max = 100, icon }: SliderControlProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-white/80 flex items-center gap-2">
          {icon}
          {label}
        </label>
        <span className="text-sm text-white/60 font-mono min-w-[3rem] text-right">
          {value > 0 ? '+' : ''}{value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-banana
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-lg
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-banana
          [&::-moz-range-thumb]:border-0
        "
      />
    </div>
  );
}

export default function DetailPanel({ adjustments, onChange }: DetailPanelProps) {
  return (
    <div className="space-y-5">
      <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wide">
        Detail & Optics
      </h4>

      <SliderControl
        label="Texture"
        value={adjustments.texture}
        onChange={(texture) => onChange({ texture })}
        icon={<Sparkles className="h-4 w-4" />}
      />

      <SliderControl
        label="Clarity"
        value={adjustments.clarity}
        onChange={(clarity) => onChange({ clarity })}
        icon={<Focus className="h-4 w-4" />}
      />

      <SliderControl
        label="Dehaze"
        value={adjustments.dehaze}
        onChange={(dehaze) => onChange({ dehaze })}
        icon={<Wind className="h-4 w-4" />}
      />

      <SliderControl
        label="Sharpness"
        value={adjustments.sharpness}
        onChange={(sharpness) => onChange({ sharpness })}
        min={0}
        max={100}
      />

      <SliderControl
        label="Noise Reduction"
        value={adjustments.noiseReduction}
        onChange={(noiseReduction) => onChange({ noiseReduction })}
        min={0}
        max={100}
      />

      <SliderControl
        label="Grain"
        value={adjustments.grain}
        onChange={(grain) => onChange({ grain })}
        min={0}
        max={100}
        icon={<GrainIcon className="h-4 w-4" />}
      />

      <div className="pt-3 border-t border-white/10">
        <SliderControl
          label="Vignette"
          value={adjustments.vignette}
          onChange={(vignette) => onChange({ vignette })}
        />

        <SliderControl
          label="Vignette Roundness"
          value={adjustments.vignetteRoundness}
          onChange={(vignetteRoundness) => onChange({ vignetteRoundness })}
          min={0}
          max={100}
        />
      </div>
    </div>
  );
}