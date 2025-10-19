// components/editor/adjustments/PresetsPanel.tsx
'use client';

import React, { useState } from 'react';
import { Preset } from '@/types/adjustments';
import { PRESETS, PRESET_CATEGORIES } from '@/lib/constants/presets';
import { Wand2, Check } from 'lucide-react';

interface PresetsPanelProps {
  onApplyPreset: (preset: Preset) => void;
  currentPresetId?: string;
}

export default function PresetsPanel({ onApplyPreset, currentPresetId }: PresetsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('cinema');

  const filteredPresets = PRESETS.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wide flex items-center gap-2">
        <Wand2 className="h-4 w-4" />
        Presets
      </h4>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {PRESET_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${selectedCategory === cat.id
                ? 'bg-banana text-gray-900'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
              }
            `}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Presets List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredPresets.map(preset => (
          <button
            key={preset.id}
            onClick={() => onApplyPreset(preset)}
            className={`
              w-full p-3 rounded-lg text-left transition-all
              ${currentPresetId === preset.id
                ? 'bg-banana/20 border-2 border-banana'
                : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-banana/50'
              }
            `}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h5 className={`text-sm font-medium ${
                    currentPresetId === preset.id ? 'text-banana' : 'text-white'
                  }`}>
                    {preset.name}
                  </h5>
                  {currentPresetId === preset.id && (
                    <Check className="h-4 w-4 text-banana" />
                  )}
                </div>
                <p className="text-xs text-white/60 mt-1">{preset.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <p className="text-xs text-blue-200">
          💡 Presets apply multiple adjustments at once. You can fine-tune them after applying.
        </p>
      </div>
    </div>
  );
}