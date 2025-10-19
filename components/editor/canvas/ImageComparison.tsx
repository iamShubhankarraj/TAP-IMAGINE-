// components/editor/canvas/ImageComparison.tsx
'use client';

import React, { useState } from 'react';
import { ImageAdjustments } from '@/types/adjustments';
import { generateCSSFilter } from '@/lib/image-processing/adjustments';
import { Eye, EyeOff } from 'lucide-react';

interface ImageComparisonProps {
  originalUrl: string;
  editedUrl?: string;
  adjustments: ImageAdjustments;
  filter?: string;
}

export default function ImageComparison({ 
  originalUrl, 
  editedUrl, 
  adjustments,
  filter 
}: ImageComparisonProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);

  const cssFilter = generateCSSFilter(adjustments, filter || undefined);

  const displayUrl = editedUrl || originalUrl;

  return (
    <div className="relative w-full h-full group">
      {/* Main Image */}
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        {showOriginal ? (
          <img
            src={originalUrl}
            alt="Original"
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={displayUrl}
            alt="Edited"
            className="w-full h-full object-contain transition-all duration-300"
            style={{ filter: cssFilter }}
          />
        )}
      </div>

      {/* Before/After Toggle */}
      <button
        onMouseDown={() => setShowOriginal(true)}
        onMouseUp={() => setShowOriginal(false)}
        onMouseLeave={() => setShowOriginal(false)}
        onTouchStart={() => setShowOriginal(true)}
        onTouchEnd={() => setShowOriginal(false)}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full text-sm font-medium transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2"
      >
        {showOriginal ? (
          <>
            <EyeOff className="h-4 w-4" />
            Showing Original
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" />
            Hold to Compare
          </>
        )}
      </button>
    </div>
  );
}