-- =============================================================================
-- KSAM DEAL - DATABASE MIGRATION: EMAIL OTP PROFILES & RLS
-- Run this in the Supabase SQL Editor. Safe to run multiple times.
-- =============================================================================

-- 1. Create public.profiles table if not exists
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure columns exist if table was created previously with fewer columns
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- 2. Trigger Function: Automatically insert profile row when a new user is created in auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.created_at, now()),
    now()
  )
  on conflict (id) do update set
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email),
    updated_at = now();
  return new;
end;
$$;

-- Drop and recreate the user creation trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 3. Trigger Function: Sync profile email and name on auth.users update
create or replace function public.sync_profile_user_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.email is distinct from old.email) or
     (new.raw_user_meta_data->>'full_name' is distinct from old.raw_user_meta_data->>'full_name') then
    update public.profiles
    set
      email = coalesce(new.email, public.profiles.email),
      full_name = coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', public.profiles.full_name),
      updated_at = now()
    where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_profile_user_update on auth.users;
create trigger trg_sync_profile_user_update
  after update of email, raw_user_meta_data on auth.users
  for each row
  execute function public.sync_profile_user_update();

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 5. Strict RLS Policies: Users can select and update only their own row
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profile select own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profile insert own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profile update own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
