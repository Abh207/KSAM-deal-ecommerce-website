-- =============================================================================
-- Migration 009: Create user_carts Table for Realtime Cart Persistence
-- =============================================================================

create table if not exists public.user_carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  name text not null,
  image text,
  price numeric(12,2) not null default 0,
  old_price numeric(12,2),
  category text,
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_carts_user_product_unique unique (user_id, product_id)
);

-- Indexes for lightning fast lookups
create index if not exists user_carts_user_id_idx on public.user_carts (user_id);
create index if not exists user_carts_product_id_idx on public.user_carts (product_id);

-- Enable RLS
alter table public.user_carts enable row level security;

-- Policies for authenticated users
drop policy if exists "Users can view their own cart" on public.user_carts;
create policy "Users can view their own cart"
  on public.user_carts for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert into their own cart" on public.user_carts;
create policy "Users can insert into their own cart"
  on public.user_carts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own cart" on public.user_carts;
create policy "Users can update their own cart"
  on public.user_carts for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete from their own cart" on public.user_carts;
create policy "Users can delete from their own cart"
  on public.user_carts for delete
  using (auth.uid() = user_id);

notify pgrst, 'reload schema';

