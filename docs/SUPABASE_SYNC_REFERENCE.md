# Supabase Sync Code Reference

This document consolidates the core code related to syncing data to Supabase in this project. Each section includes clickable references to the actual source definitions and selected code excerpts for quick reuse.

- Environment variables
- Supabase client (browser) and server clients
- Storage upload helpers
- Project row updates and event logging
- API route for starting/creating projects
- Dashboard flows (avatar upload, start-from-image)
- Editor flows (primary/reference image persistence)

IMPORTANT: Ensure the following environment variables exist in .env.local
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Optional server-side bypass for RLS (use only in secure server contexts)
- SUPABASE_SERVICE_ROLE_KEY

## Supabase Client (Browser)

- File: [lib/supabase/client.ts](lib/supabase/client.ts)
- Initialization: [export const supabase](lib/supabase/client.ts:17)
- Profile helpers:
  - [export async function getUserProfile()](lib/supabase/client.ts:26)
  - [export async function updateUserProfile()](lib/supabase/client.ts:48)
- Storage upload helper:
  - [export async function uploadImage()](lib/supabase/client.ts:70)

Selected excerpts:

```ts
// Initialization
export const supabase = createClientComponentClient();

// Fetch profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

// Update profile
export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  return { data, error };
}

// Upload image to Storage and return public URL
export async function uploadImage(bucket: string, path: string, file: File) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, cacheControl: '3600' });
  if (error) throw error;

  const { data: publicURL } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  return { data: publicURL, error: null };
}
```

## Supabase Server Client (Next.js App Router)

- File: [lib/supabase/server.ts](lib/supabase/server.ts)
- Factory: [export const createSupabaseServerClient()](lib/supabase/server.ts:4)

```ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createSupabaseServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
};
```

## Project Persistence Helpers

- File: [services/project-service.ts](services/project-service.ts)
- Storage path helper: [export function imagePath()](services/project-service.ts:22)
- DataURL → File helper: [export async function toFile()](services/project-service.ts:12)
- Storage uploads:
  - [export async function uploadBase64ToImagesBucket()](services/project-service.ts:31)
- Project update:
  - [export async function updateProject()](services/project-service.ts:100)
- Event logging:
  - [export async function appendProjectEvent()](services/project-service.ts:120)
- Convenience image persistence:
  - [export async function persistPrimaryImage()](services/project-service.ts:163)
  - [export async function persistGeneratedImage()](services/project-service.ts:181)
  - [export async function persistReferenceImage()](services/project-service.ts:197)

Selected excerpts:

```ts
// Upload base64 to 'images' bucket and return public URL
export async function uploadBase64ToImagesBucket(
  dataUrl: string,
  userId: string,
  projectId: string,
  filename: string
): Promise<{ publicUrl: string | null; path: string; error: any | null }> {
  const file = await toFile(dataUrl, filename);
  const path = imagePath(userId, projectId, filename);

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) return { publicUrl: null, path, error: uploadError };

  const { data: publicData } = supabase.storage.from('images').getPublicUrl(path);
  return { publicUrl: publicData?.publicUrl ?? null, path, error: null };
}

// Update project row
export async function updateProject(
  projectId: string,
  fields: Partial<Pick<ProjectRow, 'name' | 'description' | 'primary_image_url' | 'generated_image_url' | 'thumbnail_url' | 'data' | 'is_public'>>
): Promise<{ error: any | null }> {
  const { error } = await supabase.from('projects').update(fields as any).eq('id', projectId);
  return { error };
}

// Append event to projects.data.events[]
export async function appendProjectEvent(
  projectId: string,
  event: { type: 'upload_primary' | 'upload_reference' | 'generate' | 'apply_template' | 'update'; prompt?: string; url?: string; meta?: Record<string, any>; }
): Promise<{ error: any | null }> {
  const { data: row } = await supabase.from('projects').select('data').eq('id', projectId).single();
  const currentData = (row?.data ?? {}) as { events?: any[] };
  const events = Array.isArray(currentData.events) ? currentData.events : [];
  const nextData = { ...currentData, events: [...events, { ...event, timestamp: new Date().toISOString() }] };
  const { error } = await supabase.from('projects').update({ data: nextData }).eq('id', projectId);
  return { error };
}

// Persist primary image and update row
export async function persistPrimaryImage(base64: string, userId: string, projectId: string) {
  const { publicUrl, error } = await uploadBase64ToImagesBucket(base64, userId, projectId, 'primary.png');
  if (!error && publicUrl) {
    await updateProject(projectId, { primary_image_url: publicUrl });
    await appendProjectEvent(projectId, { type: 'upload_primary', url: publicUrl });
  }
  return { publicUrl, error };
}

// Persist generated image and update row
export async function persistGeneratedImage(base64: string, userId: string, projectId: string, prompt?: string) {
  const { publicUrl, error } = await uploadBase64ToImagesBucket(base64, userId, projectId, 'generated.png');
  if (!error && publicUrl) {
    await updateProject(projectId, { generated_image_url: publicUrl });
    await appendProjectEvent(projectId, { type: 'generate', url: publicUrl, prompt });
  }
  return { publicUrl, error };
}

// Persist reference image (no direct row field, only event)
export async function persistReferenceImage(base64: string, userId: string, projectId: string, filename: string) {
  const { publicUrl, error } = await uploadBase64ToImagesBucket(base64, userId, projectId, `references/${filename}`);
  if (!error && publicUrl) {
    await appendProjectEvent(projectId, { type: 'upload_reference', url: publicUrl });
  }
  return { publicUrl, error };
}
```

