import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ImageViewer } from './components/ImageViewer';
import { Alert } from './components/Alert';
import { editImage } from './services/geminiService';
import type { UploadedImage, EditedContent, ClientAdjustments } from './types';
import { Sidebar } from './components/Sidebar';
import { LoadingOverlay } from './components/LoadingOverlay';

const App: React.FC = () => {
  const [primaryImage, setPrimaryImage] = useState<UploadedImage | null>(null);
  const [referenceImage, setReferenceImage] = useState<UploadedImage | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [editedContent, setEditedContent] = useState<EditedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<ClientAdjustments>({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    rotation: 0,
    filter: 'none',
  });

  const handleImageUpload = (image: UploadedImage, type: 'primary' | 'reference') => {
    if (type === 'primary') {
      handleReset(); // Reset everything if a new primary image is uploaded
      setPrimaryImage(image);
    } else {
      setReferenceImage(image);
    }
    setError(null);
  };

  const handleReset = () => {
    setPrimaryImage(null);
    setReferenceImage(null);
    setEditedContent(null);
    setError(null);
    setPrompt('');
    setAdjustments({ brightness: 100, contrast: 100, saturate: 100, rotation: 0, filter: 'none' });
  };
  
  const handleGenerate = useCallback(async () => {
    if (!primaryImage || !prompt.trim()) {
      setError("Please upload a primary image and enter an editing prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedContent(null);
    setAdjustments({ brightness: 100, contrast: 100, saturate: 100, rotation: 0, filter: 'none' });


    const images = [primaryImage];
    if (referenceImage) {
      images.push(referenceImage);
    }

    try {
      const parts = await editImage(images, prompt);
      const imagePart = parts.find(part => part.inlineData);
      const textPart = parts.find(part => part.text);

      if (imagePart?.inlineData) {
        setEditedContent({
          imageData: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
          text: textPart?.text || null,
        });
      } else {
        throw new Error("The AI did not return an image. It might have refused the request.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [primaryImage, referenceImage, prompt]);

  const mainContent = !primaryImage ? (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <ImageUploader onImageUpload={(img) => handleImageUpload(img, 'primary')} title="Upload Primary Image" />
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <ImageViewer 
          title="Original" 
          imageUrl={primaryImage.dataUrl}
          referenceImageUrl={referenceImage?.dataUrl}
          onReferenceImageUpload={(img) => handleImageUpload(img, 'reference')}
          onRemoveReference={() => setReferenceImage(null)}
        />
        <ImageViewer 
          title="Edited" 
          imageUrl={editedContent?.imageData ?? null} 
          text={editedContent?.text ?? null}
          isLoading={false} // Loading is now handled by the overlay
          adjustments={adjustments}
          isEdited
        />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-gray-100 font-sans flex flex-col">
      {isLoading && <LoadingOverlay />}
      <Header onReset={handleReset} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerate}
          isLoading={isLoading}
          isImageUploaded={!!primaryImage}
          adjustments={adjustments}
          setAdjustments={setAdjustments}
          editedImageUrl={editedContent?.imageData ?? null}
        />
        <main className="flex-1 container mx-auto p-4 md:p-8 overflow-y-auto">
          {error && <Alert message={error} onClose={() => setError(null)} />}
          {mainContent}
        </main>
      </div>
    </div>
  );
};

export default App;