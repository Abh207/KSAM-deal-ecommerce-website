-- =============================================================================
-- KSAM DEAL - MIGRATION 20261102: MULTI-PLATFORM DEALS & OFFERS AGGREGATION
-- Idempotent migration adding products schema extensions, product_offers table,
-- click_events table, Row Level Security (RLS) policies, and demo seed data.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. EXTEND PRODUCTS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text,
  created_at timestamptz not null default now()
);

-- Ensure all required columns exist without dropping existing tables
alter table public.products add column if not exists uid text;
alter table public.products add column if not exists name text;
alter table public.products add column if not exists brand text;
alter table public.products add column if not exists category text;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists key_features jsonb default '[]'::jsonb;
alter table public.products add column if not exists specs jsonb default '{}'::jsonb;
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists images text[] default '{}'::text[];
alter table public.products add column if not exists rating numeric default 4.5;
alter table public.products add column if not exists review_count int default 0;
alter table public.products add column if not exists stock int default 25;
alter table public.products add column if not exists is_active boolean not null default true;
alter table public.products add column if not exists is_featured boolean not null default false;
alter table public.products add column if not exists price numeric;
alter table public.products add column if not exists old_price numeric;
alter table public.products add column if not exists discount_percent numeric;
alter table public.products add column if not exists affiliate_url text;
alter table public.products add column if not exists updated_at timestamptz default now();

-- Unique index on uid when present
create unique index if not exists products_uid_idx on public.products (uid) where uid is not null;
create index if not exists products_active_deals_idx on public.products (is_active, discount_percent desc);

-- -----------------------------------------------------------------------------
-- 2. CREATE PRODUCT_OFFERS TABLE (Multi-platform discounts)
-- -----------------------------------------------------------------------------
create table if not exists public.product_offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  platform text not null,        -- 'Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Croma', 'Meesho'
  platform_slug text,            -- 'amazon', 'flipkart', 'myntra', 'ajio', 'croma', 'meesho'
  price numeric not null,
  mrp numeric,
  discount_percent numeric,
  affiliate_url text not null,
  in_stock boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Performance indexes for offer lookups and sorting
create index if not exists product_offers_product_id_idx on public.product_offers (product_id);
create index if not exists product_offers_platform_slug_idx on public.product_offers (platform_slug);
create index if not exists product_offers_in_stock_idx on public.product_offers (in_stock) where in_stock = true;

-- Auto-compute discount_percent trigger
create or replace function public.calc_offer_discount()
returns trigger
language plpgsql
as $$
begin
  if new.mrp is not null and new.price is not null and new.mrp > new.price and new.mrp > 0 then
    new.discount_percent := round(((new.mrp - new.price) / new.mrp) * 100);
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_calc_offer_discount on public.product_offers;
create trigger trg_calc_offer_discount
  before insert or update on public.product_offers
  for each row execute function public.calc_offer_discount();

-- -----------------------------------------------------------------------------
-- 3. CREATE CLICK_EVENTS TABLE (Outbound affiliate tracking)
-- -----------------------------------------------------------------------------
create table if not exists public.click_events (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  platform text,
  affiliate_url text,
  clicked_at timestamptz not null default now(),
  user_agent text
);

create index if not exists click_events_product_idx on public.click_events (product_id);
create index if not exists click_events_clicked_at_idx on public.click_events (clicked_at desc);

-- -----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.product_offers enable row level security;
alter table public.click_events enable row level security;

-- Products: Public can only SELECT active products
drop policy if exists "products_public_read_active" on public.products;
create policy "products_public_read_active"
  on public.products for select
  to anon, authenticated
  using (is_active = true);

-- Offers: Public can only SELECT in-stock offers
drop policy if exists "product_offers_public_read_instock" on public.product_offers;
create policy "product_offers_public_read_instock"
  on public.product_offers for select
  to anon, authenticated
  using (in_stock = true);

-- Click events: Public insert-only (no public select allowed)
drop policy if exists "click_events_public_insert" on public.click_events;
create policy "click_events_public_insert"
  on public.click_events for insert
  to anon, authenticated
  with check (true);

