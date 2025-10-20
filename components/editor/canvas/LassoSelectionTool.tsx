'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Scissors, X, Check, Wand2, Square, Circle } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

type SelectionMode = 'freehand' | 'rectangle' | 'circle';

interface LassoSelectionToolProps {
  imageUrl: string;
  onSelectionComplete: (maskData: {
    imageData: string;
    maskImage: string;
    boundingBox: { x: number; y: number; width: number; height: number };
  }) => void;
  onCancel: () => void;
}

export default function LassoSelectionTool({
  imageUrl,
  onSelectionComplete,
  onCancel,
}: LassoSelectionToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('freehand');
  const [rectStart, setRectStart] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx || !imageRef.current) return;

    // Redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);

    // Draw live preview for shapes
    if (isDrawing && rectStart && currentPoint && selectionMode !== 'freehand') {
      ctx.strokeStyle = '#FFD93D';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.fillStyle = 'rgba(255, 217, 61, 0.15)';

      if (selectionMode === 'rectangle') {
        const width = currentPoint.x - rectStart.x;
        const height = currentPoint.y - rectStart.y;
        ctx.fillRect(rectStart.x, rectStart.y, width, height);
        ctx.strokeRect(rectStart.x, rectStart.y, width, height);
      } else if (selectionMode === 'circle') {
        const centerX = (rectStart.x + currentPoint.x) / 2;
        const centerY = (rectStart.y + currentPoint.y) / 2;
        const radiusX = Math.abs(currentPoint.x - rectStart.x) / 2;
        const radiusY = Math.abs(currentPoint.y - rectStart.y) / 2;
        
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    if (!imageLoaded || points.length === 0) return;

    // Draw selection path
    ctx.beginPath();
    ctx.strokeStyle = '#FFD93D';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);

    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });

    if (points.length > 2) {
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 217, 61, 0.15)';
      ctx.fill();
    }

    ctx.stroke();

    // Draw points for freehand
    if (selectionMode === 'freehand') {
      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD93D';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }
  }, [points, isDrawing, imageLoaded, rectStart, currentPoint, selectionMode]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectionMode !== 'freehand') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setPoints((prev) => [...prev, { x, y }]);
    setIsDrawing(true);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectionMode === 'freehand') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setRectStart({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectionMode === 'freehand' || !isDrawing || !rectStart) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setCurrentPoint({ x, y });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectionMode === 'freehand' || !isDrawing || !rectStart) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Create points for the shape
    if (selectionMode === 'rectangle') {
      setPoints([
        { x: rectStart.x, y: rectStart.y },
        { x: x, y: rectStart.y },
        { x: x, y: y },
        { x: rectStart.x, y: y },
      ]);
    } else if (selectionMode === 'circle') {
      const centerX = (rectStart.x + x) / 2;
      const centerY = (rectStart.y + y) / 2;
      const radiusX = Math.abs(x - rectStart.x) / 2;
      const radiusY = Math.abs(y - rectStart.y) / 2;
      
      // Create circle points
      const circlePoints: Point[] = [];
      for (let i = 0; i < 50; i++) {
        const angle = (i / 50) * Math.PI * 2;
        circlePoints.push({
          x: centerX + radiusX * Math.cos(angle),
          y: centerY + radiusY * Math.sin(angle),
        });
      }
      setPoints(circlePoints);
    }

    setRectStart(null);
    setCurrentPoint(null);
    setIsDrawing(false);
  };

  const handleComplete = () => {
    if (points.length < 3) {
      alert('Please select at least 3 points to create a selection');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create mask canvas
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    // Draw white mask on black background
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    maskCtx.fillStyle = 'white';
    maskCtx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        maskCtx.moveTo(point.x, point.y);
      } else {
        maskCtx.lineTo(point.x, point.y);
      }
    });
    maskCtx.closePath();
    maskCtx.fill();

    // Calculate bounding box
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const boundingBox = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };

    // Get original image data
    const imageData = canvas.toDataURL('image/png');
    const maskImage = maskCanvas.toDataURL('image/png');

    onSelectionComplete({
      imageData,
      maskImage,
      boundingBox,
    });
  };

  const handleClear = () => {
    setPoints([]);
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center">
      <div className="relative w-full h-full flex flex-col">
        {/* Animated Header */}
        <div className="relative bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-purple-900/40 border-b border-white/20 px-6 py-5">
          <div className="absolute inset-0 bg-gradient-to-r from-banana/10 via-transparent to-banana/10 animate-pulse" />
          
          <div className="relative flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-banana/30 rounded-xl blur-xl animate-pulse" />
                <div className="relative p-3 bg-gradient-to-br from-banana/30 to-yellow-600/30 rounded-xl border border-banana/50 backdrop-blur-sm">
                  <Scissors className="h-6 w-6 text-banana animate-pulse" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Area Selection Tool
                  <span className="text-xs px-2 py-1 bg-banana/20 border border-banana/40 rounded-full text-banana animate-pulse">Active</span>
                </h2>
                <p className="text-sm text-white/90 mt-1">
                  {selectionMode === 'freehand' ? 'Click to create points' : `Draw your ${selectionMode}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Shape Mode Selector */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/20 rounded-xl backdrop-blur-sm">
                <button
                  onClick={() => { setSelectionMode('freehand'); setPoints([]); }}
                  className={`p-2 rounded-lg transition-all duration-300 ${selectionMode === 'freehand' ? 'bg-banana text-gray-900' : 'bg-white/5 text-white hover:bg-white/10'}`}
                  title="Freehand Lasso"
                >
                  <Scissors className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setSelectionMode('rectangle'); setPoints([]); }}
                  className={`p-2 rounded-lg transition-all duration-300 ${selectionMode === 'rectangle' ? 'bg-banana text-gray-900' : 'bg-white/5 text-white hover:bg-white/10'}`}
                  title="Rectangle Selection"
                >
                  <Square className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setSelectionMode('circle'); setPoints([]); }}
                  className={`p-2 rounded-lg transition-all duration-300 ${selectionMode === 'circle' ? 'bg-banana text-gray-900' : 'bg-white/5 text-white hover:bg-white/10'}`}
                  title="Circle Selection"
                >
                  <Circle className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleClear}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-white transition-all flex items-center gap-2 hover:scale-105"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
              <button
                onClick={handleComplete}
                disabled={points.length < 3}
                className="relative px-5 py-2.5 overflow-hidden rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-banana via-yellow-400 to-banana bg-[length:200%_100%] animate-gradient-x" />
                <div className="relative flex items-center gap-2 text-gray-900">
                  <Check className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Complete
                </div>
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-white transition-all flex items-center gap-2 hover:scale-105"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="max-w-full max-h-full cursor-crosshair border-2 border-banana/30 rounded-xl shadow-2xl shadow-banana/20"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            />

            {/* Instructions Overlay */}
            {points.length === 0 && !isDrawing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <div className="absolute inset-0 bg-banana/20 rounded-2xl blur-2xl animate-pulse" />
                  <div className="relative bg-black/90 backdrop-blur-xl px-8 py-5 rounded-2xl border border-banana/40 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Wand2 className="h-6 w-6 text-banana animate-pulse" />
                      <p className="text-white text-lg font-semibold">
                        {selectionMode === 'freehand' ? 'Click to create points' : 
                         selectionMode === 'rectangle' ? 'Click and drag to draw rectangle' :
                         'Click and drag to draw circle'}
                      </p>
                    </div>
                    <p className="text-white/70 text-sm ml-9">
                      {selectionMode === 'freehand' ? 'Connect points to form your selection area' :
                       'Hold and drag to create your selection shape'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Badge */}
            {points.length > 0 && (
              <div className="absolute top-4 right-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-banana/30 rounded-xl blur-lg animate-pulse" />
                  <div className="relative bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-xl px-5 py-3 rounded-xl border border-banana/50 shadow-xl">
                    <p className="text-white text-sm font-bold flex items-center gap-2">
                      <span className="w-2 h-2 bg-banana rounded-full animate-pulse" />
                      {selectionMode === 'freehand' ? `${points.length} points` : 'Selection ready'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Tips */}
        <div className="relative bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30 border-t border-white/20 px-6 py-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-banana/5 to-transparent animate-pulse" />
          <div className="relative max-w-7xl mx-auto flex items-center gap-6 text-sm text-white/90">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-banana rounded-full animate-pulse" />
              <span className="font-medium">{selectionMode === 'freehand' ? 'Click to add points' : 'Click and drag to draw'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-medium">Use shape tools above for quick selection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="font-medium">Selection area will be highlighted in yellow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
