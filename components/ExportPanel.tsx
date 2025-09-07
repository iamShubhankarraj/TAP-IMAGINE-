import React, { useState } from 'react';
import { DownloadIcon } from './Icons';
import { ClientAdjustments } from '../types';

interface ExportPanelProps {
  editedImageUrl: string | null;
  adjustments: ClientAdjustments;
}

type AspectRatio = 'original' | '1:1' | '16:9' | '9:16' | '4:3';

const aspectRatios: { id: AspectRatio, label: string }[] = [
    { id: 'original', label: 'Original' },
    { id: '1:1', label: 'Square' },
    { id: '16:9', label: 'Widescreen' },
    { id: '9:16', label: 'Story' },
    { id: '4:3', label: 'Classic' },
];

const filterStyles: { [key: string]: string } = {
    vintage: 'sepia(.6) contrast(1.1) brightness(.9) saturate(1.2)',
    sepia: 'sepia(1)',
    grayscale: 'grayscale(1)',
    blur: 'blur(4px)',
    invert: 'invert(1)',
    none: '',
};

export const ExportPanel: React.FC<ExportPanelProps> = ({ editedImageUrl, adjustments }) => {
    const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('original');

    const handleDownload = () => {
        if (!editedImageUrl) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = editedImageUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const { rotation, filter, ...sliderFilters } = adjustments;
            const isRotated = rotation === 90 || rotation === 270;
            const originalWidth = isRotated ? img.height : img.width;
            const originalHeight = isRotated ? img.width : img.height;
            
            let targetWidth = originalWidth;
            let targetHeight = originalHeight;

            if (selectedRatio !== 'original') {
                const [w, h] = selectedRatio.split(':').map(Number);
                const originalRatio = originalWidth / originalHeight;
                const targetRatio = w / h;

                if (originalRatio > targetRatio) { // Original is wider
                    targetHeight = originalHeight;
                    targetWidth = targetHeight * targetRatio;
                } else { // Original is taller or same
                    targetWidth = originalWidth;
                    targetHeight = targetWidth / targetRatio;
                }
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            const sx = (originalWidth - targetWidth) / 2;
            const sy = (originalHeight - targetHeight) / 2;
            
            const filterString = filterStyles[filter] || '';
            ctx.filter = `brightness(${sliderFilters.brightness}%) contrast(${sliderFilters.contrast}%) saturate(${sliderFilters.saturate}%) ${filterString}`.trim();
            
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotation * Math.PI / 180);

            // Adjust drawing coordinates based on rotation
            const drawX = isRotated ? -originalHeight / 2 : -originalWidth / 2;
            const drawY = isRotated ? -originalWidth / 2 : -originalHeight / 2;
            
            // We draw the full image, and the canvas crop handles the aspect ratio
            ctx.drawImage(img, drawX, drawY);
            ctx.restore();


            const link = document.createElement('a');
            link.download = 'ai-photo-studio-edit.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-100 tracking-wider">Export Image</h2>
            <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Aspect Ratio</h3>
                <div className="grid grid-cols-2 gap-2">
                    {aspectRatios.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => setSelectedRatio(id)}
                             className={`p-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A1A1C] focus:ring-sky-400 ${
                                selectedRatio === id
                                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            <button
                onClick={handleDownload}
                disabled={!editedImageUrl}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 text-white font-semibold rounded-md hover:bg-sky-400 disabled:bg-sky-500/30 disabled:cursor-not-allowed disabled:text-sky-300/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A1A1C] focus:ring-sky-400 shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-400/30"
            >
                <DownloadIcon className="w-5 h-5" />
                Download
            </button>
        </div>
    );
};