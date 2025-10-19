// components/editor/adjustments/CoreAdjustments.tsx
'use client';

import React from 'react';
import { ImageAdjustments } from '@/types/adjustments';
import { Sun, Moon, Contrast as ContrastIcon, Droplet, Thermometer } from 'lucide-react';

interface CoreAdjustmentsProps {
  adjustments: ImageAdjustments;
  onChange: (adjustments: Partial<ImageAdjustments>) => void;
}

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  icon?: React.ReactNode;
}

function SliderControl({ label, value, onChange, min = -100, max = 100, step = 1, icon }: SliderControlProps) {
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
        step={step}
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
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-banana
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:cursor-pointer
          [&::-moz-range-thumb]:shadow-lg
        "
      />
    </div>
  );
}

export default function CoreAdjustments({ adjustments, onChange }: CoreAdjustmentsProps) {
  return (
    <div className="space-y-5">
      <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wide">
        Core Adjustments
      </h4>

      <SliderControl
        label="Exposure"
        value={adjustments.exposure}
        onChange={(exposure) => onChange({ exposure })}
        icon={<Sun className="h-4 w-4" />}
      />

      <SliderControl
        label="Contrast"
        value={adjustments.contrast}
        onChange={(contrast) => onChange({ contrast })}
        icon={<ContrastIcon className="h-4 w-4" />}
      />

      <SliderControl
        label="Highlights"
        value={adjustments.highlights}
        onChange={(highlights) => onChange({ highlights })}
      />

      <SliderControl
        label="Shadows"
        value={adjustments.shadows}
        onChange={(shadows) => onChange({ shadows })}
        icon={<Moon className="h-4 w-4" />}
      />

      <SliderControl
        label="Whites"
        value={adjustments.whites}
        onChange={(whites) => onChange({ whites })}
      />

      <SliderControl
        label="Blacks"
        value={adjustments.blacks}
        onChange={(blacks) => onChange({ blacks })}
      />

      <SliderControl
        label="Brightness"
        value={adjustments.brightness}
        onChange={(brightness) => onChange({ brightness })}
      />

      <div className="pt-3 border-t border-white/10">
        <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wide mb-4">
          Color
        </h4>

        <SliderControl
          label="Saturation"
          value={adjustments.saturation}
          onChange={(saturation) => onChange({ saturation })}
          icon={<Droplet className="h-4 w-4" />}
        />

        <SliderControl
          label="Vibrance"
          value={adjustments.vibrance}
          onChange={(vibrance) => onChange({ vibrance })}
        />

        <SliderControl
          label="Temperature"
          value={adjustments.temperature}
          onChange={(temperature) => onChange({ temperature })}
          icon={<Thermometer className="h-4 w-4" />}
        />

        <SliderControl
          label="Tint"
          value={adjustments.tint}
          onChange={(tint) => onChange({ tint })}
        />
      </div>
    </div>
  );
}