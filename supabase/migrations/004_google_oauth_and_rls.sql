-- 004_google_oauth_and_rls.sql
-- Safe idempotent setup for Google OAuth + profiles automation + RLS policies
begin;

-- Ensure pgcrypto for gen_random_uuid
create extension if not exists pgcrypto;

-- Profiles table (for first-time setups)
create table if not exists public.profiles (
  id uuid references auth.users(id) primary key,
  email text,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  tier text default 'free' check (tier in ('free','pro','premium')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Update timestamp helper
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

-- Attach updated_at triggers (idempotent)
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- Handle new auth user -> create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, avatar_url, tier)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', null),
    coalesce(new.raw_user_meta_data->>'last_name', null),
    coalesce(new.raw_user_meta_data->>'avatar_url', null),
    'free'
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable RLS
alter table if exists public.profiles enable row level security;
alter table if exists public.projects enable row level security;
alter table if exists public.templates enable row level security;

-- Profiles policies
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
  on public.profiles for update
  using (auth.uid() = id);

-- Projects policies
drop policy if exists projects_select_own on public.projects;
create policy projects_select_own
  on public.projects for select
  using (auth.uid() = user_id);

drop policy if exists projects_insert_own on public.projects;
create policy projects_insert_own
  on public.projects for insert
  with check (auth.uid() = user_id);

drop policy if exists projects_update_own on public.projects;
create policy projects_update_own
  on public.projects for update
  using (auth.uid() = user_id);

-- Public viewing of projects marked public
drop policy if exists projects_select_public on public.projects;
create policy projects_select_public
  on public.projects for select
  using (coalesce(is_public,false) = true);

-- Templates: allow public reads of public templates
drop policy if exists templates_select_public on public.templates;
create policy templates_select_public
  on public.templates for select
  using (coalesce(is_public,false) = true);

-- Optional: authenticated can insert templates (if you allow)
drop policy if exists templates_insert_authenticated on public.templates;
create policy templates_insert_authenticated
  on public.templates for insert
  with check (auth.role() = 'authenticated');

-- Avoid owner-based update/delete on templates unless a user_id column exists
-- If you add user_id to templates, you can later enable owner policies.

commit;