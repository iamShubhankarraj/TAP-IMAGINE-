// components/editor/export/ExportConfigEditor.tsx
'use client';

import { useState } from 'react';
import { X, Save, Info } from 'lucide-react';
import { ExportConfig, ExportFormat, ResizeMode, ColorSpace, BitDepth, OutputSharpening, BackgroundType } from '@/types/export';

type ExportConfigEditorProps = {
  config: ExportConfig;
  onSave: (config: ExportConfig) => void;
  onClose: () => void;
};

export default function ExportConfigEditor({ config, onSave, onClose }: ExportConfigEditorProps) {
  const [editedConfig, setEditedConfig] = useState<ExportConfig>(config);

  const handleSave = () => {
    onSave(editedConfig);
    onClose();
  };

  const updateConfig = (updates: Partial<ExportConfig>) => {
    setEditedConfig(prev => ({ ...prev, ...updates }));
  };

  const updateResize = (updates: Partial<ExportConfig['resize']>) => {
    setEditedConfig(prev => ({
      ...prev,
      resize: { ...prev.resize, ...updates }
    }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/50 to-violet-800/50 rounded-xl border border-white/10 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Configure Export Settings</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Configuration Name
            </label>
            <input
              type="text"
              value={editedConfig.name}
              onChange={(e) => updateConfig({ name: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-banana"
              placeholder="e.g., Web Export, Print Quality"
            />
          </div>

          {/* Format & Quality */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Format
              </label>
              <select
                value={editedConfig.format}
                onChange={(e) => updateConfig({ format: e.target.value as ExportFormat })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-banana"
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
                <option value="tiff">TIFF</option>
                <option value="heif">HEIF</option>
                <option value="avif">AVIF</option>
                <option value="psd">PSD (Photoshop)</option>
                <option value="psb">PSB (Large Format)</option>
                <option value="dng">DNG (RAW)</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Quality ({editedConfig.quality}%)
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={editedConfig.quality}
                onChange={(e) => updateConfig({ quality: parseInt(e.target.value) })}
                className="w-full accent-banana"
              />
              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Resize Mode */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Resize Mode
            </label>
            <select
              value={editedConfig.resize.mode}
              onChange={(e) => updateResize({ mode: e.target.value as ResizeMode })}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-banana"
            >
              <option value="none">None (Keep Original Size)</option>
              <option value="edge">Resize by Edge (Width/Height)</option>
              <option value="percentage">Resize by Percentage</option>
              <option value="megapixel">Resize by Megapixels</option>
            </select>
          </div>

          {/* Resize Options */}
          {editedConfig.resize.mode === 'edge' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={editedConfig.resize.width || ''}
                  onChange={(e) => updateResize({ width: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-banana"
                  placeholder="Auto"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={editedConfig.resize.height || ''}
                  onChange={(e) => updateResize({ height: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-banana"
                  placeholder="Auto"
                />
              </div>
            </div>
          )}

          {editedConfig.resize.mode === 'percentage' && (
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Scale Percentage ({editedConfig.resize.percentage || 100}%)
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={editedConfig.resize.percentage || 100}
                onChange={(e) => updateResize({ percentage: parseInt(e.target.value) })}
                className="w-full accent-banana"
              />
            </div>
          )}

          {editedConfig.resize.mode === 'megapixel' && (
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Megapixels
              </label>
              <input
                type="number"
                step="0.1"
                value={editedConfig.resize.megapixels || ''}
                onChange={(e) => updateResize({ megapixels: parseFloat(e.target.value) || undefined })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-banana"
                placeholder="e.g., 12"
              />
            </div>
          )}

          {editedConfig.resize.mode !== 'none' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="maintainAspectRatio"
                checked={editedConfig.resize.maintainAspectRatio}
                onChange={(e) => updateResize({ maintainAspectRatio: e.target.checked })}
                className="w-4 h-4 accent-banana"
              />
              <label htmlFor="maintainAspectRatio" className="text-white/80 text-sm">
                Maintain Aspect Ratio
              </label>
            </div>
          )}

          {/* PPI, Color Space, Bit Depth */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                PPI
              </label>
              <input
                type="number"
                value={editedConfig.ppi}
                onChange={(e) => updateConfig({ ppi: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-banana"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Color Space
              </label>
              <select
                value={editedConfig.colorSpace}
                onChange={(e) => updateConfig({ colorSpace: e.target.value as ColorSpace })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-banana"
              >
                <option value="srgb">sRGB</option>
                <option value="adobe-rgb">Adobe RGB</option>
                <option value="display-p3">Display P3</option>
                <option value="prophoto-rgb">ProPhoto RGB</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Bit Depth
              </label>
              <select
                value={editedConfig.bitDepth}
                onChange={(e) => updateConfig({ bitDepth: parseInt(e.target.value) as BitDepth })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-banana"
              >
                <option value="8">8-bit</option>
                <option value="16">16-bit</option>
                <option value="32">32-bit</option>
              </select>
            </div>
          </div>

          {/* Output Sharpening */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Output Sharpening
            </label>
            <select
              value={editedConfig.outputSharpening}
              onChange={(e) => updateConfig({ outputSharpening: e.target.value as OutputSharpening })}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-banana"
            >
              <option value="none">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Background */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Background
            </label>
            <select
              value={editedConfig.background}
              onChange={(e) => updateConfig({ background: e.target.value as BackgroundType })}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-banana"
            >
              <option value="transparent">Transparent</option>
              <option value="white">White</option>
              <option value="black">Black</option>
              <option value="custom">Custom Color</option>
            </select>

            {editedConfig.background === 'custom' && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={editedConfig.customBackgroundColor || '#FFFFFF'}
                  onChange={(e) => updateConfig({ customBackgroundColor: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={editedConfig.customBackgroundColor || '#FFFFFF'}
                  onChange={(e) => updateConfig({ customBackgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-banana"
                  placeholder="#FFFFFF"
                />
              </div>
            )}
          </div>

          {/* Filename Template */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Filename Template
            </label>
            <input
              type="text"
              value={editedConfig.filenameTemplate}
              onChange={(e) => updateConfig({ filenameTemplate: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-banana"
              placeholder="{name}-{date}-{time}"
            />
            <div className="mt-2 p-3 bg-white/5 rounded-lg">
              <div className="flex items-start gap-2 text-white/60 text-xs">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Available tokens:</p>
                  <p>{'{name}'} - Base filename • {'{date}'} - Current date • {'{time}'} - Current time</p>
                  <p>{'{format}'} - Export format • {'{width}'} / {'{height}'} - Dimensions</p>
                  <p>{'{preset}'} - Preset name • {'{index}'} - Sequential number</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-black/20">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-banana text-gray-900 font-semibold rounded-lg hover:bg-banana-light transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
