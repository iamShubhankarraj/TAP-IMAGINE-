BEGIN;

-- Create profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  bio text,
  plan_type text check (plan_type in ('free','pro','premium')) default 'free' not null,
  plan_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to automatically set updated_at on updates
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- Helpful indexes
create index if not exists profiles_plan_type_idx on public.profiles(plan_type);
create index if not exists profiles_updated_at_idx on public.profiles(updated_at);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies: owner can read/write own profile
drop policy if exists "Profiles owners can select" on public.profiles;
create policy "Profiles owners can select"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Profiles owners can insert" on public.profiles;
create policy "Profiles owners can insert"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Profiles owners can update" on public.profiles;
create policy "Profiles owners can update"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Optional: service_role full access (server-side ops)
drop policy if exists "Service role full access" on public.profiles;
create policy "Service role full access"
on public.profiles
to service_role
using (true)
with check (true);

-- Storage: create avatars bucket (public read)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies for avatars
-- Public read access to avatar images
drop policy if exists "Public read avatars" on storage.objects;
create policy "Public read avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars');

-- Authenticated users can upload to their own folder: {user_id}/filename
drop policy if exists "Users can upload their own avatars" on storage.objects;
create policy "Users can upload their own avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Authenticated users can update objects in their own folder
drop policy if exists "Users can update their own avatars" on storage.objects;
create policy "Users can update their own avatars"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Authenticated users can delete objects in their own folder
drop policy if exists "Users can delete their own avatars" on storage.objects;
create policy "Users can delete their own avatars"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Ensure bio column exists for existing databases
alter table public.profiles add column if not exists bio text;

COMMIT;