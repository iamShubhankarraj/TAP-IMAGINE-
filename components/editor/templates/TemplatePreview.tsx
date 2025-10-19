// components/editor/templates/TemplatePreview.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { TemplateData } from '@/types/templates';
import { X, Wand2, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface TemplatePreviewProps {
  template: TemplateData;
  previewImage?: string; // User's uploaded image
  onApply: () => void;
  onClose: () => void;
}

export default function TemplatePreview({ 
  template, 
  previewImage, 
  onApply, 
  onClose 
}: TemplatePreviewProps) {
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-2xl font-bold text-white">{template.name}</h3>
            <p className="text-white/70 mt-1">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original */}
          {previewImage && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white/70">Original</h4>
              <div className="aspect-square bg-black/30 rounded-lg overflow-hidden border border-white/10">
                <img 
                  src={previewImage} 
                  alt="Original" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Template Example */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white/70">Template Style</h4>
            <div className="aspect-square bg-black/30 rounded-lg overflow-hidden border border-white/10 relative">
              {template.thumbnail ? (
                <Image 
                  src={template.thumbnail} 
                  alt={template.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Wand2 className="h-16 w-16 text-white/30" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Template Details */}
        <div className="px-6 pb-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-sm font-medium text-white mb-2">AI Prompt</h4>
            <p className="text-white/70 text-sm">{template.prompt}</p>
          </div>
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag, i) => (
                <span 
                  key={i}
                  className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setIsGeneratingPreview(true);
              onApply();
            }}
            disabled={isGeneratingPreview}
            className="flex-1 px-6 py-3 bg-banana hover:bg-banana-light text-gray-900 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGeneratingPreview ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                Apply Template
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}