-- -----------------------------------------------------------------------------
-- 5. SEED DEMO DATA (12 products with 2-3 offers each across platforms)
-- NOTE: Replace placeholder affiliate_url values with your real affiliate links.
-- -----------------------------------------------------------------------------

-- Product 1: Sony WH-1000XM5
insert into public.products (
  id, uid, title, name, brand, category, description,
  key_features, specs, images, image_url, rating, review_count, stock, is_active, price, old_price, discount_percent
) values (
  'a1000000-0000-0000-0000-000000000001',
  'audio_sony_wh1000xm5',
  'Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones',
  'Sony WH-1000XM5 ANC Headphones',
  'Sony',
  'Audio',
  'Industry-leading noise cancellation with two processors and 8 microphones. Magnificent sound engineered with precision and ultra-clear hands-free calling with 4 beamforming microphones.',
  '["Industry-leading noise cancellation with Auto NC Optimizer", "Up to 30 hours battery life with quick charging (3 min for 3 hours)", "Crystal-clear hands-free calling with 4 beamforming microphones", "Multipoint connection allows switching between two devices seamlessly", "Touch sensor controls to pause play skip tracks and adjust volume"]'::jsonb,
  '{"Brand": "Sony", "Category": "Audio", "Model / SKU": "WH1000XM5/B", "Connectivity": "Bluetooth 5.2 / 3.5mm", "Battery / Playback": "30 Hours ANC On", "Warranty": "1-Year Official Sony India Warranty", "Availability": "In Stock"}'::jsonb,
  array['headphone.png'],
  'headphone.png',
  4.8, 12450, 42, true, 26990, 34990, 23
) on conflict (id) do update set
  title = excluded.title, name = excluded.name, brand = excluded.brand, category = excluded.category,
  description = excluded.description, key_features = excluded.key_features, specs = excluded.specs,
  images = excluded.images, image_url = excluded.image_url, rating = excluded.rating,
  review_count = excluded.review_count, stock = excluded.stock, is_active = excluded.is_active;

insert into public.product_offers (product_id, platform, platform_slug, price, mrp, discount_percent, affiliate_url, in_stock) values
  ('a1000000-0000-0000-0000-000000000001', 'Amazon', 'amazon', 26990, 34990, 23, 'https://www.amazon.in/dp/B09XS7JWHH?tag=ksamdeal-21', true),
  ('a1000000-0000-0000-0000-000000000001', 'Croma', 'croma', 28990, 34990, 17, 'https://www.croma.com/sony-wh-1000xm5-bluetooth-headphone/p/257123', true),
  ('a1000000-0000-0000-0000-000000000001', 'Flipkart', 'flipkart', 27499, 34990, 21, 'https://www.flipkart.com/sony-wh-1000xm5-bluetooth-headset/p/itm123456789', true)
on conflict do nothing;

-- Product 2: Apple MacBook Air M2
insert into public.products (
  id, uid, title, name, brand, category, description,
  key_features, specs, images, image_url, rating, review_count, stock, is_active, price, old_price, discount_percent
) values (
  'a1000000-0000-0000-0000-000000000002',
  'laptops_macbook_air_m2',
  'Apple 2022 MacBook Air Laptop with M2 chip (13.6-inch Liquid Retina, 8GB RAM, 256GB SSD)',
  'Apple MacBook Air M2 (13.6-inch)',
  'Apple',
  'Laptops',
  'Strikingly thin design with blazing-fast next-generation M2 chip. Up to 18 hours of battery life and a stunning 13.6-inch Liquid Retina display with over 500 nits of brightness.',
  '["M2 chip with 8-core CPU and up to 10-core GPU", "Up to 18 hours battery life to go all day and into the night", "13.6-inch Liquid Retina display with 500 nits brightness and P3 wide color", "1080p FaceTime HD camera, three-mic array and four-speaker sound system", "MagSafe 3 charging port, two Thunderbolt ports and headphone jack"]'::jsonb,
  '{"Brand": "Apple", "Category": "Laptops", "Model / SKU": "MLXW3HN/A", "Processor": "Apple M2 8-Core", "RAM / Storage": "8GB Unified / 256GB SSD", "Warranty": "1-Year Apple Limited Warranty", "Availability": "In Stock"}'::jsonb,
  array['laptop-image.png'],
  'laptop-image.png',
  4.9, 8740, 15, true, 84990, 114900, 26
) on conflict (id) do update set
  title = excluded.title, name = excluded.name, is_active = excluded.is_active;

