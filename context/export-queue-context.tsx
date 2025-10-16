// context/export-queue-context.tsx
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ExportJob, ExportConfig, ImageAdjustments } from '@/types/export';
import { processExportJob, generateFilename, downloadBlob } from '@/services/export-service';
import { v4 as uuidv4 } from 'uuid';
import { NotificationContainer } from '@/components/ui/notification';
import { useNotifications } from '@/hooks/use-notifications';

type ExportQueueContextType = {
  jobs: ExportJob[];
  isProcessing: boolean;
  addJob: (config: ExportConfig, imageUrl: string, adjustments: ImageAdjustments) => void;
  addJobs: (configs: ExportConfig[], imageUrl: string, adjustments: ImageAdjustments) => void;
  removeJob: (jobId: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  startProcessing: () => Promise<void>;
};

const ExportQueueContext = createContext<ExportQueueContextType | undefined>(undefined);

export function ExportQueueProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { notifications, removeNotification, success, error: notifyError } = useNotifications();

  const addJob = useCallback((config: ExportConfig, imageUrl: string, adjustments: ImageAdjustments) => {
    const job: ExportJob = {
      id: uuidv4(),
      config,
      imageUrl,
      adjustments,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    };
    
    setJobs(prev => [...prev, job]);
  }, []);

  const addJobs = useCallback((configs: ExportConfig[], imageUrl: string, adjustments: ImageAdjustments) => {
    const newJobs = configs.map(config => ({
      id: uuidv4(),
      config,
      imageUrl,
      adjustments,
      status: 'pending' as const,
      progress: 0,
      createdAt: new Date(),
    }));
    
    setJobs(prev => [...prev, ...newJobs]);
  }, []);

  const removeJob = useCallback((jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  }, []);

  const clearCompleted = useCallback(() => {
    setJobs(prev => prev.filter(job => job.status !== 'completed'));
  }, []);

  const clearAll = useCallback(() => {
    setJobs([]);
  }, []);

  const startProcessing = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const pendingJobs = jobs.filter(job => job.status === 'pending');
      
      if (pendingJobs.length === 0) {
        setIsProcessing(false);
        return;
      }

      let completedCount = 0;
      let failedCount = 0;
      
      for (let i = 0; i < pendingJobs.length; i++) {
        const job = pendingJobs[i];
        
        // Update job status to processing
        setJobs(prev => prev.map(j => 
          j.id === job.id 
            ? { ...j, status: 'processing' as const, progress: 0 }
            : j
        ));
        
        try {
          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setJobs(prev => prev.map(j => 
              j.id === job.id && j.progress < 90
                ? { ...j, progress: j.progress + 10 }
                : j
            ));
          }, 100);
          
          // Process the export
          const blob = await processExportJob(job);
          
          clearInterval(progressInterval);
          
          // Generate filename
          const now = new Date();
          const tokens = {
            name: 'export',
            date: now.toISOString().split('T')[0],
            time: now.toTimeString().split(' ')[0].replace(/:/g, '-'),
            format: job.config.format,
            width: '0',
            height: '0',
            preset: job.config.name.toLowerCase().replace(/\s+/g, '-'),
            index: (i + 1).toString().padStart(3, '0'),
          };
          
          const filename = generateFilename(
            job.config.filenameTemplate,
            tokens,
            job.config.format
          );
          
          // Auto-download the result
          downloadBlob(blob, filename);
          
          // Update job status to completed
          setJobs(prev => prev.map(j => 
            j.id === job.id 
              ? { 
                  ...j, 
                  status: 'completed' as const, 
                  progress: 100,
                  result: blob,
                  filename,
                  completedAt: new Date()
                }
              : j
          ));
          
          completedCount++;
        } catch (error) {
          console.error('Export failed:', error);
          
          // Update job status to failed
          setJobs(prev => prev.map(j => 
            j.id === job.id 
              ? { 
                  ...j, 
                  status: 'failed' as const,
                  error: error instanceof Error ? error.message : 'Unknown error',
                  completedAt: new Date()
                }
              : j
          ));
          
          failedCount++;
          notifyError('Export Failed', `Failed to export ${job.config.name}`);
        }
      }
      
      // Show completion notification
      if (completedCount > 0) {
        success(
          'Export Complete',
          `Successfully exported ${completedCount} ${completedCount === 1 ? 'image' : 'images'}`
        );
      }
    } finally {
      setIsProcessing(false);
    }
  }, [jobs, isProcessing, success, notifyError]);

  const value = {
    jobs,
    isProcessing,
    addJob,
    addJobs,
    removeJob,
    clearCompleted,
    clearAll,
    startProcessing,
  };

  return (
    <ExportQueueContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
    </ExportQueueContext.Provider>
  );
}

export const useExportQueue = () => {
  const context = useContext(ExportQueueContext);
  
  if (context === undefined) {
    throw new Error('useExportQueue must be used within an ExportQueueProvider');
  }
  
  return context;
};
