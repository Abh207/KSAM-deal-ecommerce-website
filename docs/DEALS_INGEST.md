# KSAM Deal — Deals Ingestion & Search Architecture

KSAM Deal is a deal-discovery platform that aggregates discounted products from verified Indian retail stores and directs shoppers to the official store to complete purchases. KSAM Deal does not sell or checkout these products directly.

---

## 1. Architecture Overview

```text
                                  +---------------------------------------+
                                  |            CRON SCHEDULE              |
                                  | (pg_cron + pg_net every 30 mins)      |
                                  +-------------------+-------------------+
                                                      |
                                                      | HTTP POST (X-Ingest-Secret)
                                                      v
+-----------------------+                 +-----------------------+
|  User Searches in UI  |                 |      Edge Function    |
| (Navbar / Deals page) |                 |     `ingest-deals`    |
+-----------+-----------+                 +-----------+-----------+
            |                                         |
            | HTTP POST (anon key)                    |
            v                                         |
+-----------------------+                             |
|      Edge Function    |                             |
|   `search-products`   |                             |
+-----------+-----------+                             |
            |                                         |
            +-------------------+---------------------+
                                |
                                v
               +----------------------------------+
               |        Provider Adapters         |
               | (registry.ts / Promise.allSettled) |
               +----------------+-----------------+
                                |
        +-----------------------+-----------------------+
        |                       |                       |
        v                       v                       v
+---------------+       +---------------+       +--------------------+
|  Amazon PA-API|       |   Flipkart    |       |  Affiliate Network |
|   5.0 (IN)    |       | Affiliate API |       | (Cuelinks / vComm) |
+---------------+       +---------------+       +--------------------+
        |                       |                       |
        +-----------------------+-----------------------+
                                |
                                v
            +---------------------------------------+
            |      Deal Normalizer & Validator      |
            |  - Drops items without price/image    |
            |  - Validates discount >= 10% for feed |
            |  - Cleans title & parses prices       |
            +-------------------+-------------------+
                                |
                                v
            +---------------------------------------+
            |         Supabase PostgreSQL           |
            | - products (full-text tsvector + trgm)|
            | - price_history (records on change)   |
            | - ingest_runs (observability logs)    |
            | - search_demand (popular terms)       |
            | - wishlist (user saved deals)         |
            | - outbound_clicks (affiliate tracking)|
            +---------------------------------------+
```

---

## 2. Secrets Management

All API credentials must be stored strictly in Supabase Secrets. They are read only inside Edge Functions (never bundled or exposed in frontend code):

```bash
# Set your Ingestion authentication secret
supabase secrets set INGEST_SECRET="Qmhvj38blYR0cP9Xdy5OFopgU1Tw2n4CzfZWt7NE"

# Amazon India Product Advertising API (PA-API 5.0)
supabase secrets set AMAZON_ACCESS_KEY="AKIA..."
supabase secrets set AMAZON_SECRET_KEY="..."
supabase secrets set AMAZON_ASSOCIATE_TAG="ksamdeal-21"

# Flipkart Affiliate API
supabase secrets set FLIPKART_AFFILIATE_ID="your_flipkart_id"
supabase secrets set FLIPKART_AFFILIATE_TOKEN="your_flipkart_token"

# Affiliate Network Feed (Myntra, AJIO, Lenskart, Croma, JioMart)
supabase secrets set AFFILIATE_NETWORK_API_KEY="your_network_api_token"
supabase secrets set AFFILIATE_NETWORK_BASE_URL="https://api.cuelinks.com/v2/feeds.json"

# Licensed Shopping Data Fallback
supabase secrets set SERPAPI_KEY="your_serpapi_key"
```

If any secret is omitted or unconfigured, the corresponding adapter automatically marks itself `configured: false` and safely skips without crashing or interrupting other adapters.

---

## 3. How to Add a New Store

1. **Create an Adapter File** in `supabase/functions/_shared/providers/<store_slug>.ts`:
   - Implement the `ProviderAdapter` interface:
     - `slug`: unique store identifier (matches `slug` in `stores` table).
     - `name`: Human-readable store name.
     - `isConfigured()`: returns `true` if required `Deno.env` secrets are present.
     - `fetchDeals({ query, category, limit, isSearch })`: returns `Promise<AdapterResult>`.
   - Pass candidates through `normalizeAndValidateProduct(candidate, { isSearch })`.
2. **Register the Adapter** in `supabase/functions/_shared/providers/registry.ts`:
   - Import your adapter and add `new YourStoreAdapter()` to the `ALL_ADAPTERS` array.
3. **Insert the Store Row** in Supabase:
   ```sql
   insert into public.stores (name, slug, base_url, is_enabled, affiliate_program)
   values ('New Store', 'new-store', 'https://www.newstore.in', true, 'Affiliate Feed')
   on conflict (slug) do update set is_enabled = true;
   ```

---

## 4. How to Disable a Store

To disable a store from showing in the frontend or being ingested:

```sql
update public.stores set is_enabled = false where slug = 'amazon';
update public.products set is_active = false where store_id = (select id from public.stores where slug = 'amazon');
```

---

## 5. How to Run / Test Ingestion

### A. Manual Ingest via CLI
Run the local helper script:
```bash
node scripts/run-ingest.js electronics
```
You can pass any category (`mobiles`, `laptops`, `audio`, `shoes`, `fashion`, `gaming`, `home`, `beauty`, `eyewear`).

### B. Manual Ingest via cURL
```bash
curl -X POST https://<PROJECT_REF>.supabase.co/functions/v1/ingest-deals \
  -H "Content-Type: application/json" \
  -H "X-Ingest-Secret: <YOUR_INGEST_SECRET>" \
  -d '{"trigger": "manual", "category": "electronics"}'
```

---

## 6. How to Read Ingest Health & Observability

Run these SQL views directly inside the Supabase SQL Editor:

```sql
-- 1. Check health of recent ingestion runs
select * from public.v_ingest_health;

-- 2. Inspect the latest 20 ingest runs
select * from public.ingest_runs order by started_at desc limit 20;

-- 3. Check popular search terms and when they were last fetched
select * from public.v_top_searches;

-- 4. Check top-clicked deals (affiliate outbound links)
select * from public.v_top_clicked;
```

---

## 7. Free-Tier Safeguards & Quotas

To keep resource consumption comfortably within the Supabase Free Tier:

1. **Database Size Guardrails**:
   - `public.purge_old_deal_data()` runs automatically nightly to delete `price_history` older than 180 days and `ingest_runs` older than 30 days.
   - Products not refreshed within 3 days are deactivated (`is_active = false`) via `deactivate_stale_products()`.
   - Inactive products with no wishlists older than 60 days are pruned.
2. **Edge Function Limits**:
   - Search requests are rate-limited per client IP to 20 requests/minute.
   - Live external adapter calls are throttled using a 30-minute caching window via `search_demand.last_fetched_at`.
   - Batch upserts are limited to 200 items per ingestion run.
3. **Outbound Compliance**:
   - Outbound purchase links always declare `rel="sponsored noopener noreferrer"` and `target="_blank"`.
   - Price freshness timestamps and the affiliate disclosure banner are displayed across the deals page, card, and footer.