insert into public.product_offers (product_id, platform, platform_slug, price, mrp, discount_percent, affiliate_url, in_stock) values
  ('a1000000-0000-0000-0000-000000000002', 'Amazon', 'amazon', 84990, 114900, 26, 'https://www.amazon.in/dp/B0B3C4LN8V?tag=ksamdeal-21', true),
  ('a1000000-0000-0000-0000-000000000002', 'Flipkart', 'flipkart', 87990, 114900, 23, 'https://www.flipkart.com/apple-macbook-air-m2/p/itm123macbook', true),
  ('a1000000-0000-0000-0000-000000000002', 'Croma', 'croma', 89900, 114900, 22, 'https://www.croma.com/apple-macbook-air-m2/p/256789', true)
on conflict do nothing;

-- Product 3: Samsung Galaxy S24 Ultra
insert into public.products (
  id, uid, title, name, brand, category, description,
  key_features, specs, images, image_url, rating, review_count, stock, is_active, price, old_price, discount_percent
) values (
  'a1000000-0000-0000-0000-000000000003',
  'mobiles_samsung_s24_ultra',
  'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB RAM, 256GB Storage)',
  'Samsung Galaxy S24 Ultra 5G',
  'Samsung',
  'Mobiles',
  'Meet Galaxy S24 Ultra with Galaxy AI. Titanium shield exterior, 200MP camera with Quad Telephoto system, and the brightest flat Dynamic AMOLED 2X display with anti-reflective Corning Gorilla Armor.',
  '["Galaxy AI search like never before with Circle to Search", "Titanium frame durability with IP68 water and dust resistance", "200MP wide camera with 5x optical zoom and 100x digital zoom", "Snapdragon 8 Gen 3 for Galaxy processor with ray tracing", "5000 mAh battery with 45W super fast charging support"]'::jsonb,
  '{"Brand": "Samsung", "Category": "Mobiles", "Model / SKU": "SM-S928B", "Display": "6.8 inch QHD+ Dynamic AMOLED 2X 120Hz", "RAM / Storage": "12GB / 256GB", "Warranty": "1-Year Manufacturer Warranty", "Availability": "In Stock"}'::jsonb,
  array['smartPhone.png'],
  'smartPhone.png',
  4.7, 6120, 28, true, 119999, 134999, 11
) on conflict (id) do update set
  title = excluded.title, name = excluded.name, is_active = excluded.is_active;

insert into public.product_offers (product_id, platform, platform_slug, price, mrp, discount_percent, affiliate_url, in_stock) values
  ('a1000000-0000-0000-0000-000000000003', 'Amazon', 'amazon', 119999, 134999, 11, 'https://www.amazon.in/dp/B0CS5X8SKF?tag=ksamdeal-21', true),
  ('a1000000-0000-0000-0000-000000000003', 'Flipkart', 'flipkart', 121999, 134999, 10, 'https://www.flipkart.com/samsung-galaxy-s24-ultra/p/itmgalaxys24', true)
on conflict do nothing;

