import React from 'react';
import { Spinner } from './Spinner';
import { ImageIcon, PlusIcon, CrossIcon } from './Icons';
import { ClientAdjustments, UploadedImage } from '../types';
import { ImageUploader } from './ImageUploader';

interface ImageViewerProps {
  title: string;
  imageUrl: string | null;
  text?: string | null;
  isLoading?: boolean;
  adjustments?: ClientAdjustments;
  isEdited?: boolean;
  referenceImageUrl?: string | null;
  onReferenceImageUpload?: (image: UploadedImage) => void;
  onRemoveReference?: () => void;
}

const filterStyles: { [key: string]: string } = {
    vintage: 'sepia(.6) contrast(1.1) brightness(.9) saturate(1.2)',
    sepia: 'sepia(1)',
    grayscale: 'grayscale(1)',
    blur: 'blur(4px)',
    invert: 'invert(1)',
    none: '',
};

export const ImageViewer: React.FC<ImageViewerProps> = ({ 
  title, 
  imageUrl, 
  text, 
  isLoading = false,
  adjustments,
  isEdited = false,
  referenceImageUrl,
  onReferenceImageUpload,
  onRemoveReference
}) => {

  const imageStyle: React.CSSProperties = isEdited && adjustments ? {
    filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturate}%) ${filterStyles[adjustments.filter] || ''}`.trim(),
    transform: `rotate(${adjustments.rotation}deg)`,
    transition: 'transform 0.3s ease, filter 0.1s ease-out'
  } : {};

  const renderReferenceImageSlot = () => {
    if (isEdited || !onReferenceImageUpload) return null;

    return (
      <div className="absolute bottom-4 right-4 z-10">
        {referenceImageUrl ? (
          <div className="relative group">
            <img src={referenceImageUrl} alt="Reference" className="w-24 h-24 object-cover rounded-md border-2 border-white/20 shadow-lg"/>
            <button 
              onClick={onRemoveReference} 
              className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove reference image"
            >
              <CrossIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="w-24 h-24 bg-black/30 border-2 border-dashed border-white/20 rounded-md flex flex-col items-center justify-center text-gray-400 hover:bg-black/50 hover:border-sky-400 cursor-pointer transition-colors group">
            <PlusIcon className="w-8 h-8 text-gray-500 group-hover:text-sky-400 transition-colors"/>
            <span className="text-xs mt-1 text-gray-500 group-hover:text-sky-400 transition-colors">Add Style</span>
             <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      const base64 = dataUrl.split(',')[1];
                      onReferenceImageUpload({ dataUrl, base64, mimeType: file.type });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
            />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-center text-gray-300 tracking-wide">{title}</h2>
      <div className="relative w-full aspect-square bg-[#1A1A1C] rounded-lg border border-white/10 flex items-center justify-center overflow-hidden shadow-lg shadow-black/30">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <Spinner size="lg" />
            <p>AI is thinking...</p>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt={title} className="object-contain w-full h-full" style={imageStyle} />
        ) : (
          <div className="flex flex-col items-center gap-4 text-gray-600">
            <ImageIcon className="w-24 h-24" />
            <p className="text-lg">{isEdited ? "Your creation will appear here" : ""}</p>
          </div>
        )}
         {renderReferenceImageSlot()}
      </div>
      {text && (
         <div className="bg-[#1A1A1C]/80 p-4 rounded-lg border border-white/10">
            <p className="text-sm text-gray-300 italic">{text}</p>
         </div>
      )}
    </div>
  );
};