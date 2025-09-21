// components/editor/ai-prompt/PromptInput.tsx
'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Wand2, Send, Loader2 } from 'lucide-react';

type PromptInputProps = {
  initialPrompt?: string;
  onSubmit: (prompt: string) => void;
  isProcessing: boolean;
  disabled?: boolean;
};

// Example prompts that showcase the AI's capabilities
const EXAMPLE_PROMPTS = [
  "Make it look like an oil painting by Monet",
  "Transform into cyberpunk style with neon lights",
  "Convert to watercolor with soft edges",
  "Make it look like a vintage photograph from the 1970s",
  "Add dramatic cinematic lighting",
  "Transform into anime style illustration",
  "Make it look like it's from a fantasy world",
  "Convert to minimalist line art"
];

export default function PromptInput({ 
  initialPrompt = '', 
  onSubmit, 
  isProcessing, 
  disabled = false 
}: PromptInputProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [charCount, setCharCount] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const MAX_CHARS = 500;

  // Update character count when prompt changes
  useEffect(() => {
    setCharCount(prompt.length);
  }, [prompt]);

  // Choose random suggestions on mount
  useEffect(() => {
    // Pick 4 random example prompts
    const randomSuggestions = [...EXAMPLE_PROMPTS]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
    
    setSuggestions(randomSuggestions);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isProcessing && !disabled) {
      onSubmit(prompt.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleClear = () => {
    setPrompt('');
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.substring(0, MAX_CHARS))}
            placeholder="Describe how you want to transform your image..."
            className="w-full p-4 pr-12 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-banana focus:ring-1 focus:ring-banana resize-none h-32"
            disabled={isProcessing || disabled}
          />
          
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className={`text-xs ${charCount > MAX_CHARS * 0.9 ? 'text-red-400' : 'text-white/50'}`}>
              {charCount}/{MAX_CHARS}
            </span>
            <button
              type="submit"
              disabled={!prompt.trim() || isProcessing || disabled}
              className="p-2 bg-banana text-gray-900 rounded-lg hover:bg-banana-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="text-white/50 text-sm hover:text-white transition-colors"
            disabled={!prompt || isProcessing || disabled}
          >
            Clear
          </button>
          
          <button
            type="submit"
            disabled={!prompt.trim() || isProcessing || disabled}
            className="px-4 py-2 bg-banana text-gray-900 font-medium rounded-lg hover:bg-banana-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                Generate
              </>
            )}
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-md font-medium flex items-center gap-2 mb-3 text-white/80">
          <Sparkles className="h-4 w-4 text-banana" />
          Try these prompts
        </h3>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isProcessing || disabled}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-sm text-white/70 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}