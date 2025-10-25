// app/editor/EditorClientPage.tsx
'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type React from 'react';
import { useEditor } from '@/context/EditorContext';
import {
  Upload, Sparkles, Sliders, Download, Image as ImageIcon,
  Grid, ChevronLeft, ChevronRight, Undo, Redo, Save, Share2,
  Maximize2, Camera, Scissors, Plus, Home
} from 'lucide-react';
import { StoredImage } from '@/types/editor';
import { TemplateData } from '@/types/templates';
import { ImageAdjustments } from '@/types/adjustments';
import { generateImageWithGemini } from '@/services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { useHistory, createAdjustmentsChangeOp, createStateSetterOp } from '@/context/history-context';

// Supabase integration
import { useAuth } from '@/context/auth-context';
import { persistPrimaryImage, persistGeneratedImage, persistReferenceImage, appendProjectEvent, updateProject } from '@/services/project-service';
import { buildLocalProjectSnapshot, saveLocalProject, appendLocalProjectEvent, listLocalProjects, appendLocalProjectRevision, updateLocalProject } from '@/services/local-projects';
import type { LocalProjectRevision } from '@/services/local-projects';

// Components
import ImageUploader from '@/components/editor/upload/ImageUploader';
import PromptInput from '@/components/editor/ai-prompt/PromptInput';
import TemplatesGrid from '@/components/editor/templates/TemplatesGrid';
import AdjustmentControls from '@/components/editor/adjustments/AdjustmentControls';
import FiltersPanel from '@/components/editor/filters/FiltersPanel';
import ImageComparison from '@/components/editor/canvas/ImageComparison';
import FloatingLassoButton from '@/components/editor/canvas/FloatingLassoButton';
import FloatingSketchButton from '@/components/editor/canvas/FloatingSketchButton';
import ExportModal from '@/components/editor/export/ExportModal';
import LassoSelectionTool from '@/components/editor/canvas/LassoSelectionTool';
import SketchTool from '@/components/editor/canvas/SketchTool';
import AreaEditModal from '@/components/editor/canvas/AreaEditModal';
import FunnyLoading from '@/components/animations/FunnyLoading';
import Alert from '@/components/shared/Alert';

type EditorTab = 'upload' | 'prompt' | 'templates' | 'adjust' | 'filters';

