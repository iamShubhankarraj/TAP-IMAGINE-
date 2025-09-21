// components/editor/canvas/EditorCanvas.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { useImageStore } from '@/context/image-store';
import { ZoomIn, ZoomOut, Move, MaximizeSquare, Loader2 } from 'lucide-react';

type EditorCanvasProps = {
  isProcessing?: boolean;
  loadingMessage?: string;
  adjustments?: Record<string, number>;
  filter?: string | null;
  rotation?: number;
  onImageClick?: () => void;
};

export default function EditorCanvas({ 
  isProcessing = false,
  loadingMessage = 'Processing...',
  adjustments = {},
  filter = null,
  rotation = 0,
  onImageClick 
}: EditorCanvasProps) {
  const { primaryImage, generatedImage } = useImageStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });

  // Reset position and zoom when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [primaryImage, generatedImage]);

  // Get current image to display
  const currentImage = generatedImage || primaryImage;

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Handle panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsPanning(true);
    setStartPanPosition({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    
    setPosition({
      x: e.clientX - startPanPosition.x,
      y: e.clientY - startPanPosition.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Generate CSS filter string based on adjustments
  const generateFilterStyle = () => {
    if (!adjustments) return '';
    
    const { brightness = 0, contrast = 0, saturation = 0, sharpness = 0 } = adjustments;
    
    let filterString = '';
    filterString += `brightness(${1 + brightness / 100}) `;
    filterString += `contrast(${1 + contrast / 100}) `;
    filterString += `saturate(${1 + saturation / 100}) `;
    
    // Add built-in filters
    if (filter === 'vintage') {
      filterString += 'sepia(0.3) contrast(1.1) saturate(1.3) ';
    } else if (filter === 'bw') {
      filterString += 'grayscale(1) ';
    } else if (filter === 'sepia') {
      filterString += 'sepia(0.8) ';
    } else if (filter === 'cool') {
      filterString += 'hue-rotate(30deg) saturate(1.2) ';
    } else if (filter === 'warm') {
      filterString += 'hue-rotate(-30deg) saturate(1.3) brightness(1.1) ';
    } else if (filter === 'film') {
      filterString += 'contrast(1.2) saturate(0.8) brightness(1.05) ';
    }
    
    // Note: CSS doesn't have a direct equivalent to sharpness
    // In a real app, you might use a canvas-based solution for sharpness
    
    return filterString.trim();
  };

  return (
    <div className="relative w-full h-full min-h-[60vh] overflow-hidden bg-[#121212] bg-opacity-50 backdrop-blur-sm rounded-lg flex items-center justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>
      
      {/* Canvas content */}
      <div 
        ref={canvasRef}
        className="absolute inset-0 overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isProcessing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20">
            <Loader2 className="h-16 w-16 animate-spin text-banana mb-4" />
            <p className="text-white/80 text-lg text-center">{loadingMessage}</p>
          </div>
        ) : currentImage ? (
          <div 
            className="absolute transform-gpu transition-transform duration-100 ease-out"
            style={{ 
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center',
              filter: generateFilterStyle(),
            }}
            onClick={onImageClick}
          >
            <img 
              src={currentImage.url} 
              alt="Editor canvas"
              className="max-w-full max-h-full object-contain pointer-events-none"
              draggable={false}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/50">No image loaded</p>
          </div>
        )}
      </div>
      
      {/* Zoom controls */}
      {currentImage && !isProcessing && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg p-1 z-10">
          <button 
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="p-2 text-white/80 hover:text-white rounded-md hover:bg-white/10 disabled:opacity-50 transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          
          <span className="text-white/80 text-xs font-medium min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <button 
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="p-2 text-white/80 hover:text-white rounded-md hover:bg-white/10 disabled:opacity-50 transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          
          <button 
            onClick={handleZoomReset}
            className="p-2 text-white/80 hover:text-white rounded-md hover:bg-white/10 transition-colors"
            title="Reset zoom"
          >
            <MaximizeSquare size={18} />
          </button>
        </div>
      )}
    </div>
  );
}