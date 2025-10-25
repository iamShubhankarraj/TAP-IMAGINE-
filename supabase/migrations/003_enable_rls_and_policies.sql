-- 003_enable_rls_and_policies.sql
-- Enables RLS and adds essential policies for projects, profiles, and templates
-- This fixes "failed to create project" caused by missing INSERT policy on projects,
-- and ensures dashboard/profile/template operations work under RLS.

begin;

-- PROJECTS
alter table if exists public.projects enable row level security;

-- Read own projects
drop policy if exists projects_select_own on public.projects;
create policy projects_select_own
  on public.projects
  for select
  using (auth.uid() = user_id);

-- Insert own projects
drop policy if exists projects_insert_own on public.projects;
create policy projects_insert_own
  on public.projects
  for insert
  with check (auth.uid() = user_id);

-- Update own projects
drop policy if exists projects_update_own on public.projects;
create policy projects_update_own
  on public.projects
  for update
  using (auth.uid() = user_id);

-- (Optional) Delete own projects
-- drop policy if exists projects_delete_own on public.projects;
-- create policy projects_delete_own
--   on public.projects
--   for delete
--   using (auth.uid() = user_id);

-- PROFILES
alter table if exists public.profiles enable row level security;

-- Select own profile
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self
  on public.profiles
  for select
  using (auth.uid() = id);

-- Insert self profile (first visit upsert)
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Update own profile
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
  on public.profiles
  for update
  using (auth.uid() = id);

-- TEMPLATES
-- Allow public reads for is_public templates so dashboard can render
alter table if exists public.templates enable row level security;

drop policy if exists templates_select_public on public.templates;
create policy templates_select_public
  on public.templates
  for select
  using (coalesce(is_public, false) = true);

commit;