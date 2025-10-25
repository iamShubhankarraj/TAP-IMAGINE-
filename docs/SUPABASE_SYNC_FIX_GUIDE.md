# Supabase Sync Fix Guide — Complete Instructions (No Code)

This guide fixes all Supabase synchronization issues across profile uploads, project creation and saving, dashboard display, database population, and template syncing. Follow each checklist exactly and restart the dev server after environment changes.

Problems addressed:
- Profile image uploads not updating Storage and profile row
- New Project action not saving current work before creating a new project
- Dashboard not listing previous projects
- Database tables not filling with uploaded/generated image URLs and metadata
- Templates not loading from database or syncing usage stats

Important project file references you may consult while following the steps:
- [createClientComponentClient()](lib/supabase/client.ts:17)
- [uploadImage()](lib/supabase/client.ts:70)
- [createSupabaseServerClient()](lib/supabase/server.ts:4)
- [uploadBase64ToImagesBucket()](services/project-service.ts:31)
- [updateProject()](services/project-service.ts:100)
- [appendProjectEvent()](services/project-service.ts:120)
- [persistPrimaryImage()](services/project-service.ts:163)
- [persistGeneratedImage()](services/project-service.ts:181)
- [persistReferenceImage()](services/project-service.ts:197)
- [handleAvatarFileChange()](app/dashboard/DashboardClient.tsx:133)
- [handleImageFileChange()](app/dashboard/DashboardClient.tsx:187)
- [handlePrimaryImageUpload()](app/editor/EditorClientPage.tsx:158)
- [handleReferenceImageUpload()](app/editor/EditorClientPage.tsx:178)
- [processImage()](app/editor/EditorClientPage.tsx:210)
- [handleNewProject()](app/editor/EditorClientPage.tsx:263)
- [EditorPage project creation via API](app/editor/page.tsx:40)
- [GET /api/projects/start](app/api/projects/start/route.ts:7)

Pre-flight checks:

1) Environment variables in .env.local (project root)
- NEXT_PUBLIC_SUPABASE_URL: https://xxxxx.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJ... (anon key)
- SUPABASE_SERVICE_ROLE_KEY: optional service role key for server-side fallback
After changes: stop and restart dev server.

2) Storage buckets in Supabase Dashboard → Storage
- Required: avatars (profile pictures), images (project images), templates (optional thumbnail storage)
- For each bucket: enable public read or add a public read policy; set reasonable file size limits and allow image MIME types (jpeg, png, webp, gif).

3) Database tables exist and have required columns (Supabase Dashboard → Table Editor)
- profiles: id (uuid, PK, = auth.users.id), email, first_name, last_name, avatar_url, phone, tier (default 'free'), created_at, updated_at
- projects: id (uuid, PK), user_id (uuid, FK to auth.users), name, description, primary_image_url, generated_image_url, thumbnail_url, data (jsonb default '{}'), is_public (bool default false), created_at, updated_at
- templates: id (uuid, PK), name, description, thumbnail_url, prompt, category, style, is_public, is_featured, user_id (nullable), likes_count, uses_count, created_at, updated_at

4) Row Level Security (RLS) policies enabled
- profiles: SELECT/UPDATE/INSERT allowed when auth.uid() = id
- projects: SELECT/UPDATE/INSERT/DELETE allowed when auth.uid() = user_id
- templates: SELECT public allowed (is_public = true); restrict write as needed

5) Dev server and auth state
- Ensure you’re signed in; session must be present for all client operations
- Clear browser cache if Storage public URL resolution looks stale

PART 1 — Fix Profile Image Uploads

Goal: When a user selects an avatar image on the dashboard, the file uploads to the avatars bucket and the profiles.avatar_url is updated to the public URL. The UI updates immediately and persists across sessions.

Steps:
- Verify the handler at [handleAvatarFileChange()](app/dashboard/DashboardClient.tsx:133) runs when a file is selected.
- Confirm it constructs a path like {userId}/avatar_{timestamp}.{ext} and uploads to the avatars bucket with contentType set.
- Ensure it retrieves a public URL via getPublicUrl(...) and then updates the profiles table with avatar_url = publicUrl for the current user id.
- Ensure local UI state sets a success message and immediately reflects the new image source; on subsequent reloads the avatar loads from profiles.avatar_url.
- In Supabase Dashboard → Storage → avatars, upload a small test image and verify the public URL opens in the browser.
- If upload or update fails: re-check env vars, bucket existence, and RLS policies; confirm user.id exists and is the same id in profiles.

UX and error handling:
- Show a spinner state while uploading; disable the Change button.
- On failure, display a friendly message and reset the file input; instruct the user to try again.
- Handle <img> load errors by falling back to initials or icon.

