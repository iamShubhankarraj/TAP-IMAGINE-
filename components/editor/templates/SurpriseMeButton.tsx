// components/editor/templates/SurpriseMeButton.tsx
'use client';

import React, { useState } from 'react';
import { Sparkles, Shuffle } from 'lucide-react';

interface SurpriseMeButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function SurpriseMeButton({ onClick, disabled }: SurpriseMeButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full py-4 px-6 rounded-xl font-medium text-lg
        bg-gradient-to-r from-purple-600 to-pink-600
        hover:from-purple-500 hover:to-pink-500
        text-white shadow-lg hover:shadow-xl
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        relative overflow-hidden group
        ${isAnimating ? 'scale-95' : 'hover:scale-105'}
      `}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {isAnimating ? (
          <>
            <Shuffle className="h-6 w-6 animate-spin" />
            Surprising you...
          </>
        ) : (
          <>
            <Sparkles className="h-6 w-6" />
            Surprise Me!
            <Sparkles className="h-6 w-6" />
          </>
        )}
      </span>
    </button>
  );
}