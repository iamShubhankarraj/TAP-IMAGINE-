'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StoredImage } from '@/types/editor';
import { ImageAdjustments, defaultAdjustments } from '@/types/adjustments';

interface EditorContextType {
  // Images
  primaryImage: StoredImage | null;
  setPrimaryImage: (image: StoredImage | null) => void;
  
  generatedImage: StoredImage | null;
  setGeneratedImage: (image: StoredImage | null) => void;
  
  referenceImages: StoredImage[];
  setReferenceImages: (images: StoredImage[]) => void;
  
  // Adjustments
  adjustments: ImageAdjustments;
  setAdjustments: (adjustments: ImageAdjustments) => void;
  
  // Filter
  currentFilter: string | null;
  setCurrentFilter: (filter: string | null) => void;
  
  // History
  history: ImageAdjustments[];
  setHistory: (history: ImageAdjustments[]) => void;
  
  historyIndex: number;
  setHistoryIndex: (index: number) => void;
  
  // Current prompt
  prompt: string;
  setPrompt: (prompt: string) => void;
  
  // Get display image (generated or primary)
  getDisplayImage: () => StoredImage | null;
  
  // Get image URL for AI processing (always use latest edited)
  getImageForProcessing: () => string | null;
  
  // Reset editor
  resetEditor: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [primaryImage, setPrimaryImage] = useState<StoredImage | null>(null);
  const [generatedImage, setGeneratedImage] = useState<StoredImage | null>(null);
  const [referenceImages, setReferenceImages] = useState<StoredImage[]>([]);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(defaultAdjustments);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageAdjustments[]>([defaultAdjustments]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [prompt, setPrompt] = useState('');

  const getDisplayImage = () => {
    return generatedImage || primaryImage;
  };

  const getImageForProcessing = () => {
    // Always use the generated/edited image if available
    // This allows chaining edits on top of each other
    return generatedImage?.url || primaryImage?.url || null;
  };

  const resetEditor = () => {
    setPrimaryImage(null);
    setGeneratedImage(null);
    setReferenceImages([]);
    setAdjustments(defaultAdjustments);
    setCurrentFilter(null);
    setHistory([defaultAdjustments]);
    setHistoryIndex(0);
    setPrompt('');
  };

  return (
    <EditorContext.Provider
      value={{
        primaryImage,
        setPrimaryImage,
        generatedImage,
        setGeneratedImage,
        referenceImages,
        setReferenceImages,
        adjustments,
        setAdjustments,
        currentFilter,
        setCurrentFilter,
        history,
        setHistory,
        historyIndex,
        setHistoryIndex,
        prompt,
        setPrompt,
        getDisplayImage,
        getImageForProcessing,
        resetEditor,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
}
