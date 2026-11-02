-- =============================================================================
-- KSAM DEAL - MIGRATION 007: ORDERS, ORDER ITEMS, SHIPMENTS & PRODUCT REVIEWS
-- Idempotent: safe to run multiple times with IF NOT EXISTS.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ORDERS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_number text not null unique,
  total_amount numeric(12,2) not null check (total_amount >= 0),
  subtotal numeric(12,2) not null default 0,
  delivery_charge numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  payment_status text not null default 'Pending'
    check (payment_status in ('Pending', 'Paid', 'Failed', 'Refunded', 'COD')),
  order_status text not null default 'Order Placed'
    check (order_status in (
      'Order Placed',
      'Payment Successful',
      'Order Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Successfully Delivered',
      'Cancelled'
    )),
  payment_method text not null default 'Online',
  transaction_id text,
  shipping_address jsonb not null default '{}'::jsonb,
  customer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_number_idx on public.orders(order_number);
create index if not exists orders_status_idx on public.orders(order_status);

-- -----------------------------------------------------------------------------
-- 2. ORDER ITEMS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  product_image text,
  category text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  review_status text not null default 'pending'
    check (review_status in ('pending', 'reviewed', 'ineligible')),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists order_items_product_idx on public.order_items(product_id);

-- -----------------------------------------------------------------------------
-- 3. SHIPMENTS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade unique,
  tracking_number text not null unique,
  delivery_partner text not null default 'BlueDart Express',
  partner_contact text default '+91 1800 209 1234',
  current_location text not null default 'Origin Fulfillment Center, Mumbai Hub',
  estimated_delivery date not null default (current_date + interval '3 days'),
  actual_delivery timestamptz,
  shipment_status text not null default 'Order Placed'
    check (shipment_status in (
      'Order Placed',
      'Payment Confirmed',
      'Order Processing',
      'Packed',
      'Shipped',
      'In Transit',
      'Out for Delivery',
      'Successfully Delivered',
      'Returned'
    )),
  updated_at timestamptz not null default now()
);

create index if not exists shipments_order_idx on public.shipments(order_id);
create index if not exists shipments_tracking_idx on public.shipments(tracking_number);

-- -----------------------------------------------------------------------------
-- 4. SHIPMENT EVENTS TABLE (TIMELINE)
-- -----------------------------------------------------------------------------
create table if not exists public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  status text not null,
  location text,
  description text not null,
  event_timestamp timestamptz not null default now()
);

create index if not exists shipment_events_shipment_idx on public.shipment_events(shipment_id);
create index if not exists shipment_events_time_idx on public.shipment_events(event_timestamp);

-- -----------------------------------------------------------------------------
-- 5. PRODUCT REVIEWS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  order_item_id uuid references public.order_items(id) on delete set null,
  product_id text not null,
  user_display_name text not null default 'Verified Customer',
  user_avatar text,
  rating integer not null check (rating between 1 and 5),
  review_title text,
  review_text text not null,
  review_images jsonb default '[]'::jsonb,
  verified_purchase boolean not null default true,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_user_order_item_review unique (user_id, order_item_id)
);

create index if not exists product_reviews_product_idx on public.product_reviews(product_id);
create index if not exists product_reviews_user_idx on public.product_reviews(user_id);

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_events enable row level security;
alter table public.product_reviews enable row level security;

-- Orders Policies
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id or auth.uid() is null);

drop policy if exists "Users can insert own orders" on public.orders;
create policy "Users can insert own orders" on public.orders
  for insert with check (auth.uid() = user_id or user_id is null);

-- Order Items Policies
drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and (o.user_id = auth.uid() or o.user_id is null)
    )
  );

drop policy if exists "Users can insert order items" on public.order_items;
create policy "Users can insert order items" on public.order_items
  for insert with check (true);

-- Shipments Policies
drop policy if exists "Users can view shipments for own orders" on public.shipments;
create policy "Users can view shipments for own orders" on public.shipments
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = shipments.order_id and (o.user_id = auth.uid() or o.user_id is null)
    )
  );

-- Shipment Events Policies
drop policy if exists "Users can view shipment events" on public.shipment_events;
create policy "Users can view shipment events" on public.shipment_events
  for select using (
    exists (
      select 1 from public.shipments s
      join public.orders o on o.id = s.order_id
      where s.id = shipment_events.shipment_id and (o.user_id = auth.uid() or o.user_id is null)
    )
  );

-- Product Reviews Policies
drop policy if exists "Anyone can read approved product reviews" on public.product_reviews;
create policy "Anyone can read approved product reviews" on public.product_reviews
  for select using (is_approved = true or auth.uid() = user_id);

drop policy if exists "Authenticated users can submit product reviews" on public.product_reviews;
create policy "Authenticated users can submit product reviews" on public.product_reviews
  for insert with check (
    auth.uid() = user_id or user_id is null
  );

drop policy if exists "Users can update own reviews" on public.product_reviews;
create policy "Users can update own reviews" on public.product_reviews
  for update using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 7. UPDATED_AT TRIGGER
-- -----------------------------------------------------------------------------
drop trigger if exists orders_updated on public.orders;
create trigger orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists shipments_updated on public.shipments;
create trigger shipments_updated before update on public.shipments
  for each row execute function public.set_updated_at();

drop trigger if exists product_reviews_updated on public.product_reviews;
create trigger product_reviews_updated before update on public.product_reviews
  for each row execute function public.set_updated_at();

