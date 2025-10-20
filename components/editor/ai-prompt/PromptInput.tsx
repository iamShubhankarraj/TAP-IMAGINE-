// components/editor/ai-prompt/PromptInput.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Wand2, Loader2, Sparkles, ImagePlus, X } from 'lucide-react';
import { StoredImage } from '@/types/editor';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isProcessing?: boolean;
  disabled?: boolean;
  referenceImages?: StoredImage[];
  onReferenceImagesChange?: (images: StoredImage[]) => void;
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
  disabled = false,
  referenceImages = [],
  onReferenceImagesChange
}: PromptInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isProcessing && !disabled) {
      onSubmit();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !onReferenceImagesChange) return;

    const newImages: StoredImage[] = [];
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newImage: StoredImage = {
            id: Date.now().toString() + Math.random(),
            url: event.target.result as string,
            name: file.name,
            createdAt: new Date(),
          };
          newImages.push(newImage);
          
          // Update after all files processed
          if (newImages.length === files.length) {
            onReferenceImagesChange([...referenceImages, ...newImages]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeReferenceImage = (id: string) => {
    if (onReferenceImagesChange) {
      onReferenceImagesChange(referenceImages.filter(img => img.id !== id));
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
            placeholder="Describe how you want to transform your image... (e.g., 'Make it look like a vintage oil painting with warm tones')\n\nPro tip: Add reference images below to include specific elements or people in your generation!"
            disabled={disabled || isProcessing}
            className="w-full p-4 h-40 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-banana focus:ring-2 focus:ring-banana/20 resize-none transition-all disabled:opacity-50"
          />
          
          {/* Character count */}
          <div className="absolute bottom-3 right-3 text-xs text-white/40">
            {value.length} / 500
          </div>
        </div>

        {/* Reference Images Section */}
        {onReferenceImagesChange && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/70 flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-banana" />
                Reference Images (Optional)
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isProcessing}
                className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/20 hover:border-banana/50 rounded-lg text-white transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Add Image
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Reference Images Grid */}
            {referenceImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 p-3 bg-white/5 border border-white/10 rounded-lg">
                {referenceImages.map((img) => (
                  <div key={img.id} className="relative group aspect-square">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover rounded-lg border border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => removeReferenceImage(img.id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-white/50 flex items-start gap-1.5">
              <Sparkles className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-banana" />
              <span>
                Add reference images to include specific people, objects, or styles in your AI generation. 
                Example: "Add this person to a beach sunset scene"
              </span>
            </p>
          </div>
        )}

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