-- Product 4: Nike Air Max 270 Sneakers
insert into public.products (
  id, uid, title, name, brand, category, description,
  key_features, specs, images, image_url, rating, review_count, stock, is_active, price, old_price, discount_percent
) values (
  'a1000000-0000-0000-0000-000000000004',
  'shoes_nike_air_max_270',
  'Nike Air Max 270 Men Casual Running and Lifestyle Sneakers',
  'Nike Air Max 270 Sneakers',
  'Nike',
  'Shoes',
  'Boasting Nike biggest heel Air unit yet, the Nike Air Max 270 delivers unmatched visible cushioning under every step. Breathable woven mesh upper with stretchy interior sleeve creates a snug, sock-like fit.',
  '["Max Air 270 unit delivers peerless, all-day cushioning", "Engineered woven mesh upper offers lightweight breathability", "Stretchy inner sleeve creates a personalized glove-like fit", "Solid rubber outsole provides durable traction and stability", "Dual-density foam midsole provides soft, responsive energy return"]'::jsonb,
  '{"Brand": "Nike", "Category": "Shoes", "Model / SKU": "AH8050-002", "Upper Material": "Breathable Engineered Mesh", "Sole": "Max Air 270 Unit + Rubber", "Warranty": "Manufacturer Brand Warranty", "Availability": "In Stock"}'::jsonb,
  array['products/shoes/shoe1.png'],
  'products/shoes/shoe1.png',
  4.6, 3410, 19, true, 8995, 14995, 40
) on conflict (id) do update set
  title = excluded.title, name = excluded.name, is_active = excluded.is_active;

insert into public.product_offers (product_id, platform, platform_slug, price, mrp, discount_percent, affiliate_url, in_stock) values
  ('a1000000-0000-0000-0000-000000000004', 'Myntra', 'myntra', 8995, 14995, 40, 'https://www.myntra.com/shoes/nike/nike-air-max-270/1234567/buy', true),
  ('a1000000-0000-0000-0000-000000000004', 'Ajio', 'ajio', 9495, 14995, 37, 'https://www.ajio.com/nike-air-max-270-sneakers/p/461234567', true),
  ('a1000000-0000-0000-0000-000000000004', 'Amazon', 'amazon', 9999, 14995, 33, 'https://www.amazon.in/dp/B07DNQ6Q84?tag=ksamdeal-21', true)
on conflict do nothing;

-- Product 5: Levi's Men Classic Trucker Denim Jacket
insert into public.products (
  id, uid, title, name, brand, category, description,
  key_features, specs, images, image_url, rating, review_count, stock, is_active, price, old_price, discount_percent
) values (
  'a1000000-0000-0000-0000-000000000005',
  'fashion_levis_denim_jacket',
  'Levis Men Solid Original Cotton Trucker Denim Jacket',
  'Levis Classic Trucker Jacket',
  'Levis',
  'Fashion',
  'The quintessential denim jacket that has defined casual style for generations. Tailored with heavyweight 100% cotton denim, point collar, button-flap chest pockets and side waist adjusters.',
  '["100% pure premium heavyweight cotton denim", "Original straight fit through the body and sleeves", "Shank button front closure with embossed metal hardware", "Chest flap pockets with button closures and side welt pockets", "Pre-washed for comfortable softness from day one"]'::jsonb,
  '{"Brand": "Levis", "Category": "Fashion", "Model / SKU": "72334-0136", "Material": "100% Heavyweight Cotton", "Care": "Machine Wash Cold Inside Out", "Warranty": "Manufacturer Brand Warranty", "Availability": "In Stock"}'::jsonb,
  array['products/clothes/cloth1.png'],
  'products/clothes/cloth1.png',
  4.5, 1890, 36, true, 2799, 5999, 53
) on conflict (id) do update set
  title = excluded.title, name = excluded.name, is_active = excluded.is_active;

insert into public.product_offers (product_id, platform, platform_slug, price, mrp, discount_percent, affiliate_url, in_stock) values
  ('a1000000-0000-0000-0000-000000000005', 'Flipkart', 'flipkart', 2799, 5999, 53, 'https://www.flipkart.com/levis-trucker-denim-jacket/p/itmlevisdenim', true),
  ('a1000000-0000-0000-0000-000000000005', 'Myntra', 'myntra', 2999, 5999, 50, 'https://www.myntra.com/jackets/levis/levis-mens-trucker-jacket/2345678/buy', true),
  ('a1000000-0000-0000-0000-000000000005', 'Amazon', 'amazon', 3249, 5999, 46, 'https://www.amazon.in/dp/B07FY7L2M9?tag=ksamdeal-21', true)
on conflict do nothing;

