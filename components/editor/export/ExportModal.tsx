// components/editor/export/ExportModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, Download, Settings, Layers, Image as ImageIcon,
  FileImage, Briefcase, Printer, Instagram, Smartphone, Save, Play
} from 'lucide-react';
import { ExportConfig, ExportPreset, ImageAdjustments } from '@/types/export';
import { createDefaultExportConfig, DEFAULT_PRESETS } from '@/services/export-service';
import { useExportQueue } from '@/context/export-queue-context';
import ExportConfigEditor from './ExportConfigEditor';
import ExportQueuePanel from './ExportQueuePanel';

type ExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  adjustments: ImageAdjustments;
};

const PRESET_ICONS: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="h-5 w-5" />,
  Smartphone: <Smartphone className="h-5 w-5" />,
  Briefcase: <Briefcase className="h-5 w-5" />,
  Printer: <Printer className="h-5 w-5" />,
};

export default function ExportModal({ 
  isOpen, 
  onClose, 
  imageUrl, 
  adjustments 
}: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'queue'>('presets');
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset | null>(null);
  const [customConfigs, setCustomConfigs] = useState<ExportConfig[]>([]);
  const [editingConfig, setEditingConfig] = useState<ExportConfig | null>(null);
  const { jobs, isProcessing, addJob, addJobs, startProcessing } = useExportQueue();

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('presets');
      setSelectedPreset(null);
      setEditingConfig(null);
    }
  }, [isOpen]);

  const handlePresetSelect = (preset: ExportPreset) => {
    if (!imageUrl) return;
    setSelectedPreset(preset);
  };

  const handleExportPreset = () => {
    if (!imageUrl || !selectedPreset) return;
    addJobs(selectedPreset.configs, imageUrl, adjustments);
    setActiveTab('queue');
  };

  const handleAddCustomConfig = () => {
    const newConfig = createDefaultExportConfig();
    setCustomConfigs(prev => [...prev, newConfig]);
    setEditingConfig(newConfig);
  };

  const handleUpdateConfig = (config: ExportConfig) => {
    setCustomConfigs(prev => 
      prev.map(c => c.id === config.id ? config : c)
    );
    setEditingConfig(null);
  };

  const handleDeleteConfig = (configId: string) => {
    setCustomConfigs(prev => prev.filter(c => c.id !== configId));
    if (editingConfig?.id === configId) {
      setEditingConfig(null);
    }
  };

  const handleExportCustom = () => {
    if (!imageUrl || customConfigs.length === 0) return;
    addJobs(customConfigs, imageUrl, adjustments);
    setActiveTab('queue');
  };

  const handleStartExport = async () => {
    await startProcessing();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/50 to-violet-800/50 rounded-xl border border-white/10 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-banana/20 rounded-lg">
              <Download className="h-6 w-6 text-banana" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Export Image</h2>
              <p className="text-white/60 text-sm">Configure and export your image</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white/70" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-black/20">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-banana text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            Presets
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-banana text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Settings className="h-4 w-4" />
            Custom
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'queue'
                ? 'border-banana text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <FileImage className="h-4 w-4" />
            Queue
            {jobs.length > 0 && (
              <span className="px-2 py-0.5 bg-banana text-gray-900 text-xs font-bold rounded-full">
                {jobs.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!imageUrl ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ImageIcon className="h-16 w-16 text-white/30 mb-4" />
              <p className="text-white/70 text-lg">No image available to export</p>
              <p className="text-white/50 text-sm mt-2">Please generate or upload an image first</p>
            </div>
          ) : (
            <>
              {/* Presets Tab */}
              {activeTab === 'presets' && (
                <div className="space-y-6">
                  <p className="text-white/70">Select a preset to quickly export for common platforms</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DEFAULT_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset)}
                        className={`p-5 rounded-xl border-2 transition-all text-left ${
                          selectedPreset?.id === preset.id
                            ? 'border-banana bg-banana/10'
                            : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                            selectedPreset?.id === preset.id
                              ? 'bg-banana/20 text-banana'
                              : 'bg-white/10 text-white/70'
                          }`}>
                            {PRESET_ICONS[preset.icon] || <FileImage className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {preset.name}
                            </h3>
                            <p className="text-white/60 text-sm">
                              {preset.description}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {preset.configs.map((config) => (
                                <span
                                  key={config.id}
                                  className="px-2 py-1 bg-white/10 rounded text-xs text-white/70"
                                >
                                  {config.format.toUpperCase()} {config.quality}%
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedPreset && (
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={handleExportPreset}
                        className="px-6 py-3 bg-banana text-gray-900 font-semibold rounded-lg hover:bg-banana-light transition-colors flex items-center gap-2"
                      >
                        <Plus className="h-5 w-5" />
                        Add to Queue
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Tab */}
              {activeTab === 'custom' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-white/70">Create custom export configurations</p>
                    <button
                      onClick={handleAddCustomConfig}
                      className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Configuration
                    </button>
                  </div>

                  {customConfigs.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-xl">
                      <Settings className="h-12 w-12 text-white/30 mx-auto mb-3" />
                      <p className="text-white/60">No custom configurations yet</p>
                      <p className="text-white/40 text-sm mt-1">Click "Add Configuration" to create one</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customConfigs.map((config) => (
                        <div
                          key={config.id}
                          className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{config.name}</h4>
                              <p className="text-white/60 text-sm mt-1">
                                {config.format.toUpperCase()} • {config.quality}% • {config.resize.mode}
                                {config.resize.width && config.resize.height && 
                                  ` • ${config.resize.width}x${config.resize.height}`
                                }
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingConfig(config)}
                                className="p-2 hover:bg-white/10 rounded transition-colors"
                              >
                                <Settings className="h-4 w-4 text-white/70" />
                              </button>
                              <button
                                onClick={() => handleDeleteConfig(config.id)}
                                className="p-2 hover:bg-red-500/20 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {customConfigs.length > 0 && (
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={handleExportCustom}
                        className="px-6 py-3 bg-banana text-gray-900 font-semibold rounded-lg hover:bg-banana-light transition-colors flex items-center gap-2"
                      >
                        <Plus className="h-5 w-5" />
                        Add to Queue
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Queue Tab */}
              {activeTab === 'queue' && (
                <ExportQueuePanel />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-black/20">
          <div className="text-white/60 text-sm">
            {jobs.length > 0 && (
              <span>
                {jobs.filter(j => j.status === 'completed').length} of {jobs.length} completed
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors"
            >
              Close
            </button>
            {jobs.length > 0 && !isProcessing && (
              <button
                onClick={handleStartExport}
                className="px-6 py-2 bg-banana text-gray-900 font-semibold rounded-lg hover:bg-banana-light transition-colors flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start Export
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Config Editor Modal */}
      {editingConfig && (
        <ExportConfigEditor
          config={editingConfig}
          onSave={handleUpdateConfig}
          onClose={() => setEditingConfig(null)}
        />
      )}
    </div>
  );
}