## API Route: Start or Create Project

- File: [app/api/projects/start/route.ts](app/api/projects/start/route.ts)
- Handler: [export async function GET()](app/api/projects/start/route.ts:7)

```ts
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies: () => cookies() });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const userId = session.user.id;

  // Recent project
  const { data: recentProjects } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (recentProjects?.length) return NextResponse.json({ id: recentProjects[0].id });

  // Create new project if none
  const { data: created, error: createError } = await supabase
    .from('projects')
    .insert({ user_id: userId, name: 'Untitled Project', data: {}, is_public: false })
    .select('id')
    .single();

  if (createError || !created) return NextResponse.json({ error: 'failed_to_create_project' }, { status: 500 });
  return NextResponse.json({ id: created.id });
}
```

Note: The editor page uses POST /api/projects/new for robust creation (RLS policies or service-role fallback). Ensure that route is present similarly to start/route.ts, or update calls to use /api/projects/start.

## Dashboard Flows

- File: [app/dashboard/DashboardClient.tsx](app/dashboard/DashboardClient.tsx)

Avatar upload:
- Function: [const handleAvatarFileChange = async (e)](app/dashboard/DashboardClient.tsx:133)

```tsx
const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !user) return;

  const fileExt = file.name.split('.').pop();
  const fileName = `avatar_${Date.now()}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true, contentType: file.type });
  if (uploadError) throw uploadError;

  const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filePath);
  const publicUrl = publicData?.publicUrl;
  if (!publicUrl) throw new Error('Failed to obtain public URL for avatar');

  const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
  if (updateError) throw updateError;
};
```

Start-from-image flow:
- Function: [const handleImageFileChange = async (e)](app/dashboard/DashboardClient.tsx:187)

```tsx
const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !user) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result as string;

    // Create Supabase project via API
    const res = await fetch('/api/projects/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: file.name }),
    });
    const json = await res.json();
    if (!res.ok || !json?.id) return;

    const projectId = json.id as string;

    // Persist primary image to Storage and update project
    const { error: persistError } = await persistPrimaryImage(base64, user.id, projectId);
    if (persistError) console.warn('Primary image upload failed:', persistError);

    // Redirect to editor
    router.push(`/editor?project=${projectId}`);
  };

  reader.readAsDataURL(file);
};
```

## Editor Flows (Image Persistence)

- File: [app/editor/EditorClientPage.tsx](app/editor/EditorClientPage.tsx)

Primary image persistence:
- Function: [const handlePrimaryImageUpload = async (image)](app/editor/EditorClientPage.tsx:158)

```tsx
const handlePrimaryImageUpload = async (image: StoredImage) => {
  setPrimaryImage(image);
  setActiveTab('prompt');

  // Persist to Supabase if available
  if (user?.id && projectId && image.url.startsWith('data:')) {
    await persistPrimaryImage(image.url, user.id, projectId);
    await appendProjectEvent(projectId, { type: 'upload_primary', url: image.url, meta: { name: image.name, size: image.size } });
  }
};
```

Reference image persistence:
- Function: [const handleReferenceImageUpload = async (image)](app/editor/EditorClientPage.tsx:178)

```tsx
const handleReferenceImageUpload = async (image: StoredImage) => {
  setReferenceImages([...referenceImages, image]);

  if (user?.id && projectId && image.url.startsWith('data:')) {
    await persistReferenceImage(image.url, user.id, projectId, `${image.id}.png`);
    await appendProjectEvent(projectId, { type: 'upload_reference', url: image.url, meta: { name: image.name, size: image.size } });
  }
};
```

Generated image persistence:
- Function: [const processImage = async (inputPrompt)](app/editor/EditorClientPage.tsx:210)

```tsx
// Inside success block after generated image created:
if (user?.id && projectId && nextImg.url.startsWith('data:')) {
  await persistGeneratedImage(nextImg.url, user.id, projectId, inputPrompt);
}
```

New project action:
- Function: [const handleNewProject = async ()](app/editor/EditorClientPage.tsx:263)

```tsx
const res = await fetch('/api/projects/new', { method: 'POST' });
const json = await res.json();
if (json?.id) {
  setProjectId(json.id);
  resetEditor();
  router.push(`/editor?project=${json.id}`);
}
```

## Storage Buckets

This project expects the following Supabase Storage buckets:
- images: for per-project images (primary.png, generated.png, references/*)
- avatars: for profile pictures

Ensure buckets exist and public access config matches your use-case. For tighter control, prefer signed URLs or authenticated policies.

## RLS Policies (Database)

Enable RLS for key tables:
- projects: allow select/insert/update by owner (user_id = auth.uid())
- profiles: allow select/insert/update by owner (id = auth.uid())
- templates: allow public read; restrict modifications appropriately

Apply your policies via SQL migrations in supabase/migrations or the SQL editor.