-- Product 6: boAt Airdopes 141 ANC
insert into public.products (
  id, uid, title, name, brand, category, description,
  key_features, specs, images, image_url, rating, review_count, stock, is_active, price, old_price, discount_percent
) values (
  'a1000000-0000-0000-0000-000000000006',
  'audio_boat_airdopes_141_anc',
  'boAt Airdopes 141 ANC with 32dB Active Noise Cancellation and 42H Playtime',
  'boAt Airdopes 141 ANC',
  'boAt',
  'Audio',
  'Escape the noise with up to 32dB Active Noise Cancellation. Featuring 42 hours of total playtime, BEAST Mode with 50ms low latency for gaming, and quad mics with ENx technology for pristine voice clarity.',
  '["Up to 32dB Active Noise Cancellation with Ambient Mode", "42 Hours total playtime with ASAP Charge (10 min = 150 min)", "BEAST Mode ultra-low 50ms latency for real-time mobile gaming", "Quad mics with ENx technology for crystal-clear calling", "IPX5 water and sweat resistance for heavy workouts"]'::jsonb,
  '{"Brand": "boAt", "Category": "Audio", "Model / SKU": "Airdopes 141 ANC", "Drivers": "10mm Dynamic Drivers", "Battery / Playback": "42 Hours Total (ASAP Charge)", "Warranty": "1-Year boAt India Warranty", "Availability": "In Stock"}'::jsonb,
  array['speakers.png'],
  'speakers.png',
  4.4, 28900, 75, true, 1499, 5990, 75
) on conflict (id) do update set
  title = excluded.title, name = excluded.name, is_active = excluded.is_active;

insert into public.product_offers (product_id, platform, platform_slug, price, mrp, discount_percent, affiliate_url, in_stock) values
  ('a1000000-0000-0000-0000-000000000006', 'Amazon', 'amazon', 1499, 5990, 75, 'https://www.amazon.in/dp/B0C7L7Y7W5?tag=ksamdeal-21', true),
  ('a1000000-0000-0000-0000-000000000006', 'Flipkart', 'flipkart', 1599, 5990, 73, 'https://www.flipkart.com/boat-airdopes-141-anc/p/itmboat141', true),
  ('a1000000-0000-0000-0000-000000000006', 'Croma', 'croma', 1699, 5990, 72, 'https://www.croma.com/boat-airdopes-141-anc/p/269874', true)
on conflict do nothing;

-- Product 7: Green Soul Monster Ultimate Ergonomic Gaming Chair
insert into public.products (
  id, uid, title, name, brand, category, description,
  key_features, specs, images, image_url, rating, review_count, stock, is_active, price, old_price, discount_percent
) values (
  'a1000000-0000-0000-0000-000000000007',
  'home_green_soul_gaming_chair',
  'Green Soul Monster Ultimate Series Ergonomic Gaming and Office Chair',
  'Green Soul Monster Gaming Chair',
  'Green Soul',
  'Home',
  'Engineered for ultimate posture and lumbar alignment during marathon work and gaming sessions. Premium breathable spandex and PU leather upholstery with high-density cold-cured foam cushioning.',
  '["Heavy-duty aerospace-grade metal frame with Class 4 gas lift", "Multi-functional tilt lock mechanism reclining up to 180 degrees", "4D adjustable armrests for height angle and forward-backward motion", "Memory foam neck pillow and magnetic magnetic lumbar cushion", "Industrial nylon twin caster wheels safe for hardwood floors"]'::jsonb,
  '{"Brand": "Green Soul", "Category": "Home", "Model / SKU": "GS-734U", "Material": "Spandex + PU Leather / Steel Frame", "Weight Capacity": "120 kg Max Load", "Warranty": "3-Year Manufacturer Warranty", "Availability": "In Stock"}'::jsonb,
  array['3dChair.png'],
  '3dChair.png',
  4.7, 4210, 14, true, 16990, 29990, 43
) on conflict (id) do update set
  title = excluded.title, name = excluded.name, is_active = excluded.is_active;

insert into public.product_offers (product_id, platform, platform_slug, price, mrp, discount_percent, affiliate_url, in_stock) values
  ('a1000000-0000-0000-0000-000000000007', 'Amazon', 'amazon', 16990, 29990, 43, 'https://www.amazon.in/dp/B08HRZ8Q56?tag=ksamdeal-21', true),
  ('a1000000-0000-0000-0000-000000000007', 'Flipkart', 'flipkart', 17499, 29990, 42, 'https://www.flipkart.com/green-soul-monster-chair/p/itmchairgreensoul', true)
