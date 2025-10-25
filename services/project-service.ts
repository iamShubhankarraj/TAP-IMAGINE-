/**
 * services/project-service.ts
 * Client-side helpers for Supabase-backed project persistence and storage uploads.
 */

import { supabase } from '@/lib/supabase/client';

/**
 * Convert a data URL (base64) to a File
 * Uses fetch to convert dataURL to Blob, then wraps in File.
 */
export async function toFile(dataUrl: string, filename: string, mimeOverride?: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const mime = mimeOverride || blob.type || 'image/png';
  return new File([blob], filename, { type: mime });
}

/**
 * Build storage path for images bucket
 */
export function imagePath(userId: string, projectId: string, filename: string): string {
  // images/{userId}/{projectId}/{filename}
  return `${userId}/${projectId}/${filename}`;
}

/**
 * Upload a base64 data URL to Supabase Storage 'images' bucket with upsert.
 * Returns publicUrl and storage path.
 */
export async function uploadBase64ToImagesBucket(
  dataUrl: string,
  userId: string,
  projectId: string,
  filename: string
): Promise<{ publicUrl: string | null; path: string; error: any | null }> {
  try {
    const file = await toFile(dataUrl, filename);
    const path = imagePath(userId, projectId, filename);

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return { publicUrl: null, path, error: uploadError };
    }

    const { data: publicData } = supabase.storage.from('images').getPublicUrl(path);
    const publicUrl = publicData?.publicUrl ?? null;

    return { publicUrl, path, error: null };
  } catch (err) {
    console.error('uploadBase64ToImagesBucket failed:', err);
    return { publicUrl: null, path: imagePath(userId, projectId, filename), error: err };
  }
}

/**
 * Minimal Project row type (extend as needed)
 */
export type ProjectRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  primary_image_url: string | null;
  generated_image_url: string | null;
  thumbnail_url?: string | null;
  data?: any | null; // JSONB
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Fetch project by id
 */
export async function fetchProjectById(projectId: string): Promise<{ data: ProjectRow | null; error: any | null }> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      return { data: null, error };
    }
    return { data: data as ProjectRow, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Update project with partial fields (e.g., primary_image_url, generated_image_url, data)
 */
export async function updateProject(
  projectId: string,
  fields: Partial<Pick<ProjectRow, 'name' | 'description' | 'primary_image_url' | 'generated_image_url' | 'thumbnail_url' | 'data' | 'is_public'>>
): Promise<{ error: any | null }> {
  try {
    const { error } = await supabase
      .from('projects')
      .update(fields as any)
      .eq('id', projectId);

    return { error };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Append an event to projects.data.events[] and update the row.
 * Creates the data/events structure if missing.
 */
export async function appendProjectEvent(
  projectId: string,
  event: {
    type: 'upload_primary' | 'upload_reference' | 'generate' | 'apply_template' | 'update';
    prompt?: string;
    url?: string;
    meta?: Record<string, any>;
  }
): Promise<{ error: any | null }> {
  try {
    const { data: row, error: fetchError } = await supabase
      .from('projects')
      .select('data')
      .eq('id', projectId)
      .single();

    if (fetchError) {
      return { error: fetchError };
    }

    const currentData = (row?.data ?? {}) as { events?: any[] };
    const events = Array.isArray(currentData.events) ? currentData.events : [];
    const newEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    const nextData = { ...currentData, events: [...events, newEvent] };

    const { error: updateError } = await supabase
      .from('projects')
      .update({ data: nextData })
      .eq('id', projectId);

    return { error: updateError };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Convenience helpers to persist primary, generated, and reference images
 */

export async function persistPrimaryImage(
  base64: string,
  userId: string,
  projectId: string
): Promise<{ publicUrl: string | null; error: any | null }> {
  const { publicUrl, error } = await (async () => {
    // Always overwrite the same filename for primary to keep path stable
    return await uploadBase64ToImagesBucket(base64, userId, projectId, 'primary.png');
  })();

  if (!error && publicUrl) {
    await updateProject(projectId, { primary_image_url: publicUrl });
    await appendProjectEvent(projectId, { type: 'upload_primary', url: publicUrl });
  }

  return { publicUrl, error };
}

export async function persistGeneratedImage(
  base64: string,
  userId: string,
  projectId: string,
  prompt?: string
): Promise<{ publicUrl: string | null; error: any | null }> {
  const { publicUrl, error } = await uploadBase64ToImagesBucket(base64, userId, projectId, 'generated.png');

  if (!error && publicUrl) {
    await updateProject(projectId, { generated_image_url: publicUrl });
    await appendProjectEvent(projectId, { type: 'generate', url: publicUrl, prompt });
  }

  return { publicUrl, error };
}

export async function persistReferenceImage(
  base64: string,
  userId: string,
  projectId: string,
  filename: string
): Promise<{ publicUrl: string | null; error: any | null }> {
  const { publicUrl, error } = await uploadBase64ToImagesBucket(base64, userId, projectId, `references/${filename}`);

  if (!error && publicUrl) {
    await appendProjectEvent(projectId, { type: 'upload_reference', url: publicUrl });
  }

  return { publicUrl, error };
}