'use client';

import React, { useState } from 'react';
import { X, Wand2, Loader2, Sparkles } from 'lucide-react';

interface AreaEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  isProcessing?: boolean;
}

const AREA_EDIT_SUGGESTIONS = [
  "Make this t-shirt red",
  "Change this to blue jeans",
  "Add a bird flying in the sky",
  "Make this background blurred",
  "Change hair color to blonde",
  "Add sunglasses to this person",
  "Make this area brighter",
  "Add flowers in this space",
  "Change this to a sunset sky",
  "Make this object disappear"
];

export default function AreaEditModal({
  isOpen,
  onClose,
  onSubmit,
  isProcessing = false,
}: AreaEditModalProps) {
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isProcessing) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-banana via-yellow-400 to-orange-400 rounded-2xl blur-xl opacity-30" />

        {/* Modal Content */}
        <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-white/10 to-white/5 border-b border-white/20 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-banana/20 rounded-lg">
                  <Wand2 className="h-5 w-5 text-banana" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Selected Area</h3>
                  <p className="text-sm text-white/60">
                    Describe how you want to modify this specific area
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                disabled={isProcessing}
                className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Prompt Input */}
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the change you want in this area...&#10;&#10;Examples:&#10;• Make this t-shirt red&#10;• Add a bird flying in the sky&#10;• Change this background to sunset"
                disabled={isProcessing}
                autoFocus
                className="w-full p-4 h-32 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-banana focus:ring-2 focus:ring-banana/20 resize-none transition-all disabled:opacity-50"
              />

              {/* Character Count */}
              <div className="absolute bottom-3 right-3 text-xs text-white/40">
                {prompt.length} / 200
              </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-2">
              <p className="text-xs text-white/50 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-banana" />
                Quick suggestions:
              </p>
              <div className="flex flex-wrap gap-2">
                {AREA_EDIT_SUGGESTIONS.slice(0, 6).map((suggestion, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(suggestion)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-banana/50 rounded-full text-xs text-white/80 hover:text-white transition-all disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-blue-200 flex items-start gap-2">
                <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Tip:</strong> Be specific about colors, objects, or changes you want in the selected area. 
                  The AI will only modify the region you selected!
                </span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-medium rounded-xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!prompt.trim() || isProcessing}
                className="flex-1 py-3 px-4 bg-banana hover:bg-banana-light text-gray-900 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    Apply Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
