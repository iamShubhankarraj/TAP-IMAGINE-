'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type Adjustment = {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
};

type EditorContextType = {
  selectedTool: string | null;
  adjustments: Adjustment;
  setSelectedTool: (tool: string | null) => void;
  setAdjustments: (adjustments: Adjustment) => void;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<Adjustment>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
  });

  const value = {
    selectedTool,
    adjustments,
    setSelectedTool,
    setAdjustments,
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};