// components/editor/templates/TemplateCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { TemplateData } from '@/types/templates';
import { Sparkles } from 'lucide-react';

interface TemplateCardProps {
  template: TemplateData;
  onSelect: () => void;
  isSelected?: boolean;
}

export default function TemplateCard({ template, onSelect, isSelected }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        group relative bg-white/5 rounded-xl overflow-hidden
        transition-all duration-300 hover:scale-105
        ${isSelected 
          ? 'ring-2 ring-banana shadow-lg shadow-banana/20' 
          : 'border border-white/10 hover:border-banana/50'
        }
      `}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
        {template.thumbnail ? (
          <Image
            src={template.thumbnail}
            alt={template.name}
            fill
            className="object-cover"
            onError={(e) => {
              // Fallback to gradient if image fails
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-white/30" />
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white font-medium px-4 py-2 bg-banana/90 rounded-full">
            Apply Style
          </span>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-banana text-gray-900 rounded-full p-1">
            <Sparkles className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 text-left">
        <h4 className={`font-medium text-sm truncate transition-colors ${
          isSelected ? 'text-banana' : 'text-white group-hover:text-banana'
        }`}>
          {template.name}
        </h4>
        <p className="text-xs text-white/50 truncate mt-0.5">
          {template.description}
        </p>
      </div>
    </button>
  );
}