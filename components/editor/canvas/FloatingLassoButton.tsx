'use client';

import React, { useState } from 'react';
import { Scissors, Sparkles } from 'lucide-react';

interface FloatingLassoButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function FloatingLassoButton({ onClick, disabled = false }: FloatingLassoButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="absolute bottom-8 right-8 z-10">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-4 w-72 animate-in slide-in-from-bottom-2 duration-300">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-banana via-yellow-400 to-banana rounded-2xl blur-xl opacity-40 animate-pulse" />
            
            {/* Tooltip content */}
            <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 backdrop-blur-xl border border-banana/40 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-banana/20 rounded-lg flex-shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4 text-banana" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1.5">Area Selection Tool</h4>
                  <p className="text-white/90 text-xs leading-relaxed">
                    Select specific areas of your image to edit them individually. 
                    Choose from <span className="text-banana font-medium">freehand lasso</span>, 
                    <span className="text-banana font-medium"> rectangle</span>, or 
                    <span className="text-banana font-medium"> circle</span> selection modes.
                  </p>
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-white/70 text-xs">
                      💡 Perfect for changing clothing colors, backgrounds, or adding objects to specific areas!
                    </p>
                  </div>
                </div>
              </div>
              {/* Arrow */}
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-gradient-to-br from-gray-900 to-purple-900/30 border-r border-b border-banana/40 transform rotate-45" />
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <div className="relative group">
        {/* Animated rings */}
        <div className="absolute inset-0 rounded-full bg-banana/20 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-banana/30 blur-xl animate-pulse" />
        
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-banana via-yellow-400 to-orange-400 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 animate-gradient-x" />
        
        {/* Main button */}
        <button
          onClick={onClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          disabled={disabled}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-banana via-yellow-400 to-orange-400 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center group"
          title="Open Area Selection Tool"
        >
          {/* Inner glow */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-yellow-300/50 to-transparent" />
          
          {/* Icon container with animation */}
          <div className="relative z-10 animate-float">
            <Scissors className="h-7 w-7 text-gray-900 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          
          {/* Sparkle effect */}
          <div className="absolute top-1 right-1">
            <Sparkles className="h-3 w-3 text-white animate-pulse" />
          </div>
        </button>

        {/* Blinking indicator dot */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse shadow-lg shadow-green-400/50" />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1 h-1 bg-banana rounded-full animate-ping" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-0 left-0 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-0 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}
