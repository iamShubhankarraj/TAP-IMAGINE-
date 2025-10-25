/**
 * services/local-projects.ts
 * Local persistence for recent projects, edits, and activity history.
 * Stores lightweight project snapshots in localStorage to be shown instantly in Dashboard.
 * These entries can later be synced to Supabase and marked as 'synced'.
 */

'use client';

import type { StoredImage } from '@/types/editor';
import type { ImageAdjustments } from '@/types/adjustments';

const STORAGE_KEY = 'tapimagine.localProjects.v1';

export type LocalProjectStatus = 'pending' | 'synced' | 'failed';

export type LocalProjectEvent = {
  label: string;
  timestamp: number;
  action?: string | null;
  payload?: Record<string, unknown> | null;
};

/**
 * Detailed revision snapshot entry to record every iteration/edit for a local project.
 */
export type LocalProjectRevision = {
  id: string; // uuid for revision entry
  label: string; // human-friendly label
  timestamp: number; // when this revision was recorded
  type:
    | 'initial_snapshot'
    | 'set_primary_image'
    | 'upload_reference'
    | 'image_generation'
    | 'sketch_generation'
    | 'area_edit_generation'
    | 'adjustments_change'
    | 'filter_apply';
  // Snapshot of editor state at this point
  snapshot: {
    primaryImage?: StoredImage | null;
    generatedImage?: StoredImage | null;
    referenceImages?: StoredImage[];
    prompt?: string | null;
    adjustments?: ImageAdjustments | null;
    filter?: string | null;
  };
  // Optional extra metadata
  payload?: Record<string, unknown> | null;
};

export type LocalProject = {
  // Local identity
  id: string; // e.g. 'local-<uuid>'
  status: LocalProjectStatus;

  // Remote linkage (optional until synced)
  remoteId?: string | null;

  // Display metadata
  name: string;
  description?: string | null;

  // Images (base64 data URLs expected here for instant local preview)
  thumbnailDataUrl?: string | null; // Prefer generated image, fallback to primary
  primaryImage?: StoredImage | null;
  generatedImage?: StoredImage | null;
  referenceImages: StoredImage[];

  // Editor state snapshot
  prompt?: string | null;
  adjustments?: ImageAdjustments | null;
  filter?: string | null;

  // Activity log
  events?: LocalProjectEvent[];

  // Complete iteration history (every edit/revision)
  revisions?: LocalProjectRevision[];

  // Timestamps
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

/**
 * Safe JSON parse helper
 */
function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Load all local projects from localStorage
 */
export function loadAllLocalProjects(): LocalProject[] {
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
  const list = safeParse<LocalProject[]>(raw, []);
  // Validate minimal fields and coerce if needed
  return Array.isArray(list)
    ? list.filter((p) => p && typeof p.id === 'string' && typeof p.name === 'string')
    : [];
}

/**
 * Save the full local projects list into localStorage
 */
export function saveAllLocalProjects(projects: LocalProject[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

/**
 * Return local projects sorted by updatedAt desc (then createdAt)
 */
export function listLocalProjects(): LocalProject[] {
  const items = loadAllLocalProjects();
  return items.sort((a, b) => {
    const au = new Date(a.updatedAt || a.createdAt).getTime();
    const bu = new Date(b.updatedAt || b.createdAt).getTime();
    return bu - au;
  });
}

/**
 * Insert a new local project at the top
 */
export function saveLocalProject(project: LocalProject) {
  const items = loadAllLocalProjects();
  const idx = items.findIndex((p) => p.id === project.id);
  const nowIso = new Date().toISOString();
  const next: LocalProject = {
    ...project,
    updatedAt: project.updatedAt || nowIso,
    createdAt: project.createdAt || nowIso,
  };
  if (idx >= 0) {
    items[idx] = next;
  } else {
    items.unshift(next);
  }
  saveAllLocalProjects(items);
}

/**
 * Upsert local project
 */
export function upsertLocalProject(project: LocalProject) {
  return saveLocalProject(project);
}

/**
 * Update specific fields of a local project
 */
export function updateLocalProject(id: string, patch: Partial<LocalProject>) {
  const items = loadAllLocalProjects();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) return;
  items[idx] = {
    ...items[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  saveAllLocalProjects(items);
}

/**
 * Remove a local project
 */
export function removeLocalProject(id: string) {
  const items = loadAllLocalProjects();
  const next = items.filter((p) => p.id !== id);
  saveAllLocalProjects(next);
}

/**
 * Mark local project as synced with a remote project id
 */
export function markLocalProjectSynced(id: string, remoteId: string) {
  updateLocalProject(id, { status: 'synced', remoteId });
}

/**
 * Append an event to a local project's event log
 */
export function appendLocalProjectEvent(id: string, event: LocalProjectEvent) {
  const items = loadAllLocalProjects();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) return;
  const prev = items[idx];
  const events = Array.isArray(prev.events) ? prev.events : [];
  items[idx] = {
    ...prev,
    events: [...events, event],
    updatedAt: new Date().toISOString(),
  };
  saveAllLocalProjects(items);
}

/**
 * Append a detailed revision snapshot to a local project.
 * Use this to capture every iteration (generation, adjustments, filter, etc.).
 */
export function appendLocalProjectRevision(id: string, revision: LocalProjectRevision) {
  const items = loadAllLocalProjects();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) return;

  const prev = items[idx];
  const revisions = Array.isArray(prev.revisions) ? prev.revisions : [];

  items[idx] = {
    ...prev,
    revisions: [...revisions, revision],
    // Keep thumbnail aligned to latest generated/primary if present in revision snapshot
    thumbnailDataUrl:
      revision.snapshot.generatedImage?.url ??
      revision.snapshot.primaryImage?.url ??
      prev.thumbnailDataUrl ??
      null,
    updatedAt: new Date().toISOString(),
  };

  saveAllLocalProjects(items);
}

/**
 * Utility to create a LocalProject snapshot from current editor state.
 * Use this in the editor before resetting state on "New Project".
 */
export function buildLocalProjectSnapshot(params: {
  id: string; // local id e.g. 'local-<uuid>'
  name: string;
  primaryImage?: StoredImage | null;
  generatedImage?: StoredImage | null;
  referenceImages?: StoredImage[];
  prompt?: string | null;
  adjustments?: ImageAdjustments | null;
  filter?: string | null;
  events?: LocalProjectEvent[];
}): LocalProject {
  const nowIso = new Date().toISOString();
  const thumbnailDataUrl =
    params.generatedImage?.url ||
    params.primaryImage?.url ||
    null;

  // Seed with an initial revision capturing the current snapshot
  const initialRevision: LocalProjectRevision = {
    id: `${params.id}-rev-initial`,
    label: 'Initial Snapshot',
    timestamp: Date.now(),
    type: 'initial_snapshot',
    snapshot: {
      primaryImage: params.primaryImage ?? null,
      generatedImage: params.generatedImage ?? null,
      referenceImages: params.referenceImages ?? [],
      prompt: params.prompt ?? null,
      adjustments: params.adjustments ?? null,
      filter: params.filter ?? null,
    },
    payload: null,
  };

  return {
    id: params.id,
    status: 'pending',
    remoteId: null,
    name: params.name,
    description: null,
    thumbnailDataUrl,
    primaryImage: params.primaryImage ?? null,
    generatedImage: params.generatedImage ?? null,
    referenceImages: params.referenceImages ?? [],
    prompt: params.prompt ?? null,
    adjustments: params.adjustments ?? null,
    filter: params.filter ?? null,
    events: params.events ?? [],
    revisions: [initialRevision],
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}