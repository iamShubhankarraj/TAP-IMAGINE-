-- 002_create_projects.sql - Create projects table and RLS policies
-- Requires: Supabase Postgres with auth schema

-- Enable uuid generation
create extension if not exists "pgcrypto";

-- Create table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled Project',
  description text,
  data jsonb not null default '{}'::jsonb,
  primary_image_url text,
  generated_image_url text,
  thumbnail_url text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists projects_user_created_idx on public.projects (user_id, created_at);
create index if not exists projects_public_created_idx on public.projects (is_public, created_at);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.projects;
create trigger set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

-- Row Level Security
alter table public.projects enable row level security;

-- Policies
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'projects' and policyname = 'Allow read own or public projects'
  ) then
    create policy "Allow read own or public projects"
    on public.projects
    for select
    using (auth.uid() = user_id or is_public = true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'projects' and policyname = 'Allow insert for owner'
  ) then
    create policy "Allow insert for owner"
    on public.projects
    for insert
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'projects' and policyname = 'Allow update for owner'
  ) then
    create policy "Allow update for owner"
    on public.projects
    for update
    using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'projects' and policyname = 'Allow delete for owner'
  ) then
    create policy "Allow delete for owner"
    on public.projects
    for delete
    using (auth.uid() = user_id);
  end if;
end $$;