on conflict do nothing;

-- Product 8: Sony PlayStation 5 Slim Console
insert into public.products (
  id, uid, title, name, brand, category, description,
  key_features, specs, images, image_url, rating, review_count, stock, is_active, price, old_price, discount_percent
) values (
  'a1000000-0000-0000-0000-000000000008',
  'gaming_sony_playstation_5_slim',
  'Sony PlayStation 5 Console (Slim) with 1TB Custom SSD and DualSense Controller',
  'Sony PlayStation 5 Slim Console',
  'Sony',
  'Gaming',
  'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers and 3D Audio, and an all-new generation of incredible PlayStation games.',
  '["Slim modern form factor with 1TB ultra-fast internal NVMe SSD", "Haptic feedback and dynamic adaptive triggers via DualSense controller", "Ray tracing acceleration supporting up to 120 fps at 4K resolution", "Tempest 3D AudioTech soundscapes for pinpoint spatial awareness", "Backwards compatibility with over 4000 PlayStation 4 titles"]'::jsonb,
  '{"Brand": "Sony", "Category": "Gaming", "Model / SKU": "CFI-2000", "Storage": "1TB Custom High-Speed SSD", "Video Output": "4K 120Hz / 8K Support", "Warranty": "1-Year Official Sony India Warranty", "Availability": "In Stock"}'::jsonb,
  array['mouse.png'],
  'mouse.png',
  4.9, 9840, 11, true, 49990, 54990, 9
) on conflict (id) do update set
  title = excluded.title, name = excluded.name, is_active = excluded.is_active;

insert into public.product_offers (product_id, platform, platform_slug, price, mrp, discount_percent, affiliate_url, in_stock) values
  ('a1000000-0000-0000-0000-000000000008', 'Amazon', 'amazon', 49990, 54990, 9, 'https://www.amazon.in/dp/B0CX2995D7?tag=ksamdeal-21', true),
  ('a1000000-0000-0000-0000-000000000008', 'Flipkart', 'flipkart', 50990, 54990, 7, 'https://www.flipkart.com/sony-playstation-5-slim/p/itmps5slim', true),
  ('a1000000-0000-0000-0000-000000000008', 'Croma', 'croma', 51990, 54990, 5, 'https://www.croma.com/sony-playstation-5-slim/p/305891', true)
on conflict do nothing;

-- Product 9: OnePlus Watch 2 Smartwatch
insert into public.products (
  id, uid, title, name, brand, category, description,
  key_features, specs, images, image_url, rating, review_count, stock, is_active, price, old_price, discount_percent
) values (
  'a1000000-0000-0000-0000-000000000009',
  'watches_oneplus_watch_2',
  'OnePlus Watch 2 with Wear OS by Google, Dual-Engine Architecture and 100H Battery Life',
  'OnePlus Watch 2 Smartwatch',
  'OnePlus',
  'Watches',
  'Your partner in precision. Dual-Engine Architecture powered by Snapdragon W5 and BES2700 chipsets delivers up to 100 hours of battery life with Wear OS 4. Stainless steel chassis and sapphire crystal glass.',
  '["Dual-Engine Architecture: Snapdragon W5 + BES2700 chipset", "Up to 100 hours battery life in smart mode and 12 days in power saver", "Wear OS by Google with Google Maps Wallet and Assistant on wrist", "Dual-frequency L1+L5 GPS for precise outdoor running and cycling tracks", "Military-grade 5ATM + IP68 water resistance with MIL-STD-810H durability"]'::jsonb,
  '{"Brand": "OnePlus", "Category": "Watches", "Model / SKU": "OPW241", "Dial Glass": "Sapphire Crystal Glass", "Water Resistance": "5ATM + IP68 Rated", "Warranty": "1-Year Manufacturer Warranty", "Availability": "In Stock"}'::jsonb,
  array['watch.png'],
  'watch.png',
  4.6, 2140, 22, true, 19999, 27999, 29
) on conflict (id) do update set
  title = excluded.title, name = excluded.name, is_active = excluded.is_active;