export default function EditorClientPage() {
  // Get editor context
  const {
    primaryImage,
    setPrimaryImage,
    generatedImage,
    setGeneratedImage,
    referenceImages,
    setReferenceImages,
    adjustments,
    setAdjustments,
    currentFilter,
    setCurrentFilter,
    prompt,
    setPrompt,
    projectId,
    setProjectId,
    getDisplayImage,
    getImageForProcessing,
    resetEditor,
  } = useEditor();
  
  // Local state
  const [activeTab, setActiveTab] = useState<EditorTab>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { push, undo, redo, isUndoAvailable, isRedoAvailable, clear, past } = useHistory();
  const { user } = useAuth();
  
  // Lasso selection state
  const [showLassoTool, setShowLassoTool] = useState(false);
  const [showAreaEditModal, setShowAreaEditModal] = useState(false);
  const [selectionData, setSelectionData] = useState<{
    imageData: string;
    maskImage: string;
    boundingBox: { x: number; y: number; width: number; height: number };
  } | null>(null);

  // Sketch tool state
  const [showSketchTool, setShowSketchTool] = useState(false);

  // If editing a local snapshot (?local=...), record detailed revisions into local storage
  const [localEditingId, setLocalEditingId] = useState<string | null>(null);

  // History is managed via HistoryContext; pushes occur in action handlers.

  const handleUndo = () => {
    undo();
  };
  
  const handleRedo = () => {
    redo();
  };

  // Keyboard shortcuts: Undo/Redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;

      const key = e.key.toLowerCase();

      // Cmd/Ctrl+Shift+Z -> Redo
      if (key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }

      // Cmd/Ctrl+Z -> Undo
      if (key === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Y (Windows/Linux) -> Redo
      if (!isMac && key === 'y') {
        e.preventDefault();
        redo();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // Initialize project from query param
  const searchParams = useSearchParams();
  useEffect(() => {
    const pid = searchParams.get('project');
    if (pid) {
      setProjectId(pid);
    }
  }, [searchParams, setProjectId]);

  // Hydrate from local snapshot if ?local=<id>
  useEffect(() => {
    const localId = searchParams.get('local');
    if (!localId) return;
    try {
      const snap = listLocalProjects().find(p => p.id === localId);
      if (snap) {
        setLocalEditingId(localId);
        if (snap.primaryImage) setPrimaryImage(snap.primaryImage);
        if (snap.generatedImage) setGeneratedImage(snap.generatedImage);
        setReferenceImages(snap.referenceImages || []);
        setPrompt(snap.prompt || '');
        if (snap.adjustments) setAdjustments(snap.adjustments);
        if (snap.filter) setCurrentFilter(snap.filter);
        setActiveTab(snap.primaryImage ? 'prompt' : 'upload');
      }
    } catch (e) {
      console.warn('Failed to hydrate from local project:', e);
    }
  }, [searchParams, setPrimaryImage, setGeneratedImage, setReferenceImages, setPrompt, setAdjustments, setCurrentFilter]);

  // Local revisions: mapper for history actions -> revision types
  const mapHistoryActionToRevisionType = (action?: string | null): LocalProjectRevision['type'] | null => {
    switch (action) {
      case 'set_primary_image': return 'set_primary_image';
      case 'upload_reference': return 'upload_reference';
      case 'image_generation': return 'image_generation';
      case 'sketch_generation': return 'sketch_generation';
      case 'area_edit_generation': return 'area_edit_generation';
      case 'adjustments_change': return 'adjustments_change';
      case 'filter_apply': return 'filter_apply';
      default: return null;
    }
  };

  // Helper: append a detailed local revision snapshot for the current localEditingId
  const recordLocalRevision = (
    type: LocalProjectRevision['type'],
    label: string,
    payload?: Record<string, unknown> | null,
  ) => {
    if (!localEditingId) return;
    try {
      appendLocalProjectRevision(localEditingId, {
        id: `rev-${uuidv4()}`,
        label,
        timestamp: Date.now(),
        type,
        snapshot: {
          primaryImage: primaryImage ?? null,
          generatedImage: generatedImage ?? null,
          referenceImages,
          prompt,
          adjustments,
          filter: currentFilter ?? null,
        },
        payload: payload ?? null,
      });
    } catch (e) {
      console.warn('Failed to append local revision:', e);
    }
  };

  // History-aware setters
  const applyAdjustments = (next: ImageAdjustments, label?: string) => {
    const prev = adjustments;
    if (JSON.stringify(prev) === JSON.stringify(next)) return;
    setAdjustments(next);
    push(createAdjustmentsChangeOp(prev, next, setAdjustments, label));
    recordLocalRevision('adjustments_change', label || 'Adjustments Change', { next });

    // Push adjustments to Supabase if a remote project is loaded
    if (user?.id && projectId) {
      void (async () => {
        try {
          const dataPayload: any = {
            prompt: prompt ?? null,
            adjustments: next,
            filter: currentFilter ?? null,
            references: (referenceImages || []).map(r => ({ id: r.id, name: r.name })),
          };
          await updateProject(projectId, { data: dataPayload as any });
        } catch (e) {
          console.warn('Adjustments remote update failed:', e);
        }
      })();
    }
  };

  const applyFilter = (filterId: string) => {
    const prevFilter = currentFilter;
    const applyFn = () => setCurrentFilter(filterId);
    const undoFn = () => setCurrentFilter(prevFilter);
    // Apply immediately then push op
    applyFn();
    push(createStateSetterOp('Filter Apply', 'filter_apply', applyFn, undoFn, { prev: prevFilter, next: filterId }, ['filters']));
    recordLocalRevision('filter_apply', 'Filter Apply', { prev: prevFilter, next: filterId });

    // Push filter change to Supabase if a remote project is loaded
    if (user?.id && projectId) {
      void (async () => {
        try {
          const dataPayload: any = {
            prompt: prompt ?? null,
            adjustments,
            filter: filterId,
            references: (referenceImages || []).map(r => ({ id: r.id, name: r.name })),
          };
          await updateProject(projectId, { data: dataPayload as any });
        } catch (e) {
          console.warn('Filter remote update failed:', e);
        }
      })();
    }
  };

  // Handlers
  const handlePrimaryImageUpload = async (image: StoredImage) => {
    const prev = primaryImage;
    const applyFn = () => setPrimaryImage(image);
    const undoFn = () => setPrimaryImage(prev);
    // Apply then push to history
    applyFn();
    push(createStateSetterOp('Set Primary Image', 'set_primary_image', applyFn, undoFn, { prev: prev?.url, next: image?.url }, ['images']));
    setActiveTab('prompt');

    // Record local revision
    recordLocalRevision('set_primary_image', 'Set Primary Image', { name: image?.name, size: image?.size });

    // Persist to Supabase storage if we have auth+project
    try {
      if (user?.id && projectId) {
        let primaryPublicUrl: string | null = null;
        if (image.url.startsWith('data:')) {
          const { publicUrl } = await persistPrimaryImage(image.url, user.id, projectId);
          primaryPublicUrl = publicUrl || null;
        } else if (image.url.startsWith('http')) {
          primaryPublicUrl = image.url;
        }
        await appendProjectEvent(projectId, { type: 'upload_primary', url: image.url, meta: { name: image.name, size: image.size } });
        // Set thumbnail to primary if no generated yet
        await updateProject(projectId, {
          thumbnail_url: primaryPublicUrl || null,
        });
      }
    } catch (e) {
      console.warn('Primary image persist failed:', e);
    }
  };

  const handleReferenceImageUpload = async (image: StoredImage) => {
    setReferenceImages([...referenceImages, image]);

    // Record local revision
    recordLocalRevision('upload_reference', 'Upload Reference', { name: image?.name, id: image?.id });

    // Persist to Supabase storage if available
    try {
      if (user?.id && projectId) {
        if (image.url.startsWith('data:')) {
          await persistReferenceImage(image.url, user.id, projectId, `${image.id}.png`);
        }
        await appendProjectEvent(projectId, { type: 'upload_reference', url: image.url, meta: { name: image.name, size: image.size } });
        // Update references array in project data
        const refs = [...referenceImages, image].map(r => ({ id: r.id, name: r.name }));
        const dataPayload: any = {
          prompt: prompt ?? null,
          adjustments: adjustments ?? null,
          filter: currentFilter ?? null,
          references: refs,
        };
        await updateProject(projectId, { data: dataPayload as any });
      }
    } catch (e) {
      console.warn('Reference image persist failed:', e);
    }
  };

  const handleTemplateSelect = async (template: TemplateData) => {
    if (!primaryImage) {
      setError('Please upload an image first');
      return;
    }

    setPrompt(template.prompt);
    await processImage(template.prompt);
  };

  const handlePromptSubmit = async () => {
    if (!prompt.trim() || !primaryImage) {
      setError('Please upload an image and enter a prompt');
      return;
    }
    await processImage(prompt);
  };

  const processImage = async (inputPrompt: string) => {
    // Use the latest edited image if available, otherwise use primary
    const imageToProcess = getImageForProcessing();
    
    if (!imageToProcess) {
      setError('No image available for processing');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await generateImageWithGemini({
        primaryImage: imageToProcess, // Use edited image for chaining
        referenceImages: referenceImages.map(img => img.url),
        prompt: inputPrompt,
      });

      if (result.success && result.generatedImage) {
        const prev = generatedImage;
        const nextImg = {
          id: uuidv4(),
          url: result.generatedImage,
          name: `edited-${primaryImage?.name || 'image'}`,
          createdAt: new Date(),
        } as StoredImage;
        const applyFn = () => setGeneratedImage(nextImg);
        const undoFn = () => setGeneratedImage(prev);
        applyFn();
        push(createStateSetterOp('Image Generation', 'image_generation', applyFn, undoFn, { prev: prev?.url, next: nextImg.url, prompt: inputPrompt }, ['ai', 'generation']));

        // Record local revision
        recordLocalRevision('image_generation', 'Image Generation', { prompt: inputPrompt });

        // Persist generated image to Supabase storage (keep local base64 for processing)
        try {
          if (user?.id && projectId) {
            let generatedPublicUrl: string | null = null;
            if (nextImg.url.startsWith('data:')) {
              const { publicUrl } = await persistGeneratedImage(nextImg.url, user.id, projectId, inputPrompt);
              generatedPublicUrl = publicUrl || null;
            } else if (nextImg.url.startsWith('http')) {
              generatedPublicUrl = nextImg.url;
            }
            const dataPayload: any = {
              prompt: inputPrompt ?? null,
              adjustments,
              filter: currentFilter ?? null,
              references: (referenceImages || []).map(r => ({ id: r.id, name: r.name })),
            };
            await updateProject(projectId, {
              data: dataPayload as any,
              thumbnail_url: generatedPublicUrl || null,
            });
          }
        } catch (e) {
          console.warn('Generated image persist failed:', e);
        }

        setActiveTab('adjust');
      } else {
        setError(result.error || 'Failed to generate image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

    // Create a new project and persist current project state to Supabase and update existing local snapshot (no duplicates)
    const handleNewProject = async () => {
      // Snapshot current editor state
      const prevPrimary = primaryImage;
      const prevGenerated = generatedImage;
      const prevReferences = [...referenceImages];
      const prevPrompt = prompt;
      const prevProjectId = projectId;
      const prevAdjustments = adjustments;
      const prevFilter = currentFilter;

      // Update an existing local snapshot instead of creating duplicates
      try {
        const nowEvent = { label: 'Saved locally before New Project', timestamp: Date.now(), action: 'save_before_new', payload: { projectId: prevProjectId } } as const;

        if (localEditingId) {
          // Update current local entry
          updateLocalProject(localEditingId, {
            primaryImage: prevPrimary ?? null,
            generatedImage: prevGenerated ?? null,
            referenceImages: prevReferences,
            prompt: prevPrompt ?? null,
            adjustments: prevAdjustments ?? null,
            filter: prevFilter ?? null,
            thumbnailDataUrl: prevGenerated?.url || prevPrimary?.url || null,
          });
          appendLocalProjectEvent(localEditingId, nowEvent as any);

          // Append history ops as revisions
          if (Array.isArray(past) && past.length > 0) {
            for (const op of past) {
              const type = mapHistoryActionToRevisionType(op.meta?.action) ?? 'initial_snapshot';
              appendLocalProjectRevision(localEditingId, {
                id: `rev-${uuidv4()}`,
                label: op.label,
                timestamp: op.timestamp,
                type,
                snapshot: {
                  primaryImage: prevPrimary ?? null,
                  generatedImage: prevGenerated ?? null,
                  referenceImages: prevReferences,
                  prompt: prevPrompt ?? null,
                  adjustments: prevAdjustments ?? null,
                  filter: prevFilter ?? null,
                },
                payload: op.meta?.payload ?? null,
              });
            }
          }
        } else {
          // Try to find a local entry linked to this remote project, else create one
          const existingLinked = prevProjectId
            ? listLocalProjects().find(lp => lp.remoteId === prevProjectId)
            : null;

          if (existingLinked) {
            updateLocalProject(existingLinked.id, {
              primaryImage: prevPrimary ?? null,
              generatedImage: prevGenerated ?? null,
              referenceImages: prevReferences,
              prompt: prevPrompt ?? null,
              adjustments: prevAdjustments ?? null,
              filter: prevFilter ?? null,
              thumbnailDataUrl: prevGenerated?.url || prevPrimary?.url || null,
              status: 'synced',
            });
            appendLocalProjectEvent(existingLinked.id, nowEvent as any);

            if (Array.isArray(past) && past.length > 0) {
              for (const op of past) {
                const type = mapHistoryActionToRevisionType(op.meta?.action) ?? 'initial_snapshot';
                appendLocalProjectRevision(existingLinked.id, {
                  id: `rev-${uuidv4()}`,
                  label: op.label,
                  timestamp: op.timestamp,
                  type,
                  snapshot: {
                    primaryImage: prevPrimary ?? null,
                    generatedImage: prevGenerated ?? null,
                    referenceImages: prevReferences,
                    prompt: prevPrompt ?? null,
                    adjustments: prevAdjustments ?? null,
                    filter: prevFilter ?? null,
                  },
                  payload: op.meta?.payload ?? null,
                });
              }
            }
          } else {
            const localId = `local-${uuidv4()}`;
            const name = prevGenerated?.name || prevPrimary?.name || 'Untitled Local Project';
            const snapshot = buildLocalProjectSnapshot({
              id: localId,
              name,
              primaryImage: prevPrimary ?? null,
              generatedImage: prevGenerated ?? null,
              referenceImages: prevReferences,
              prompt: prevPrompt ?? null,
              adjustments: prevAdjustments ?? null,
              filter: prevFilter ?? null,
              events: [nowEvent as any],
            });
            saveLocalProject(snapshot);
            // Link to remote if present and mark synced
            if (prevProjectId) {
              updateLocalProject(localId, { remoteId: prevProjectId, status: 'synced' });
            }
          }
        }
      } catch (e) {
        console.warn('Local snapshot update before New Project failed:', e);
      }

      // Immediately clear editor state
      resetEditor();
      setShowLassoTool(false);
      setShowSketchTool(false);
      setSelectionData(null);
      setActiveTab('upload');
      setIsSidebarCollapsed(false);
      setError(null);
      clear();

      try {
        // Best-effort remote persistence of previous artifacts and editor state
        if (user?.id && prevProjectId) {
          let primaryPublicUrl: string | null = null;
          let generatedPublicUrl: string | null = null;

          if (prevPrimary?.url) {
            if (prevPrimary.url.startsWith('data:')) {
              const { publicUrl } = await persistPrimaryImage(prevPrimary.url, user.id, prevProjectId);
              primaryPublicUrl = publicUrl || null;
            } else if (prevPrimary.url.startsWith('http')) {
              primaryPublicUrl = prevPrimary.url;
            }
          }
          if (prevGenerated?.url) {
            if (prevGenerated.url.startsWith('data:')) {
              const { publicUrl } = await persistGeneratedImage(prevGenerated.url, user.id, prevProjectId, prevPrompt);
              generatedPublicUrl = publicUrl || null;
            } else if (prevGenerated.url.startsWith('http')) {
              generatedPublicUrl = prevGenerated.url;
            }
          }
          for (const ref of prevReferences) {
            if (ref.url.startsWith('data:')) {
              await persistReferenceImage(ref.url, user.id, prevProjectId, `${ref.id}.png`);
            }
          }

          // Update JSON data and thumbnail on project row
          const dataPayload: any = {
            prompt: prevPrompt ?? null,
            adjustments: prevAdjustments ?? null,
            filter: prevFilter ?? null,
            references: prevReferences.map(r => ({ id: r.id, name: r.name })),
          };
          await updateProject(prevProjectId, {
            data: dataPayload as any,
            thumbnail_url: generatedPublicUrl || primaryPublicUrl || null,
            primary_image_url: primaryPublicUrl ?? undefined,
            generated_image_url: generatedPublicUrl ?? undefined,
          });

          await appendProjectEvent(prevProjectId, { type: 'update', prompt: prevPrompt, meta: { action: 'save_before_new' } });
        }

        // Create a new remote project to continue
        const res = await fetch('/api/projects/new', { method: 'POST' });
        const json = await res.json();

        if (json?.id) {
          setProjectId(json.id);
          router.push(`/editor?project=${json.id}`);
        } else {
          setError('Failed to create new project');
        }
      } catch (err) {
        console.error('handleNewProject error:', err);
        setError('Failed to create new project');
      }
    };

  const handleExport = () => {
    if (!generatedImage && !primaryImage) {
      setError('No image to export');
      return;
    }
    // Redirect to new export page
    router.push('/editor/export');
  };

  // Save or update a local snapshot when exiting the editor (no duplicate local entries) and push state to Supabase
  const saveSnapshotIfPresent = async (reasonLabel: string) => {
    // Only save if we have something meaningful
    const hasPrimary = !!primaryImage;
    const hasGenerated = !!generatedImage;
    const hasRefs = (referenceImages || []).length > 0;
    const hasPromptOrState = !!prompt || !!adjustments || !!currentFilter;

    if (!hasPrimary && !hasGenerated && !hasRefs && !hasPromptOrState) {
      return; // nothing to save
    }

    try {
      const nowEvent = { label: reasonLabel, timestamp: Date.now(), action: 'save_on_exit', payload: projectId ? { projectId } : undefined } as const;

      if (localEditingId) {
        // Update the existing local entry being edited
        updateLocalProject(localEditingId, {
          primaryImage: primaryImage ?? null,
          generatedImage: generatedImage ?? null,
          referenceImages,
          prompt: prompt ?? null,
          adjustments: adjustments ?? null,
          filter: currentFilter ?? null,
          thumbnailDataUrl: generatedImage?.url || primaryImage?.url || null,
        });
        appendLocalProjectEvent(localEditingId, nowEvent as any);

        if (Array.isArray(past) && past.length > 0) {
          for (const op of past) {
            const type = mapHistoryActionToRevisionType(op.meta?.action) ?? 'initial_snapshot';
            appendLocalProjectRevision(localEditingId, {
              id: `rev-${uuidv4()}`,
              label: op.label,
              timestamp: op.timestamp,
              type,
              snapshot: {
                primaryImage: primaryImage ?? null,
                generatedImage: generatedImage ?? null,
                referenceImages,
                prompt: prompt ?? null,
                adjustments: adjustments ?? null,
                filter: currentFilter ?? null,
              },
              payload: op.meta?.payload ?? null,
            });
          }
        }
      } else {
        // Try to find a local entry linked to this remote project
        const existingLinked = projectId
          ? listLocalProjects().find(lp => lp.remoteId === projectId)
          : null;

        if (existingLinked) {
          updateLocalProject(existingLinked.id, {
            primaryImage: primaryImage ?? null,
            generatedImage: generatedImage ?? null,
            referenceImages,
            prompt: prompt ?? null,
            adjustments: adjustments ?? null,
            filter: currentFilter ?? null,
            thumbnailDataUrl: generatedImage?.url || primaryImage?.url || null,
            status: 'synced',
          });
          appendLocalProjectEvent(existingLinked.id, nowEvent as any);

          if (Array.isArray(past) && past.length > 0) {
            for (const op of past) {
              const type = mapHistoryActionToRevisionType(op.meta?.action) ?? 'initial_snapshot';
              appendLocalProjectRevision(existingLinked.id, {
                id: `rev-${uuidv4()}`,
                label: op.label,
                timestamp: op.timestamp,
                type,
                snapshot: {
                  primaryImage: primaryImage ?? null,
                  generatedImage: generatedImage ?? null,
                  referenceImages,
                  prompt: prompt ?? null,
                  adjustments: adjustments ?? null,
                  filter: currentFilter ?? null,
                },
                payload: op.meta?.payload ?? null,
              });
            }
          }
        } else {
          // Create a new local entry and link it to remote if available
          const localId = `local-${uuidv4()}`;
          const name = generatedImage?.name || primaryImage?.name || 'Untitled Local Project';
          const snapshot = buildLocalProjectSnapshot({
            id: localId,
            name,
            primaryImage: primaryImage ?? null,
            generatedImage: generatedImage ?? null,
            referenceImages,
            prompt: prompt ?? null,
            adjustments: adjustments ?? null,
            filter: currentFilter ?? null,
            events: [nowEvent as any],
          });
          saveLocalProject(snapshot);
          if (projectId) {
            updateLocalProject(localId, { remoteId: projectId, status: 'synced' });
          }

          if (Array.isArray(past) && past.length > 0) {
            for (const op of past) {
              const type = mapHistoryActionToRevisionType(op.meta?.action) ?? 'initial_snapshot';
              appendLocalProjectRevision(localId, {
                id: `rev-${uuidv4()}`,
                label: op.label,
                timestamp: op.timestamp,
                type,
                snapshot: {
                  primaryImage: primaryImage ?? null,
                  generatedImage: generatedImage ?? null,
                  referenceImages,
                  prompt: prompt ?? null,
                  adjustments: adjustments ?? null,
                  filter: currentFilter ?? null,
                },
                payload: op.meta?.payload ?? null,
              });
            }
          }
        }
      }

      // Also push state to Supabase for remote project
      if (user?.id && projectId) {
        let primaryPublicUrl: string | null = null;
        let generatedPublicUrl: string | null = null;

        if (primaryImage?.url) {
          if (primaryImage.url.startsWith('data:')) {
            const { publicUrl } = await persistPrimaryImage(primaryImage.url, user.id, projectId);
            primaryPublicUrl = publicUrl || null;
          } else if (primaryImage.url.startsWith('http')) {
            primaryPublicUrl = primaryImage.url;
          }
        }
        if (generatedImage?.url) {
          if (generatedImage.url.startsWith('data:')) {
            const { publicUrl } = await persistGeneratedImage(generatedImage.url, user.id, projectId, prompt);
            generatedPublicUrl = publicUrl || null;
          } else if (generatedImage.url.startsWith('http')) {
            generatedPublicUrl = generatedImage.url;
          }
        }
        for (const ref of referenceImages) {
          if (ref.url.startsWith('data:')) {
            await persistReferenceImage(ref.url, user.id, projectId, `${ref.id}.png`);
          }
        }

        const dataPayload: any = {
          prompt: prompt ?? null,
          adjustments: adjustments ?? null,
          filter: currentFilter ?? null,
          references: (referenceImages || []).map(r => ({ id: r.id, name: r.name })),
        };

        await updateProject(projectId, {
          data: dataPayload as any,
          thumbnail_url: generatedPublicUrl || primaryPublicUrl || null,
          primary_image_url: primaryPublicUrl ?? undefined,
          generated_image_url: generatedPublicUrl ?? undefined,
        });

        await appendProjectEvent(projectId, { type: 'update', prompt, meta: { action: 'save_on_exit' } });
      }
    } catch (e) {
      console.warn('Local snapshot save on exit failed:', e);
    }
  };

  const handleBackToDashboard = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    await saveSnapshotIfPresent('Saved locally before exiting Editor');
    router.push('/dashboard');
  };

  const handleLassoSelection = () => {
    if (!displayImage) {
      setError('Please upload an image first');
      return;
    }
    setShowLassoTool(true);
  };

  const handleSketchTool = () => {
    if (!displayImage) {
      setError('Please upload an image first');
      return;
    }
    console.log('🎨 Opening sketch tool with image:', {
      url: displayImage.url,
      name: displayImage.name,
      isDataURL: displayImage.url.startsWith('data:'),
      urlPreview: displayImage.url.substring(0, 100)
    });
    setShowSketchTool(true);
  };

  const handleSketchComplete = async (sketchedImage: string, sketchPrompt: string) => {
    setShowSketchTool(false);
    setIsProcessing(true);
    setError(null);

    try {
      // Create detailed prompt for sketch-based generation
      const detailedPrompt = `Using the red sketch marks as a guide, ${sketchPrompt}. The red lines indicate where and what shape to create. Make it look realistic and natural, blending perfectly with the rest of the image. Remove all red sketch marks in the final result.`;

      const result = await generateImageWithGemini({
        primaryImage: sketchedImage, // Send the sketched image
        referenceImages: referenceImages.map(img => img.url),
        prompt: detailedPrompt,
      });

      if (result.success && result.generatedImage) {
        const prev = generatedImage;
        const nextImg = {
          id: uuidv4(),
          url: result.generatedImage,
          name: `sketch-generated-${primaryImage?.name || 'image'}`,
          createdAt: new Date(),
        } as StoredImage;
        const applyFn = () => setGeneratedImage(nextImg);
        const undoFn = () => setGeneratedImage(prev);
        applyFn();
        push(createStateSetterOp('Sketch Generation', 'image_generation', applyFn, undoFn, { prev: prev?.url, next: nextImg.url, prompt: sketchPrompt }, ['ai', 'sketch']));

        // Record local revision
        recordLocalRevision('sketch_generation', 'Sketch Generation', { prompt: sketchPrompt });

        setActiveTab('adjust');
      } else {
        setError(result.error || 'Failed to generate from sketch');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectionComplete = (maskData: {
    imageData: string;
    maskImage: string;
    boundingBox: { x: number; y: number; width: number; height: number };
  }) => {
    setSelectionData(maskData);
    setShowLassoTool(false);
    setShowAreaEditModal(true);
  };

  const handleAreaEditSubmit = async (areaPrompt: string) => {
    if (!selectionData || !displayImage) return;

    setIsProcessing(true);
    setError(null);
    setShowAreaEditModal(false);

    try {
      // Create a detailed prompt for area-specific editing
      const { boundingBox } = selectionData;
      const detailedPrompt = `In this image, modify ONLY the selected area at position x:${Math.round(boundingBox.x)}, y:${Math.round(boundingBox.y)}, width:${Math.round(boundingBox.width)}, height:${Math.round(boundingBox.height)}. ${areaPrompt}. Keep all other parts of the image exactly the same. Do not change anything outside this specific area.`;

      const result = await generateImageWithGemini({
        primaryImage: displayImage.url,
        referenceImages: referenceImages.map(img => img.url),
        prompt: detailedPrompt,
      });

      if (result.success && result.generatedImage) {
        const prev = generatedImage;
        const nextImg = {
          id: uuidv4(),
          url: result.generatedImage,
          name: `area-edited-${primaryImage?.name || 'image'}`,
          createdAt: new Date(),
        } as StoredImage;
        const applyFn = () => setGeneratedImage(nextImg);
        const undoFn = () => setGeneratedImage(prev);
        applyFn();
        push(createStateSetterOp('Area Edit Generation', 'image_generation', applyFn, undoFn, { prev: prev?.url, next: nextImg.url, areaPrompt }, ['ai', 'area-edit']));

        // Record local revision
        recordLocalRevision('area_edit_generation', 'Area Edit Generation', { areaPrompt });

        setSelectionData(null);
      } else {
        setError(result.error || 'Failed to edit area');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const displayImage = getDisplayImage();

  // Layout constants for fixed sidebar/canvas
  const HEADER_HEIGHT = 64; // h-16
  const SIDEBAR_WIDTH = 380; // px
  const TOGGLE_COLLAPSED_GUTTER = 60; // px reserve for toggle visibility

  const sidebarStyle: CSSProperties = {
    position: 'fixed',
    left: 0,
    top: HEADER_HEIGHT,
    height: `calc(100vh - ${HEADER_HEIGHT}px)`,
    width: SIDEBAR_WIDTH,
    transform: isSidebarCollapsed ? `translateX(-${SIDEBAR_WIDTH}px)` : 'translateX(0)',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const canvasStyle: CSSProperties = {
    position: 'fixed',
    right: 0,
    top: HEADER_HEIGHT,
    height: `calc(100vh - ${HEADER_HEIGHT}px)`,
    left: isSidebarCollapsed ? TOGGLE_COLLAPSED_GUTTER : SIDEBAR_WIDTH,
    transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const toggleLeft = isSidebarCollapsed ? 0 : SIDEBAR_WIDTH;

  // Draggable Floating Action Buttons (Lasso and Sketch)
  const [lassoFabPos, setLassoFabPos] = useState<{ x: number; y: number }>({
    x: SIDEBAR_WIDTH + 20,
    y: HEADER_HEIGHT + 100
  });
  const [sketchFabPos, setSketchFabPos] = useState<{ x: number; y: number }>({
    x: SIDEBAR_WIDTH + 80,
    y: HEADER_HEIGHT + 100
  });
  const [draggingFab, setDraggingFab] = useState<'lasso' | 'sketch' | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleFabMouseDown = (id: 'lasso' | 'sketch', e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingFab(id);
    const pos = id === 'lasso' ? lassoFabPos : sketchFabPos;
    setDragOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingFab) return;
      const nextX = Math.min(Math.max(0, e.clientX - dragOffset.x), window.innerWidth - 64);
      const nextY = Math.min(Math.max(HEADER_HEIGHT + 8, e.clientY - dragOffset.y), window.innerHeight - 64);
      if (draggingFab === 'lasso') {
        setLassoFabPos({ x: nextX, y: nextY });
      } else {
        setSketchFabPos({ x: nextX, y: nextY });
      }
    };
    const onUp = () => setDraggingFab(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [draggingFab, dragOffset.x, dragOffset.y]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0a0a0f] text-white">
      {/* Premium Dotted Drawing Book Background */}
      <div className="fixed inset-0 z-0">
        {/* Soft gradient glows */}
        <div className="absolute top-0 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/15 via-fuchsia-500/10 to-transparent rounded-full blur-[140px] animate-float" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[900px] h-[900px] bg-gradient-to-tr from-blue-500/15 via-cyan-500/10 to-transparent rounded-full blur-[140px] animate-float-delayed" />
        {/* Dotted paper pattern */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)',
            backgroundSize: '22px 22px'
          }}
        />
        {/* Subtle paper grain */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'linear-gradient(0deg, rgba(255,255,255,0.04) 0.5px, transparent 0.5px)',
            backgroundSize: '100% 12px'
          }}
        />
      </div>

      {/* Loading Overlay */}
      {isProcessing && <FunnyLoading />}

      {/* Header - Premium Glass */}
      <header className="relative z-10 h-16 border-b border-white/10 backdrop-blur-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 flex items-center justify-between px-4 md:px-6">
        <Link href="/" className="group text-2xl font-bold flex items-center transition-all">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-banana to-yellow-400 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-banana to-yellow-400">TAP</span>
          </div>
          <span className="text-white ml-1">[IMAGINE]</span>
        </Link>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleUndo}
            disabled={!isUndoAvailable}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!isRedoAvailable}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group" title="Save">
            <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group" title="Share">
            <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>

          {/* Back to Dashboard */}
          <Link
            href="/dashboard"
            onClick={handleBackToDashboard}
            className="relative group/export ml-2 px-4 py-2.5 overflow-hidden rounded-xl"
            title="Back to Dashboard"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-white/20 rounded-xl blur opacity-50 group-hover/export:opacity-75 transition duration-200" />
            <div className="relative flex items-center gap-2 px-2 py-0.5 bg-white/10 rounded-lg text-white font-semibold transform group-hover/export:scale-105 transition-all duration-200">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </div>
          </Link>

          {/* New Project Button */}
          <button
            onClick={handleNewProject}
            className="relative group/export ml-2 px-4 py-2.5 overflow-hidden rounded-xl"
            title="New Project"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-banana via-yellow-400 to-orange-400 rounded-xl blur opacity-50 group-hover/export:opacity-75 transition duration-200 animate-gradient-x" />
            <div className="relative flex items-center gap-2 px-2 py-0.5 bg-gradient-to-r from-banana to-yellow-400 rounded-lg text-gray-900 font-semibold transform group-hover/export:scale-105 transition-all duration-200">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Project</span>
            </div>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="relative group/export ml-2 px-4 py-2.5 overflow-hidden rounded-xl"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-banana via-yellow-400 to-orange-400 rounded-xl blur opacity-50 group-hover/export:opacity-75 transition duration-200 animate-gradient-x" />
            <div className="relative flex items-center gap-2 px-2 py-0.5 bg-gradient-to-r from-banana to-yellow-400 rounded-lg text-gray-900 font-semibold transform group-hover/export:scale-105 transition-all duration-200">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </div>
          </button>
        </div>
      </header>
      
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Sidebar Toggle - Fixed edge control */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`${isSidebarCollapsed ? 'rounded-r-2xl border-r-0' : 'rounded-l-2xl border-l-0'} fixed z-20 w-[44px] h-[100px] flex items-center justify-center shadow-xl border transition-all duration-300 hover:scale-105`}
          style={{
            left: toggleLeft,
            top: `calc(${HEADER_HEIGHT}px + 50vh)`,
            transform: 'translateY(-50%)',
            backdropFilter: 'blur(20px)',
            background: 'rgba(30, 30, 45, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
          }}
          aria-label={isSidebarCollapsed ? 'Open sidebar' : 'Hide sidebar'}
          title={isSidebarCollapsed ? 'Open sidebar' : 'Hide sidebar'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-200" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-200" />
          )}
        </button>
        {/* Sidebar - Premium Glass */}
        <aside
          className="rounded-3xl ring-1 ring-white/10 backdrop-blur-2xl bg-[rgba(20,20,30,0.75)] flex flex-col overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
          style={sidebarStyle}
        >
          {/* Toggle moved to fixed edge control */}
          
          {/* Tabs - Premium Glass Tabs */}
          <div className="flex border-b border-white/10 overflow-x-auto bg-white/5">
            {[
              { id: 'upload' as EditorTab, icon: Upload, label: 'Upload' },
              { id: 'prompt' as EditorTab, icon: Sparkles, label: 'Prompt' },
              { id: 'templates' as EditorTab, icon: Grid, label: 'Templates' },
              { id: 'adjust' as EditorTab, icon: Sliders, label: 'Adjust' },
              { id: 'filters' as EditorTab, icon: ImageIcon, label: 'Filters' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative group flex-1 min-w-0 py-3 px-2 flex items-center justify-center transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-b from-white/15 to-white/10 border-b-2 border-banana shadow-lg'
                    : 'hover:bg-white/5'
                }`}
                aria-label={tab.label}
                title={tab.label}
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    {activeTab === tab.id && (
                      <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-banana/20 via-yellow-400/10 to-orange-400/20 blur-md" />
                    )}
                    <div
                      className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-banana to-yellow-400 text-gray-900 ring-2 ring-yellow-300/40 shadow-[0_6px_20px_rgba(251,191,36,0.35)] scale-105'
                          : 'bg-white/10 text-white/70 ring-1 ring-white/10 group-hover:bg-white/15 group-hover:text-white'
                      }`}
                    >
                      <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-gray-900' : 'text-white/70'}`} />
                    </div>
                  </div>
                  <span
                    className={`mt-2 text-[11px] tracking-wide ${
                      activeTab === tab.id ? 'text-white font-semibold' : 'text-white/70'
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Tab Content - Enhanced Scrollbar */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {activeTab === 'upload' && (
              <div className="space-y-6">
                <ImageUploader 
                  onImageUpload={handlePrimaryImageUpload}
                  title="Primary Image"
                />
                
                {primaryImage && (
                  <div className="pt-6 border-t border.white/10">
                    <ImageUploader 
                      onImageUpload={handleReferenceImageUpload}
                      title="Reference Images (Optional)"
                      multiple
                    />
                    
                    {referenceImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {referenceImages.map((img, i) => (
                          <div key={img.id} className="aspect-square rounded-lg overflow-hidden border border-white/10">
                            <img src={img.url} alt={`Reference ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'prompt' && (
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                onSubmit={handlePromptSubmit}
                isProcessing={isProcessing}
                disabled={!primaryImage}
                referenceImages={referenceImages}
                onReferenceImagesChange={setReferenceImages}
              />
            )}
            
            {activeTab === 'templates' && (
              <TemplatesGrid
                onTemplateSelect={handleTemplateSelect}
                userImage={primaryImage?.url}
              />
            )}
            
            {activeTab === 'adjust' && (
              <AdjustmentControls
                adjustments={adjustments}
                onChange={applyAdjustments}
              />
            )}
            
            {activeTab === 'filters' && (
              <FiltersPanel
                currentFilter={currentFilter}
                onFilterChange={applyFilter}
                previewImage={displayImage?.url}
              />
            )}
          </div>
        </aside>
        
        {/* Main Canvas - Premium Glass Container */}
        <main className="overflow-hidden rounded-3xl ring-1 ring-white/10 bg-black/20 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.55)]" style={canvasStyle}>
          {/* Premium Grid Background with Glow */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
          </div>
          
          {/* Canvas Content */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            {displayImage ? (
              <div className="relative w-full h-full">
                {/* Glass frame for image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative max-w-7xl max-h-full">
                    {/* Glow effect */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-2xl opacity-50" />
                    {/* Glass container */}
                    <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl border border-white/20 shadow-2xl p-4">
                      <ImageComparison
                        originalUrl={primaryImage?.url || ''}
                        editedUrl={generatedImage?.url}
                        adjustments={adjustments}
                        filter={currentFilter || undefined}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Draggable Floating Tools */}
                <div
                  className="fixed z-30 cursor-grab"
                  style={{ left: lassoFabPos.x, top: lassoFabPos.y }}
                  onMouseDown={(e) => handleFabMouseDown('lasso', e)}
                  aria-label="Lasso Selection Tool"
                  title="Lasso Selection Tool"
                >
                  <FloatingLassoButton
                    onClick={handleLassoSelection}
                    disabled={!displayImage}
                  />
                </div>

                <div
                  className="fixed z-30 cursor-grab"
                  style={{ left: sketchFabPos.x, top: sketchFabPos.y }}
                  onMouseDown={(e) => handleFabMouseDown('sketch', e)}
                  aria-label="Sketch Tool"
                  title="Sketch Tool"
                >
                  <FloatingSketchButton
                    onClick={handleSketchTool}
                    disabled={!displayImage}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000 animate-gradient-x" />
                  
                  {/* Glass card */}
                  <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl p-12 border border-white/20 shadow-2xl max-w-md">
                    {/* Icon with glow */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse-slow" />
                      <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border border-white/10">
                        <Camera className="h-12 w-12 text-white/40" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text.white mb-3">No Image Selected</h3>
                    <p className="text-white/60 mb-8 leading-relaxed">Upload an image to start creating amazing transformations with AI</p>
                    
                    <button 
                      onClick={() => setActiveTab('upload')}
                      className="relative group/btn overflow-hidden"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-banana via-yellow-400 to-orange-400 rounded-xl blur opacity-50 group-hover/btn:opacity-75 transition duration-200 animate-gradient-x" />
                      <div className="relative px-8 py-4 bg-gradient-to-r from-banana to-yellow-400 rounded-xl text-gray-900 font-bold inline-flex items-center gap-2 transform group-hover/btn:scale-105 transition-all duration-200">
                        <Upload className="h-5 w-5" />
                        Upload Image
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        imageUrl={displayImage?.url || null}
        adjustments={adjustments}
      />

      {/* Lasso Selection Tool */}
      {showLassoTool && displayImage && (
        <LassoSelectionTool
          imageUrl={displayImage.url}
          onSelectionComplete={handleSelectionComplete}
          onCancel={() => {
            setShowLassoTool(false);
            setSelectionData(null);
          }}
        />
      )}

      {/* Sketch Tool */}
      {showSketchTool && displayImage && (
        <SketchTool
          imageUrl={displayImage.url}
          onClose={() => setShowSketchTool(false)}
          onSketchComplete={handleSketchComplete}
        />
      )}

      {/* Area Edit Modal */}
      <AreaEditModal
        isOpen={showAreaEditModal}
        onClose={() => {
          setShowAreaEditModal(false);
          setSelectionData(null);
        }}
        onSubmit={handleAreaEditSubmit}
        isProcessing={isProcessing}
      />
    </div>
  );
}