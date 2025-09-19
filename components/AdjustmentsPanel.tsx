import React from 'react';
import type { ClientAdjustments } from '../types';
import { RotateIcon } from './Icons';

interface AdjustmentsPanelProps {
  adjustments: ClientAdjustments;
  setAdjustments: (adjustments: ClientAdjustments) => void;
}

const Slider: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}> = ({ label, value, onChange, min = 0, max = 200 }) => (
  <div>
    <label className="flex justify-between text-sm font-medium text-gray-400 mb-2">
      <span>{label}</span>
      <span className="text-gray-200">{value}</span>
    </label>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer custom-slider"
    />
  </div>
);

const filters = [
    { id: 'none', label: 'None' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'sepia', label: 'Sepia' },
    { id: 'grayscale', label: 'B&W' },
    { id: 'blur', label: 'Blur' },
    { id: 'invert', label: 'Invert' },
];

export const AdjustmentsPanel: React.FC<AdjustmentsPanelProps> = ({ adjustments, setAdjustments }) => {

  const handleRotate = () => {
    setAdjustments({
        ...adjustments,
        rotation: (adjustments.rotation + 90) % 360,
    });
  }

  const handleReset = () => {
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturate: 100,
      rotation: 0,
      filter: 'none',
    });
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-100 tracking-wider">Adjustments</h2>
       <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Filters</h3>
            <div className="grid grid-cols-3 gap-2">
                {filters.map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => setAdjustments({ ...adjustments, filter: id })}
                        className={`p-2 rounded-md text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A1A1C] focus:ring-sky-400 ${
                            adjustments.filter === id
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                                : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
      <div className="space-y-4">
        <Slider 
          label="Brightness" 
          value={adjustments.brightness} 
          onChange={(v) => setAdjustments({...adjustments, brightness: v})} 
        />
        <Slider 
          label="Contrast" 
          value={adjustments.contrast} 
          onChange={(v) => setAdjustments({...adjustments, contrast: v})} 
        />
        <Slider 
          label="Saturation" 
          value={adjustments.saturate} 
          onChange={(v) => setAdjustments({...adjustments, saturate: v})} 
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button 
            onClick={handleRotate}
            className="w-full flex items-center justify-center gap-2 p-2 bg-white/5 text-gray-200 font-semibold rounded-md hover:bg-white/10 transition-colors"
        >
            <RotateIcon className="w-5 h-5" />
            Rotate
        </button>
        <button 
            onClick={handleReset}
            className="w-full p-2 bg-white/5 text-gray-200 font-semibold rounded-md hover:bg-white/10 transition-colors"
        >
            Reset
        </button>
      </div>
    </div>
  );
};