insert into public.product_offers (product_id, platform, platform_slug, price, mrp, discount_percent, affiliate_url, in_stock) values
  ('a1000000-0000-0000-0000-000000000009', 'Amazon', 'amazon', 19999, 27999, 29, 'https://www.amazon.in/dp/B0CS5Q3XZM?tag=ksamdeal-21', true),
  ('a1000000-0000-0000-0000-000000000009', 'Flipkart', 'flipkart', 20999, 27999, 25, 'https://www.flipkart.com/oneplus-watch-2/p/itmonepluswatch2', true),
  ('a1000000-0000-0000-0000-000000000009', 'Croma', 'croma', 21499, 27999, 23, 'https://www.croma.com/oneplus-watch-2-smartwatch/p/305124', true)
on conflict do nothing;

-- Product 10: LG 55-inch 4K OLED Smart TV
insert into public.products (
  id, uid, title, name, brand, category, description,
  key_features, specs, images, image_url, rating, review_count, stock, is_active, price, old_price, discount_percent
) values (
  'a1000000-0000-0000-0000-000000000010',
  'electronics_lg_55_oled_c3',
  'LG 55 inch 4K Ultra HD Smart OLED TV with Dolby Vision and webOS 23',
  'LG 55-inch 4K OLED TV (C3)',
  'LG',
  'Electronics',
  'Infinite contrast with self-lit OLED pixels delivering deep pure blacks. Powered by the α9 AI Processor Gen6 with 4K Super Upscaling, Dolby Vision Atmos, and 0.1ms response time with Nvidia G-Sync.',
  '["Self-lit OLED pixels produce infinite contrast and 100% color fidelity", "α9 AI Processor Gen6 for intelligent picture tone mapping and audio", "Dolby Vision IQ and Dolby Atmos cinema sound from integrated speakers", "0.1ms response time with 4x HDMI 2.1 ports, G-Sync and FreeSync Premium", "webOS 23 with personalized user profiles and hands-free voice control"]'::jsonb,
  '{"Brand": "LG", "Category": "Electronics", "Model / SKU": "OLED55C3PSA", "Resolution": "4K Ultra HD (3840 x 2160) 120Hz", "Audio": "40W 2.2 Channel Dolby Atmos", "Warranty": "3-Year LG India Comprehensive Warranty", "Availability": "In Stock"}'::jsonb,
  array['tv.png'],
  'tv.png',
  4.8, 1540, 8, true, 114990, 169990, 32
) on conflict (id) do update set
  title = excluded.title, name = excluded.name, is_active = excluded.is_active;

insert into public.product_offers (product_id, platform, platform_slug, price, mrp, discount_percent, affiliate_url, in_stock) values
  ('a1000000-0000-0000-0000-000000000010', 'Amazon', 'amazon', 114990, 169990, 32, 'https://www.amazon.in/dp/B0C39M5B6G?tag=ksamdeal-21', true),
  ('a1000000-0000-0000-0000-000000000010', 'Croma', 'croma', 119990, 169990, 29, 'https://www.croma.com/lg-c3-55-inch-oled-4k-tv/p/271290', true),
  ('a1000000-0000-0000-0000-000000000010', 'Flipkart', 'flipkart', 122490, 169990, 28, 'https://www.flipkart.com/lg-c3-55-inch-oled-4k-tv/p/itmlgc355', true)
on conflict do nothing;

