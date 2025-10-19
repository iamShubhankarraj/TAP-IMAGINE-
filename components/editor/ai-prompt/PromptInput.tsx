// components/editor/ai-prompt/PromptInput.tsx
'use client';

import React, { useState } from 'react';
import { Wand2, Loader2, Sparkles } from 'lucide-react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isProcessing?: boolean;
  disabled?: boolean;
}

const PROMPT_SUGGESTIONS = [
  "Make it look like an oil painting",
  "Add cyberpunk neon elements",
  "Convert to watercolor style",
  "Add dramatic cinematic lighting",
  "Make it look vintage 1950s",
  "Transform into anime style",
  "Add fantasy magical elements",
  "Make it black and white noir",
  "Add vibrant pop art colors",
  "Transform to pencil sketch"
];

export default function PromptInput({ 
  value, 
  onChange, 
  onSubmit, 
  isProcessing = false,
  disabled = false 
}: PromptInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isProcessing && !disabled) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white flex items-center gap-2">
        <Wand2 className="h-5 w-5 text-banana" />
        AI Prompt
      </h3>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Describe how you want to transform your image... (e.g., 'Make it look like a vintage oil painting with warm tones')"
            disabled={disabled || isProcessing}
            className="w-full p-4 h-32 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-banana focus:ring-2 focus:ring-banana/20 resize-none transition-all disabled:opacity-50"
          />
          
          {/* Character count */}
          <div className="absolute bottom-3 right-3 text-xs text-white/40">
            {value.length} / 500
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!value.trim() || isProcessing || disabled}
          className="w-full py-3 px-4 bg-banana hover:bg-banana-light text-gray-900 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5" />
              Generate Image
            </>
          )}
        </button>
      </form>

      {/* Prompt Suggestions */}
      <div className="space-y-3">
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
        >
          <Sparkles className="h-4 w-4 text-banana" />
          {showSuggestions ? 'Hide' : 'Show'} prompt ideas
        </button>

        {showSuggestions && (
          <div className="space-y-2 animate-in slide-in-from-top duration-200">
            <p className="text-xs text-white/50">Click to use:</p>
            <div className="flex flex-wrap gap-2">
              {PROMPT_SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => onChange(suggestion)}
                  disabled={disabled || isProcessing}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-banana/50 rounded-full text-sm text-white/80 hover:text-white transition-all disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <p className="text-xs text-blue-200 flex items-start gap-2">
          <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Pro tip:</strong> Be specific! Describe the style, mood, colors, and atmosphere you want. 
            Example: "Transform into a moody cyberpunk portrait with neon purple and blue lighting"
          </span>
        </p>
      </div>
    </div>
  );
}