// components/editor/adjustments/AdjustmentControls.tsx
'use client';

import { useState } from 'react';
import { 
  SunMedium, Moon, Contrast, Droplet, Maximize, 
  RotateCcw, RotateCw, RefreshCw, Palette, Grid3X3 
} from 'lucide-react';

type AdjustmentType = {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  icon: React.ReactNode;
};

type Filter = {
  name: string;
  label: string;
};

type AdjustmentControlsProps = {
  onAdjustmentChange: (adjustments: Record<string, number>) => void;
  onFilterChange?: (filter: string | null) => void;
  onRotate?: (degrees: number) => void;
  disabled?: boolean;
};

// Define all available adjustments
const adjustments: AdjustmentType[] = [
  { name: 'brightness', label: 'Brightness', min: -100, max: 100, step: 1, defaultValue: 0, icon: <SunMedium className="h-5 w-5" /> },
  { name: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1, defaultValue: 0, icon: <Contrast className="h-5 w-5" /> },
  { name: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1, defaultValue: 0, icon: <Droplet className="h-5 w-5" /> },
  { name: 'sharpness', label: 'Sharpness', min: 0, max: 100, step: 1, defaultValue: 0, icon: <Maximize className="h-5 w-5" /> },
];

// Define all available filters
const filters: Filter[] = [
  { name: 'none', label: 'None' },
  { name: 'vintage', label: 'Vintage' },
  { name: 'bw', label: 'B&W' },
  { name: 'sepia', label: 'Sepia' },
  { name: 'cool', label: 'Cool' },
  { name: 'warm', label: 'Warm' },
  { name: 'film', label: 'Film' },
];

export default function AdjustmentControls({ 
  onAdjustmentChange, 
  onFilterChange,
  onRotate,
  disabled = false 
}: AdjustmentControlsProps) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initialValues: Record<string, number> = {};
    adjustments.forEach((adj) => {
      initialValues[adj.name] = adj.defaultValue;
    });
    return initialValues;
  });
  
  const [rotation, setRotation] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleChange = (name: string, value: number) => {
    const newValues = { ...values, [name]: value };
    setValues(newValues);
    onAdjustmentChange(newValues);
  };

  const handleRotate = (direction: 'left' | 'right') => {
    const newRotation = direction === 'left' 
      ? (rotation - 90) % 360 
      : (rotation + 90) % 360;
      
    setRotation(newRotation);
    
    if (onRotate) {
      onRotate(newRotation);
    }
  };
  
  const handleFilterChange = (filterName: string) => {
    const newFilter = activeFilter === filterName ? null : filterName;
    setActiveFilter(newFilter);
    
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  const resetAdjustments = () => {
    const defaultValues: Record<string, number> = {};
    adjustments.forEach((adj) => {
      defaultValues[adj.name] = adj.defaultValue;
    });
    
    setValues(defaultValues);
    setRotation(0);
    setActiveFilter(null);
    
    onAdjustmentChange(defaultValues);
    
    if (onFilterChange) {
      onFilterChange(null);
    }
    
    if (onRotate) {
      onRotate(0);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white/90">Adjustments</h3>
        <button
          onClick={resetAdjustments}
          disabled={disabled}
          className="text-sm text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="space-y-5">
        {adjustments.map((adjustment) => (
          <div key={adjustment.name} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                {adjustment.icon}
                {adjustment.label}
              </label>
              <span className="text-xs text-white/60">{values[adjustment.name]}</span>
            </div>
            <input
              type="range"
              min={adjustment.min}
              max={adjustment.max}
              step={adjustment.step}
              value={values[adjustment.name]}
              onChange={(e) => handleChange(adjustment.name, parseInt(e.target.value))}
              disabled={disabled}
              className="w-full accent-banana bg-white/10 h-2 rounded-full appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        ))}
      </div>

      <div className="pt-2">
        <h3 className="text-md font-medium mb-3 text-white/90 flex items-center gap-2">
          <Palette className="h-5 w-5 text-banana" />
          Filters
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {filters.map((filter) => (
            <button
              key={filter.name}
              onClick={() => handleFilterChange(filter.name)}
              disabled={disabled}
              className={`
                p-2 rounded-lg text-sm text-center transition-colors
                ${activeFilter === filter.name 
                  ? 'bg-banana/20 text-banana border border-banana/30' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-transparent'}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 flex justify-center gap-6">
        <button 
          onClick={() => handleRotate('left')}
          disabled={disabled}
          className="p-2.5 bg-white/10 hover:bg-white/15 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Rotate left 90°"
        >
          <RotateCcw className="h-5 w-5 text-white/80" />
        </button>
        <button
          onClick={() => handleRotate('right')}
          disabled={disabled}
          className="p-2.5 bg-white/10 hover:bg-white/15 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Rotate right 90°"
        >
          <RotateCw className="h-5 w-5 text-white/80" />
        </button>
        <button
          onClick={resetAdjustments}
          disabled={disabled}
          className="p-2.5 bg-white/10 hover:bg-white/15 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Reset all adjustments"
        >
          <Grid3X3 className="h-5 w-5 text-white/80" />
        </button>
      </div>
    </div>
  );
}