PART 2 — Save Current Project Before New Project

Goal: Clicking New Project saves the current project’s images and events, then creates a new project, clears the editor, and routes to the new project ID.

Steps:
- Ensure the New Project action at [handleNewProject()](app/editor/EditorClientPage.tsx:263) first persists current data best-effort:
  - If primaryImage url is a data URL and projectId/user.id present, persist to Storage and update projects.primary_image_url.
  - If generatedImage exists, persist and update projects.generated_image_url.
  - Persist each reference image to images/references and log events for uploads and updates via [appendProjectEvent()](services/project-service.ts:120).
- After persistence completes, call POST /api/projects/new (or [GET /api/projects/start](app/api/projects/start/route.ts:7)) to create a new project row server-side.
- On success, setProjectId(newId), call resetEditor(), and navigate to /editor?project=newId.
- On error, do not clear state; surface a clear error and keep the user on the current project.

Recommended:
- Auto-save debounce: Save after image generation, template apply, or every ~30 seconds if changes detected, to reduce data loss risks.

PART 3 — Dashboard Projects Listing

Goal: The dashboard lists the user’s recent projects with preview images, supports grid/list views, and opens the chosen project in the editor.

Steps:
- Ensure the projects fetch runs after mount and user.id is available (see [DashboardClient](app/dashboard/DashboardClient.tsx:79)).
- Query projects where user_id = user.id, ordered by created_at or updated_at (descending), and limit to a reasonable count.
- Render cards that show generated_image_url if present, else primary_image_url; fall back to an icon if none.
- Handle loading, empty, and error states with friendly messages and a CTA to start a new project.
- Clicking a card or Edit button should link to /editor?project={id}.

Optional actions:
- Provide rename, delete, and share/publish toggles with confirmation and clear success/error feedback, honoring RLS policies.

PART 4 — Database Population for Image URLs and Metadata

Goal: All uploaded/generated image URLs and events are persisted into the projects table (columns and data JSONB), enabling continuity and analytics.

Primary image uploads:
- Ensure the primary image upload handler ([handlePrimaryImageUpload()](app/editor/EditorClientPage.tsx:158)) persists data URLs via [persistPrimaryImage()](services/project-service.ts:163) when user.id and projectId exist.
- Confirm projects.primary_image_url is updated and an events entry is added via [appendProjectEvent()](services/project-service.ts:120).

Generated images:
- After successful generation inside ([processImage()](app/editor/EditorClientPage.tsx:210)), persist the base64 data via [persistGeneratedImage()](services/project-service.ts:181) and update projects.generated_image_url, plus a generation event with prompt.

Reference images:
- On reference uploads ([handleReferenceImageUpload()](app/editor/EditorClientPage.tsx:178)), persist each via [persistReferenceImage()](services/project-service.ts:197). Track uploads in events and optionally store references in the data JSON structure.

Data JSONB structure suggestions:
- data.events: chronological array of { type, url, prompt?, meta?, timestamp }
- data.references: array of { id, url, uploadedAt }
- data.settings: e.g., last model or style used

Troubleshooting:
- If URLs are not saved: verify Storage uploads succeed and public URLs resolve; confirm updateProject uses the correct project id and user has UPDATE rights; re-check RLS policies.

PART 5 — Template Synchronization

Goal: Templates load from the database, user can preview and apply via a confirmation dialog, and usage statistics can be updated.

Steps:
- Seed the templates table with public templates (name, description, prompt, thumbnail_url, category, style, is_public) if empty.
- In the editor templates panel, fetch templates from the DB (filter is_public = true) and sort featured/popular first.
- Ensure clicking a template opens a preview dialog (not auto-apply), then on Apply, proceed with the same generation + persistence flow used for normal prompts.
- Optionally increment uses_count on successful apply and track likes/favorites in a separate interaction table.

Final validation checklist:
- You can upload a profile image; a public URL is visible in avatars bucket and profiles.avatar_url shows the same URL.
- Clicking New Project saves current images to the images bucket and updates projects.primary_image_url and projects.generated_image_url, then creates a new project and routes to it.
- Dashboard shows recent projects with thumbnails; clicking opens the editor bound to the project id.
- After generation or template application, projects.generated_image_url is updated and data.events contains a corresponding entry.
- Templates load from the templates table; preview/confirmation works and apply persists like any generation.

If any step fails, re-check:
- .env.local values and dev server restart
- Bucket existence and public read settings
- RLS policies for profiles/projects/templates
- User session presence and matching IDs across auth.users and table rows
- Console logs for precise error messages and call sites referenced above