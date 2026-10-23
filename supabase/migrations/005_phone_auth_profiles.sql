-- =============================================================================
-- KSAM DEAL - MIGRATION 005: PHONE OTP AUTHENTICATION & PROFILES SYNCHRONIZATION
-- =============================================================================
-- 1. Ensure public.profiles table exists with id, full_name, phone, created_at, updated_at
-- 2. Trigger on auth.users for new signups (populates full_name and phone)
-- 3. Trigger on auth.users to sync phone updates
-- 4. Strict Row Level Security (RLS) policies for user privacy
-- 5. Helper function for verifying phone confirmation status
-- =============================================================================

-- 1. PROFILES TABLE CREATION / EXTENSION
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  avatar_url text,
  preferences jsonb not null default '{}'::jsonb,
  marketing_opt_in boolean not null default false,
  consent_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure phone and full_name columns exist if profiles was previously created
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- Unique index on phone number in public.profiles (ignoring null or empty strings)
create unique index if not exists idx_profiles_phone_unique
  on public.profiles(phone)
  where phone is not null and phone <> '';

-- 2. AUTOMATIC PROFILE CREATION TRIGGER
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    phone,
    full_name,
    email,
    avatar_url,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(new.phone, new.raw_user_meta_data->>'phone'),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.created_at, now()),
    now()
  )
  on conflict (id) do update set
    phone = coalesce(excluded.phone, public.profiles.phone),
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

-- 3. SYNC PHONE & METADATA ON UPDATE
create or replace function public.sync_profile_phone()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.phone is distinct from old.phone) or
     (new.raw_user_meta_data->>'full_name' is distinct from old.raw_user_meta_data->>'full_name') then
    update public.profiles
    set
      phone = coalesce(new.phone, new.raw_user_meta_data->>'phone', public.profiles.phone),
      full_name = coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', public.profiles.full_name),
      updated_at = now()
    where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_profile_phone on auth.users;
create trigger trg_sync_profile_phone
  after update of phone, raw_user_meta_data on auth.users
  for each row
  execute function public.sync_profile_phone();

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;

drop policy if exists "profile select own" on public.profiles;
create policy "profile select own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profile insert own" on public.profiles;
create policy "profile insert own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profile update own" on public.profiles;
create policy "profile update own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 5. ROUTE / DATA ACCESS HELPER: CHECK IF CURRENT USER PHONE IS CONFIRMED
create or replace function public.is_phone_verified()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from auth.users
    where id = auth.uid()
      and phone_confirmed_at is not null
  );
$$;
