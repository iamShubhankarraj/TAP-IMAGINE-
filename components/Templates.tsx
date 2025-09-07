import React from 'react';

interface TemplatesProps {
  onSelectTemplate: (prompt: string) => void;
  disabled?: boolean;
}

const templates = [
  "Make it cinematic, dramatic lighting",
  "80s retro style, neon lights, grainy",
  "Turn me into a cartoon character",
  "Make it look like an oil painting",
  "Change the season to winter, add snow",
  "Change the season to autumn, warm colors",
  "Add a mystical fog to the background",
  "Give it a vintage, old photo effect",
  "Make it black and white, high contrast",
  "Pop art style, vibrant colors",
  "Change the background to a futuristic city",
  "Put me in a fantasy forest",
  "Add a superhero cape",
  "Make it look like a pencil sketch",
];

export const Templates: React.FC<TemplatesProps> = ({ onSelectTemplate, disabled }) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-400 mb-2">Templates</h3>
      <div className="max-h-48 overflow-y-auto space-y-2 pr-2 no-scrollbar">
        {templates.map((template) => (
          <button
            key={template}
            onClick={() => onSelectTemplate(template)}
            disabled={disabled}
            className="w-full text-left p-2.5 bg-white/5 rounded-md text-sm text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {template}
          </button>
        ))}
      </div>
    </div>
  );
};