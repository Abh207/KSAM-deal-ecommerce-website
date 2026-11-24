-- =============================================================================
-- KSAM DEAL - MIGRATION 016: SUBSCRIPTIONS, PLANS, PAYMENTS & BILLING DETAILS
--
-- Adds:
-- 1. `plans`: Membership tiers (Explorer, Deal Hunter, Pro).
-- 2. `subscriptions`: User subscriptions with expiry and active constraints.
-- 3. `payments`: Audit log of Razorpay orders and verified transactions.
-- 4. `billing_details`: User billing profile for tax invoices.
-- 5. Strict RLS: Public read for plans; users read own records only; writes restricted to service_role.
-- 6. Expiry SQL function for automated status updates.
--
-- NOTE: DO NOT RUN AUTOMATICALLY. Review and execute this in your Supabase SQL Editor.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. PLANS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  monthly_price numeric not null default 0 check (monthly_price >= 0),
  yearly_price numeric not null default 0 check (yearly_price >= 0),
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed membership plans
insert into public.plans (slug, name, monthly_price, yearly_price, features, is_active)
values
  (
    'explorer',
    'Explorer',
    0,
    0,
    '["Deal discovery", "Product search", "Category filters", "External store links"]'::jsonb,
    true
  ),
  (
    'deal-hunter',
    'Deal Hunter',
    99,
    950,
    '["Everything in Explorer", "Deal alerts", "Saved products", "Price tracking"]'::jsonb,
    true
  ),
  (
    'pro',
    'Pro',
    199,
    1910,
    '["Everything in Deal Hunter", "Advanced tracking", "Personalized recommendations", "AI-powered discovery"]'::jsonb,
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  monthly_price = excluded.monthly_price,
  yearly_price = excluded.yearly_price,
  features = excluded.features,
  is_active = excluded.is_active,
  updated_at = now();

-- -----------------------------------------------------------------------------
-- 2. SUBSCRIPTIONS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  plan_slug text not null,
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly', 'lifetime')),
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled', 'pending')),
  start_date timestamptz not null default now(),
  end_date timestamptz not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  amount_paid numeric not null default 0 check (amount_paid >= 0),
  currency text not null default 'INR',
  auto_renew boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure only one active subscription exists per user
create unique index if not exists one_active_subscription_per_user
  on public.subscriptions (user_id)
  where status = 'active';

create index if not exists subscriptions_user_idx on public.subscriptions (user_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);
create index if not exists subscriptions_end_date_idx on public.subscriptions (end_date);

-- -----------------------------------------------------------------------------
-- 3. PAYMENTS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_slug text not null,
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly', 'lifetime')),
  amount numeric not null check (amount >= 0),
  currency text not null default 'INR',
  razorpay_order_id text not null unique,
  razorpay_payment_id text,
  status text not null default 'created' check (status in ('created', 'paid', 'failed', 'refunded')),
  raw_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments (user_id);
create index if not exists payments_order_idx on public.payments (razorpay_order_id);
create index if not exists payments_status_idx on public.payments (status);

-- -----------------------------------------------------------------------------
-- 4. BILLING DETAILS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.billing_details (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  name text not null,
  email text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  gst_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_details_user_idx on public.billing_details (user_id);

-- -----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.billing_details enable row level security;

-- Plans: publicly readable
drop policy if exists "plans_public_read" on public.plans;
create policy "plans_public_read" on public.plans
  for select using (true);

-- Subscriptions: users can only SELECT their own subscriptions
-- NO client insert, update, or delete; Edge Functions use service_role
drop policy if exists "subscriptions_user_select" on public.subscriptions;
create policy "subscriptions_user_select" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Payments: users can only SELECT their own payments
-- NO client insert, update, or delete; Edge Functions use service_role
drop policy if exists "payments_user_select" on public.payments;
create policy "payments_user_select" on public.payments
  for select using (auth.uid() = user_id);

-- Billing details: users can select, insert, and update their own billing details
drop policy if exists "billing_details_user_select" on public.billing_details;
create policy "billing_details_user_select" on public.billing_details
  for select using (auth.uid() = user_id);

drop policy if exists "billing_details_user_insert" on public.billing_details;
create policy "billing_details_user_insert" on public.billing_details
  for insert with check (auth.uid() = user_id);

drop policy if exists "billing_details_user_update" on public.billing_details;
create policy "billing_details_user_update" on public.billing_details
  for update using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 6. SUBSCRIPTION EXPIRY FUNCTION & CRON
-- -----------------------------------------------------------------------------
create or replace function public.expire_outdated_subscriptions()
returns integer language plpgsql security definer as $$
declare
  expired_count integer;
begin
  update public.subscriptions
  set
    status = 'expired',
    updated_at = now()
  where
    status = 'active'
    and end_date < now();

  get diagnostics expired_count = row_count;
  return expired_count;
end;
$$;

-- Optional pg_cron job: runs daily at midnight UTC if pg_cron is available
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'daily_subscription_expiry_check',
      '0 0 * * *',
      'select public.expire_outdated_subscriptions();'
    );
  end if;
exception when others then
  -- Ignore if pg_cron extension is not enabled
end;
$$;
