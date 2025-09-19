// context/image-store.tsx
'use client';

import { createContext, useContext, useState } from 'react';

type ImageType = {
  id: string;
  url: string;
  name: string;
  createdAt: Date;
};

type ImageStoreContextType = {
  primaryImage: ImageType | null;
  referenceImages: ImageType[];
  generatedImage: ImageType | null;
  setPrimaryImage: (image: ImageType | null) => void;
  addReferenceImage: (image: ImageType) => void;
  removeReferenceImage: (id: string) => void;
  clearReferenceImages: () => void;
  setGeneratedImage: (image: ImageType | null) => void;
};

const ImageStoreContext = createContext<ImageStoreContextType | undefined>(undefined);

export function ImageStoreProvider({ children }: { children: React.ReactNode }) {
  const [primaryImage, setPrimaryImage] = useState<ImageType | null>(null);
  const [referenceImages, setReferenceImages] = useState<ImageType[]>([]);
  const [generatedImage, setGeneratedImage] = useState<ImageType | null>(null);

  const addReferenceImage = (image: ImageType) => {
    setReferenceImages((prev) => [...prev, image]);
  };

  const removeReferenceImage = (id: string) => {
    setReferenceImages((prev) => prev.filter((img) => img.id !== id));
  };

  const clearReferenceImages = () => {
    setReferenceImages([]);
  };

  const value = {
    primaryImage,
    referenceImages,
    generatedImage,
    setPrimaryImage,
    addReferenceImage,
    removeReferenceImage,
    clearReferenceImages,
    setGeneratedImage,
  };

  return <ImageStoreContext.Provider value={value}>{children}</ImageStoreContext.Provider>;
}

export const useImageStore = () => {
  const context = useContext(ImageStoreContext);
  
  if (context === undefined) {
    throw new Error('useImageStore must be used within an ImageStoreProvider');
  }
  
  return context;
};