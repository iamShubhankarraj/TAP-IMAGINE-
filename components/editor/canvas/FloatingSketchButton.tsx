'use client';

import { useState } from 'react';
import { Pencil, Sparkles } from 'lucide-react';

interface FloatingSketchButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function FloatingSketchButton({ onClick, disabled }: FloatingSketchButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="fixed bottom-24 right-28 z-40">
      <div className="relative">
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg whitespace-nowrap animate-fade-in">
            <p className="text-white text-sm font-medium">Sketch & Create with AI</p>
            <p className="text-white/60 text-xs">Draw your idea and let AI bring it to life</p>
            <div className="absolute top-full right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900/95"></div>
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={onClick}
          disabled={disabled}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`
            group relative w-16 h-16 rounded-2xl
            bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500
            shadow-2xl shadow-purple-500/50
            transform transition-all duration-300
            ${disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:scale-110 hover:shadow-purple-500/70 active:scale-95'
            }
          `}
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300 animate-gradient-x"></div>
          
          {/* Button content */}
          <div className="relative w-full h-full rounded-2xl bg-gray-900/80 backdrop-blur-md flex items-center justify-center border border-white/10">
            <div className="relative">
              {/* Pencil icon */}
              <Pencil className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-200" />
              
              {/* AI sparkle badge */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
              
              {/* Pulsing ring animation */}
              {!disabled && (
                <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-20"></div>
              )}
            </div>
          </div>
        </button>

        {/* Status indicator */}
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
      </div>
    </div>
  );
}
