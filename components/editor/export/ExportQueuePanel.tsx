// components/editor/export/ExportQueuePanel.tsx
'use client';

import { 
  Trash2, CheckCircle, XCircle, Clock, Loader2, 
  Download, FileImage, AlertCircle 
} from 'lucide-react';
import { useExportQueue } from '@/context/export-queue-context';
import { downloadBlob } from '@/services/export-service';

export default function ExportQueuePanel() {
  const { jobs, isProcessing, removeJob, clearCompleted, clearAll } = useExportQueue();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-banana animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-white/40" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'processing':
        return 'Processing...';
      default:
        return 'Pending';
    }
  };

  const handleDownload = (job: { result?: Blob; filename?: string }) => {
    if (job.result && job.filename) {
      downloadBlob(job.result, job.filename);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileImage className="h-16 w-16 text-white/30 mb-4" />
        <h3 className="text-xl font-semibold text-white/80 mb-2">Export Queue is Empty</h3>
        <p className="text-white/60 max-w-md">
          Add presets or custom configurations to the queue to export your image in multiple formats
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Queue Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Export Queue ({jobs.length} {jobs.length === 1 ? 'item' : 'items'})
          </h3>
          <p className="text-white/60 text-sm mt-1">
            {isProcessing 
              ? 'Processing exports...' 
              : `${jobs.filter(j => j.status === 'pending').length} pending`
            }
          </p>
        </div>
        <div className="flex gap-2">
          {jobs.some(j => j.status === 'completed') && (
            <button
              onClick={clearCompleted}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-sm rounded-lg transition-colors"
            >
              Clear Completed
            </button>
          )}
          {jobs.length > 0 && !isProcessing && (
            <button
              onClick={clearAll}
              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-2">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Status Icon */}
              <div className="flex-shrink-0 pt-1">
                {getStatusIcon(job.status)}
              </div>

              {/* Job Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">
                      {job.config.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-white/60">
                      <span className="uppercase">{job.config.format}</span>
                      <span>•</span>
                      <span>{job.config.quality}%</span>
                      {job.config.resize.mode !== 'none' && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{job.config.resize.mode}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {job.status === 'completed' && job.result && (
                      <button
                        onClick={() => handleDownload(job)}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                        title="Download again"
                      >
                        <Download className="h-4 w-4 text-white/70" />
                      </button>
                    )}
                    {job.status !== 'processing' && (
                      <button
                        onClick={() => removeJob(job.id)}
                        className="p-2 hover:bg-red-500/20 rounded transition-colors"
                        title="Remove from queue"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status & Progress */}
                <div className="mt-3">
                  {job.status === 'processing' ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span>Processing...</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-banana transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`
                        ${job.status === 'completed' ? 'text-green-400' : ''}
                        ${job.status === 'failed' ? 'text-red-400' : ''}
                        ${job.status === 'pending' ? 'text-white/60' : ''}
                      `}>
                        {getStatusText(job.status)}
                      </span>
                      {job.status === 'completed' && job.filename && (
                        <>
                          <span className="text-white/40">•</span>
                          <span className="text-white/60 truncate">{job.filename}</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {job.status === 'failed' && job.error && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-400">{job.error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      {jobs.length > 0 && (
        <div className="grid grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">
              {jobs.filter(j => j.status === 'pending').length}
            </div>
            <div className="text-xs text-white/60 mt-1">Pending</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <div className="text-2xl font-bold text-banana">
              {jobs.filter(j => j.status === 'processing').length}
            </div>
            <div className="text-xs text-white/60 mt-1">Processing</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">
              {jobs.filter(j => j.status === 'completed').length}
            </div>
            <div className="text-xs text-white/60 mt-1">Completed</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-400">
              {jobs.filter(j => j.status === 'failed').length}
            </div>
            <div className="text-xs text-white/60 mt-1">Failed</div>
          </div>
        </div>
      )}
    </div>
  );
}
