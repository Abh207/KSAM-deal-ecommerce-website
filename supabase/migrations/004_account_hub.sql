-- =============================================================================
-- KSAM DEAL - MIGRATION 004: ACCOUNT HUB, PRICE ALERTS, RECENTLY VIEWED,
-- CONTACT MESSAGES & EMAIL SYNCHRONIZATION
-- Idempotent: safe to run multiple times with IF NOT EXISTS and DROP ... IF EXISTS.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. PROFILES EXTENSIONS
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  date_of_birth date,
  gender text check (gender in ('female','male','other','prefer_not_to_say')),
  avatar_url text,
  preferences jsonb not null default '{}'::jsonb,
  marketing_opt_in boolean not null default false,
  consent_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists date_of_birth date;
alter table public.profiles add column if not exists gender text check (gender in ('female','male','other','prefer_not_to_say'));
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists preferences jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists marketing_opt_in boolean not null default false;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- -----------------------------------------------------------------------------
-- 2. PRICE ALERTS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  target_price numeric not null check (target_price > 0),
  is_active boolean not null default true,
  triggered_at timestamptz,
  created_at timestamptz not null default now(),
  constraint uq_price_alerts_user_product unique (user_id, product_id)
);

create index if not exists price_alerts_user_idx on public.price_alerts (user_id);
create index if not exists price_alerts_product_idx on public.price_alerts (product_id);

alter table public.price_alerts enable row level security;

drop policy if exists "price_alerts_select_own" on public.price_alerts;
create policy "price_alerts_select_own"
  on public.price_alerts for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "price_alerts_insert_own" on public.price_alerts;
create policy "price_alerts_insert_own"
  on public.price_alerts for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "price_alerts_update_own" on public.price_alerts;
create policy "price_alerts_update_own"
  on public.price_alerts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "price_alerts_delete_own" on public.price_alerts;
create policy "price_alerts_delete_own"
  on public.price_alerts for delete
  to authenticated
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. RECENTLY VIEWED TABLE & TRACKING FUNCTION
-- -----------------------------------------------------------------------------
create table if not exists public.recently_viewed (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists recently_viewed_user_viewed_idx
  on public.recently_viewed (user_id, viewed_at desc);

alter table public.recently_viewed enable row level security;

drop policy if exists "recently_viewed_select_own" on public.recently_viewed;
create policy "recently_viewed_select_own"
  on public.recently_viewed for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "recently_viewed_insert_own" on public.recently_viewed;
create policy "recently_viewed_insert_own"
  on public.recently_viewed for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "recently_viewed_update_own" on public.recently_viewed;
create policy "recently_viewed_update_own"
  on public.recently_viewed for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "recently_viewed_delete_own" on public.recently_viewed;
create policy "recently_viewed_delete_own"
  on public.recently_viewed for delete
  to authenticated
  using (auth.uid() = user_id);

-- Track product view function: upserts viewed_at and retains top 30 most recent views
create or replace function public.track_product_view(p_product_id uuid)
returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null or p_product_id is null then
    return;
  end if;

  insert into public.recently_viewed (user_id, product_id, viewed_at)
  values (v_user_id, p_product_id, now())
  on conflict (user_id, product_id)
  do update set viewed_at = now();

  -- Keep only the newest 30 rows for this user
  delete from public.recently_viewed
  where user_id = v_user_id
    and product_id not in (
      select product_id
      from public.recently_viewed
      where user_id = v_user_id
      order by viewed_at desc
      limit 30
    );
end;
$$;

-- -----------------------------------------------------------------------------
-- 4. CONTACT MESSAGES TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) >= 2 and char_length(name) <= 80),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject text not null check (char_length(subject) >= 3 and char_length(subject) <= 120),
  message text not null check (char_length(message) >= 10 and char_length(message) <= 2000),
  status text not null default 'new' check (status in ('new', 'read', 'in_progress', 'resolved', 'archived')),
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_user_idx on public.contact_messages (user_id);
create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

-- Public (anon & authenticated) can insert with check constraints
drop policy if exists "contact_messages_insert_any" on public.contact_messages;
create policy "contact_messages_insert_any"
  on public.contact_messages for insert
  to anon, authenticated
  with check (
    char_length(name) >= 2 and char_length(name) <= 80
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and char_length(subject) >= 3 and char_length(subject) <= 120
    and char_length(message) >= 10 and char_length(message) <= 2000
  );

-- Users can only select their own submitted messages
drop policy if exists "contact_messages_select_own" on public.contact_messages;
create policy "contact_messages_select_own"
  on public.contact_messages for select
  to authenticated
  using (auth.uid() = user_id);

-- No public update or delete policies (service_role only)

-- -----------------------------------------------------------------------------
-- 5. EMAIL SYNCHRONIZATION TRIGGER
-- -----------------------------------------------------------------------------
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles
    set email = new.email,
        updated_at = now()
    where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_profile_email on auth.users;
create trigger trg_sync_profile_email
  after update of email on auth.users
  for each row
  execute function public.sync_profile_email();
