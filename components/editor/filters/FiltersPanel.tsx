// components/editor/filters/FiltersPanel.tsx
'use client';

import React from 'react';
import { FILTERS } from '@/lib/constants/filters';
import { Palette, Check } from 'lucide-react';

interface FiltersPanelProps {
  currentFilter: string | null;
  onFilterChange: (filterId: string) => void;
  previewImage?: string;
}

export default function FiltersPanel({ currentFilter, onFilterChange, previewImage }: FiltersPanelProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wide flex items-center gap-2">
        <Palette className="h-4 w-4" />
        Filters
      </h4>

      {/* Filters Grid */}
      <div className="grid grid-cols-3 gap-3">
        {FILTERS.map(filter => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              relative group rounded-lg overflow-hidden transition-all
              ${currentFilter === filter.id
                ? 'ring-2 ring-banana shadow-lg'
                : 'ring-1 ring-white/10 hover:ring-banana/50'
              }
            `}
          >
            {/* Filter Preview */}
            <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-900 relative overflow-hidden">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt={filter.name}
                  className="w-full h-full object-cover"
                  style={{ filter: filter.cssFilter }}
                />
              ) : (
                <div 
                  className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500"
                  style={{ filter: filter.cssFilter }}
                />
              )}

              {/* Selected Indicator */}
              {currentFilter === filter.id && (
                <div className="absolute top-1 right-1 bg-banana text-gray-900 rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium">Apply</span>
              </div>
            </div>

            {/* Filter Name */}
            <div className="p-2 bg-black/40">
              <p className={`text-xs font-medium text-center ${
                currentFilter === filter.id ? 'text-banana' : 'text-white/80'
              }`}>
                {filter.name}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}