import React, { useCallback, useState } from 'react';
import type { UploadedImage } from '../types';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onImageUpload: (image: UploadedImage) => void;
  title: string;
  compact?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, title, compact = false }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(',')[1];
        onImageUpload({ dataUrl, base64, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragEvents = useCallback((e: React.DragEvent<HTMLLabelElement>, isEntering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isEntering);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, [handleDragEvents]);
  
  const containerClasses = compact 
    ? "w-full h-32" 
    : "w-full max-w-2xl h-96";

  const textClasses = compact ? "text-lg" : "text-xl";
  const draggingClasses = isDragging 
    ? 'border-sky-400 bg-[#1A1A1C]/80 shadow-2xl shadow-sky-500/20' 
    : 'border-white/20';

  return (
    <label
      onDragEnter={(e) => handleDragEvents(e, true)}
      onDragLeave={(e) => handleDragEvents(e, false)}
      onDragOver={(e) => handleDragEvents(e, true)}
      onDrop={handleDrop}
      style={{
        backgroundImage: `radial-gradient(circle at center, ${isDragging ? 'rgba(56, 189, 248, 0.1)' : 'transparent'} 0%, transparent 70%)`,
        transition: 'background-image 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease'
      }}
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer bg-[#1A1A1C]/50 hover:border-sky-500/50 transition-all duration-300 ${draggingClasses} ${containerClasses}`}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
        <UploadIcon className={`w-10 h-10 mb-4 text-gray-500 transition-transform duration-300 ${isDragging ? 'scale-110 text-sky-400' : ''}`} />
        <p className={`mb-2 ${textClasses} font-medium text-gray-200`}>
          <span className="font-semibold text-sky-400">{title}</span>
        </p>
        <p className="text-sm text-gray-500">or drag and drop</p>
      </div>
      <input 
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
      />
    </label>
  );
};