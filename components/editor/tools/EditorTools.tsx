// components/editor/tools/EditorTools.tsx
'use client';

import { useState } from 'react';
import { 
  Crop, Move, Layers, WandSparkles, Palette, 
  Sliders, Eraser, Scissors, PenTool, ImagePlus,
  ChevronRight, ChevronDown
} from 'lucide-react';

type Tool = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  isAvailable: boolean;
};

type ToolsProps = {
  onSelectTool: (toolId: string) => void;
  selectedTool?: string;
  disabled?: boolean;
};

export default function EditorTools({ 
  onSelectTool, 
  selectedTool = 'prompt',
  disabled = false 
}: ToolsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const tools: Tool[] = [
    { 
      id: 'prompt', 
      name: 'AI Prompt', 
      icon: <WandSparkles className="h-5 w-5" />, 
      description: 'Transform with AI prompt',
      isAvailable: true
    },
    { 
      id: 'templates', 
      name: 'Templates', 
      icon: <ImagePlus className="h-5 w-5" />, 
      description: 'Quick transformations',
      isAvailable: true
    },
    { 
      id: 'adjust', 
      name: 'Adjust', 
      icon: <Sliders className="h-5 w-5" />, 
      description: 'Image adjustments',
      isAvailable: true
    },
    { 
      id: 'filters', 
      name: 'Filters', 
      icon: <Palette className="h-5 w-5" />, 
      description: 'Apply filters',
      isAvailable: true
    },
    { 
      id: 'crop', 
      name: 'Crop', 
      icon: <Crop className="h-5 w-5" />, 
      description: 'Crop and resize',
      isAvailable: true
    },
    { 
      id: 'layers', 
      name: 'Layers', 
      icon: <Layers className="h-5 w-5" />, 
      description: 'Manage layers',
      isAvailable: false
    },
    { 
      id: 'retouch', 
      name: 'Retouch', 
      icon: <Eraser className="h-5 w-5" />, 
      description: 'Remove objects',
      isAvailable: false
    },
    { 
      id: 'selection', 
      name: 'Selection', 
      icon: <Scissors className="h-5 w-5" />, 
      description: 'Select areas',
      isAvailable: false
    },
    { 
      id: 'draw', 
      name: 'Draw', 
      icon: <PenTool className="h-5 w-5" />, 
      description: 'Add annotations',
      isAvailable: false
    }
  ];

  const handleToolClick = (toolId: string) => {
    if (disabled) return;
    
    const tool = tools.find(t => t.id === toolId);
    if (tool && tool.isAvailable) {
      onSelectTool(toolId);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`bg-black/30 backdrop-blur-md border border-white/10 rounded-lg ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 overflow-hidden`}>
      <div className="p-2 border-b border-white/10 flex justify-between items-center">
        <h3 className={`text-white font-medium ${isCollapsed ? 'hidden' : 'block'}`}>Tools</h3>
        <button 
          onClick={toggleCollapse}
          className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      
      <div className="p-2">
        <div className={`grid ${isCollapsed ? 'grid-cols-1' : 'grid-cols-1 gap-1'}`}>
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              disabled={disabled || !tool.isAvailable}
              className={`
                flex items-center p-2 rounded-md transition-colors
                ${selectedTool === tool.id 
                  ? 'bg-banana/20 text-banana' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'}
                ${!tool.isAvailable && 'opacity-40 cursor-not-allowed'}
                ${isCollapsed ? 'justify-center' : 'justify-start'}
              `}
              title={tool.name}
            >
              <span className="flex-shrink-0">{tool.icon}</span>
              
              {!isCollapsed && (
                <div className="ml-3 text-left">
                  <span className="block text-sm font-medium">{tool.name}</span>
                  <span className="block text-xs text-white/50">{tool.description}</span>
                </div>
              )}
              
              {!tool.isAvailable && !isCollapsed && (
                <span className="ml-auto text-xs bg-white/10 px-1.5 py-0.5 rounded">Soon</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}