-- Product 11: Dyson V12 Detect Slim Cordless Vacuum
insert into public.products (
  id, uid, title, name, brand, category, description,
  key_features, specs, images, image_url, rating, review_count, stock, is_active, price, old_price, discount_percent
) values (
  'a1000000-0000-0000-0000-000000000011',
  'home_dyson_v12_detect_slim',
  'Dyson V12 Detect Slim Total Clean Cordless Vacuum Cleaner with Laser Reveal',
  'Dyson V12 Detect Slim Vacuum',
  'Dyson',
  'Home',
  'Dyson lightest intelligent cordless vacuum with laser illumination that reveals invisible dust on hard floors. Piezo sensor continuously sizes and counts dust particles, automatically increasing suction when needed.',
  '["Fluffy Optic cleaner head reveals twice the amount of invisible dust", "Acoustic piezo sensor measures and counts microscopic dust particles", "Up to 60 minutes of run time with click-in interchangeable battery", "Motorized Hair screw tool de-tangles hair into the bin automatically", "Single-button power control for comfortable, continuous cleaning"]'::jsonb,
  '{"Brand": "Dyson", "Category": "Home", "Model / SKU": "V12 Detect Slim", "Weight": "2.2 kg Lightweight", "Suction Power": "150 AW Strong Suction", "Warranty": "2-Year Dyson India Warranty", "Availability": "In Stock"}'::jsonb,
  array['Heater.png'],
  'Heater.png',
  4.7, 3120, 17, true, 44900, 55900, 20
) on conflict (id) do update set
  title = excluded.title, name = excluded.name, is_active = excluded.is_active;

insert into public.product_offers (product_id, platform, platform_slug, price, mrp, discount_percent, affiliate_url, in_stock) values
  ('a1000000-0000-0000-0000-000000000011', 'Amazon', 'amazon', 44900, 55900, 20, 'https://www.amazon.in/dp/B09SPZ7L2R?tag=ksamdeal-21', true),
  ('a1000000-0000-0000-0000-000000000011', 'Croma', 'croma', 46900, 55900, 16, 'https://www.croma.com/dyson-v12-detect-slim-cordless-vacuum/p/248912', true)
on conflict do nothing;

-- Product 12: Forest Essentials Ayurvedic Soundarya Radiance Cream
insert into public.products (
  id, uid, title, name, brand, category, description,
  key_features, specs, images, image_url, rating, review_count, stock, is_active, price, old_price, discount_percent
) values (
  'a1000000-0000-0000-0000-000000000012',
  'beauty_forest_essentials_soundarya',
  'Forest Essentials Soundarya Radiance Cream with 24K Gold and SPF 25',
  'Forest Essentials Soundarya Cream',
  'Forest Essentials',
  'Beauty',
  'An exceptionally rich day cream infused with pure 24 Karat Gold bhasma, saffron and cold-pressed organic oils. Nourishes the skin with natural SPF 25 protection and restores youthful elasticity and luminous glow.',
  '["Infused with pure 24K Gold bhasma for cellular collagen stimulation", "Contains cold-pressed organic almond and sesame seed oils", "Natural SPF 25 protects against harmful UV photo-aging", "Clinically proven to improve skin elasticity firmness and radiance", "100% natural Ayurvedic recipe free from parabens and mineral oils"]'::jsonb,
  '{"Brand": "Forest Essentials", "Category": "Beauty", "Model / SKU": "FE-SND-50G", "Volume": "50g Glass Jar", "Skin Type": "All Skin Types / Anti-Aging", "Warranty": "100% Authentic KSAM Certified", "Availability": "In Stock"}'::jsonb,
  array['products/clothes/cloth3.png'],
  'products/clothes/cloth3.png',
  4.8, 4820, 31, true, 3995, 5995, 33
) on conflict (id) do update set
  title = excluded.title, name = excluded.name, is_active = excluded.is_active;

insert into public.product_offers (product_id, platform, platform_slug, price, mrp, discount_percent, affiliate_url, in_stock) values
  ('a1000000-0000-0000-0000-000000000012', 'Myntra', 'myntra', 3995, 5995, 33, 'https://www.myntra.com/face-cream/forest-essentials/forest-essentials-soundarya-radiance-cream/3456789/buy', true),
  ('a1000000-0000-0000-0000-000000000012', 'Ajio', 'ajio', 4295, 5995, 28, 'https://www.ajio.com/forest-essentials-soundarya-cream/p/462345678', true),
  ('a1000000-0000-0000-0000-000000000012', 'Amazon', 'amazon', 4450, 5995, 26, 'https://www.amazon.in/dp/B00KAE6VFE?tag=ksamdeal-21', true)
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- END OF MIGRATION 20261102
-- -----------------------------------------------------------------------------

