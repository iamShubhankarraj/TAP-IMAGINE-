// components/editor/adjustments/AdjustmentControls.tsx
'use client';

import React, { useState } from 'react';
import { ImageAdjustments, defaultAdjustments, Preset } from '@/types/adjustments';
import CoreAdjustments from './CoreAdjustments';
import DetailPanel from './DetailPanel';
import HSLPanel from './HSLPanel';
import ColorAdjustments from './ColorAdjustments';
import PresetsPanel from './PresetsPanel';
import { RotateCw, FlipHorizontal, FlipVertical, RefreshCw } from 'lucide-react';

interface AdjustmentControlsProps {
  adjustments: ImageAdjustments;
  onChange: (adjustments: ImageAdjustments) => void;
}

type AdjustmentTab = 'presets' | 'core' | 'color' | 'hsl' | 'detail';

export default function AdjustmentControls({ adjustments, onChange }: AdjustmentControlsProps) {
  const [activeTab, setActiveTab] = useState<AdjustmentTab>('presets');
  const [currentPresetId, setCurrentPresetId] = useState<string | null>(null);

  const handlePartialChange = (partial: Partial<ImageAdjustments>) => {
    onChange({ ...adjustments, ...partial });
  };

  const handlePresetApply = (preset: Preset) => {
    onChange({ ...adjustments, ...preset.adjustments });
    setCurrentPresetId(preset.id);
  };

  const handleReset = () => {
    onChange(defaultAdjustments);
    setCurrentPresetId(null);
  };

  const handleRotate = () => {
    const newRotation = (adjustments.rotation + 90) % 360;
    handlePartialChange({ rotation: newRotation });
  };

  const handleFlipHorizontal = () => {
    handlePartialChange({ flipHorizontal: !adjustments.flipHorizontal });
  };

  const handleFlipVertical = () => {
    handlePartialChange({ flipVertical: !adjustments.flipVertical });
  };

  const tabs = [
    { id: 'presets' as AdjustmentTab, label: 'Presets', icon: '✨' },
    { id: 'core' as AdjustmentTab, label: 'Basic', icon: '☀️' },
    { id: 'color' as AdjustmentTab, label: 'Color', icon: '🎨' },
    { id: 'hsl' as AdjustmentTab, label: 'HSL', icon: '🌈' },
    { id: 'detail' as AdjustmentTab, label: 'Detail', icon: '🔍' },
  ];

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Transform Controls */}
      <div className="flex gap-2">
        <button
          onClick={handleRotate}
          className="flex-1 p-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          title="Rotate 90°"
        >
          <RotateCw className="h-4 w-4" />
        </button>
        <button
          onClick={handleFlipHorizontal}
          className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm ${
            adjustments.flipHorizontal ? 'bg-banana text-gray-900' : 'bg-white/10 hover:bg-white/15'
          }`}
          title="Flip Horizontal"
        >
          <FlipHorizontal className="h-4 w-4" />
        </button>
        <button
          onClick={handleFlipVertical}
          className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm ${
            adjustments.flipVertical ? 'bg-banana text-gray-900' : 'bg-white/10 hover:bg-white/15'
          }`}
          title="Flip Vertical"
        >
          <FlipVertical className="h-4 w-4" />
        </button>
        <button
          onClick={handleReset}
          className="flex-1 p-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          title="Reset All"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-black/20 p-1 rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-banana text-gray-900 shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activeTab === 'presets' && (
          <PresetsPanel
            onApplyPreset={handlePresetApply}
            currentPresetId={currentPresetId ?? undefined}
          />
        )}
        {activeTab === 'core' && (
          <CoreAdjustments 
            adjustments={adjustments}
            onChange={handlePartialChange}
          />
        )}
        {activeTab === 'color' && (
          <ColorAdjustments 
            adjustments={adjustments}
            onChange={handlePartialChange}
          />
        )}
        {activeTab === 'hsl' && (
          <HSLPanel 
            adjustments={adjustments}
            onChange={handlePartialChange}
          />
        )}
        {activeTab === 'detail' && (
          <DetailPanel 
            adjustments={adjustments}
            onChange={handlePartialChange}
          />
        )}
      </div>
    </div>
  );
}