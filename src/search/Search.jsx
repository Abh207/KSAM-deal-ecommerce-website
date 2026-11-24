import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  X,
  Search as SearchIcon,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ArrowUp,
  RefreshCw,
  AlertCircle
} from "lucide-react";

import Navbar from "../deals/components/Navbar.jsx";
import Footer from "../deals/components/Footer.jsx";
import ProductCard from "../deals/components/ProductCard.jsx";
import { supabase } from "../lib/supabase.js";
import {
  normalizeDatabaseProduct,
  getStoreName,
  saveDealToSession,
  upsertExternalDeal,
  saveSearchNavigationState,
  getSearchNavigationState,
  clearSearchNavigationState,
  getCachedSearchResults,
  setCachedSearchResults
} from "../deals/services/productService.js";

import "./search.css";
import "../deals/tailwind-generated.css";
import "../deals/deals.css";
import "../deals/components/dealCardV2.css";

const CATEGORIES = [
  "All",
  "Clothes",
  "Watches",
  "Mobiles",
  "Laptops",
  "Audio",
  "Shoes",
  "Fashion",
  "Home",
  "Gaming",
  "Electronics",
  "Beauty"
];

const STORES = [
  { id: "All", label: "All Stores" },
  { id: "amazon", label: "Amazon" },
  { id: "flipkart", label: "Flipkart" },
  { id: "croma", label: "Croma" },
  { id: "myntra", label: "Myntra" },
  { id: "ajio", label: "AJIO" },
  { id: "meesho", label: "Meesho" }
];

const SORTS = [
  { id: "relevance", label: "Relevance" },
  { id: "biggest_discount", label: "Biggest discount" },
  { id: "price_low_high", label: "Price: Low to High" },
  { id: "price_high_low", label: "Price: High to Low" },
  { id: "rating", label: "Top rated" }
];

function performScrollRestoration(targetId, targetScrollY) {
  if (!targetId && (!targetScrollY || targetScrollY <= 0)) return () => {};
  const startTime = performance.now();
  let cancelled = false;

  function attempt() {
    if (cancelled) return;
    let found = false;

    if (targetId) {
      const el = document.querySelector(`[data-product-id="${targetId}"]`);
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "instant" });
        found = true;
      }
    }

    if (!found && typeof targetScrollY === "number" && targetScrollY > 0) {
      window.scrollTo({ top: targetScrollY, behavior: "instant" });
      if (
        Math.abs(window.scrollY - targetScrollY) < 40 ||
        document.body.scrollHeight >= targetScrollY + window.innerHeight
      ) {
        found = true;
      }
    }

    if (!found && performance.now() - startTime < 2000) {
      requestAnimationFrame(attempt);
    }
  }

  requestAnimationFrame(attempt);
  return () => {
    cancelled = true;
  };
}

export default function SearchPage() {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const dealsUrl = `${normalizedBase}index.html#deals`;
  const homeUrl = `${normalizedBase}index.html#home`;

  // Read URL query parameters
  const initialParams = useMemo(() => {
    if (typeof window === "undefined") return { q: "", category: "All", store: "All", sort: "relevance" };
    const p = new URLSearchParams(window.location.search);
    return {
      q: (p.get("q") || "").trim(),
      category: p.get("category") || "All",
      store: p.get("store") || "All",
      sort: p.get("sort") || "relevance"
    };
  }, []);

  // Restore navigation state if matching
  const savedState = useMemo(() => {
    const s = getSearchNavigationState();
    if (s && s.query && s.query.toLowerCase() === initialParams.q.toLowerCase()) {
      return s;
    }
    return null;
  }, [initialParams.q]);

  const [query, setQuery] = useState(initialParams.q);
  const [category, setCategory] = useState(() => savedState?.category || initialParams.category);
  const [store, setStore] = useState(() => savedState?.store || initialParams.store);
  const [sort, setSort] = useState(() => savedState?.sort || initialParams.sort);

  // Raw fetched products for current query
  const [products, setProducts] = useState(() => {
    const cached = getCachedSearchResults(initialParams.q);
    return Array.isArray(cached) ? cached : [];
  });

  const [loading, setLoading] = useState(() => {
    const cached = getCachedSearchResults(initialParams.q);
    return !Array.isArray(cached) || cached.length === 0;
  });

  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(() => savedState?.loadedCount || 12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const sentinelRef = useRef(null);
  const isLoadingMoreRef = useRef(false);
  const restorationDoneRef = useRef(false);
  const activeAbortRef = useRef(null);

  // Manual scroll restoration
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual";
      } catch {}
    }
  }, []);

  // Keep URL parameters in sync with state
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");

    if (category && category !== "All") url.searchParams.set("category", category);
    else url.searchParams.delete("category");

    if (store && store !== "All") url.searchParams.set("store", store);
    else url.searchParams.delete("store");

    if (sort && sort !== "relevance") url.searchParams.set("sort", sort);
    else url.searchParams.delete("sort");

    window.history.replaceState(null, "", url.toString());
  }, [query, category, store, sort]);

  // Fetch search results: Supabase first, SerpApi fallback/supplement
  const executeSearch = useCallback(async (searchTerm) => {
    const q = (searchTerm || "").trim();
    if (!q) {
      setProducts([]);
      setLoading(false);
      setError("");
      return;
    }

    // Check sessionStorage cache first (< 5 minutes TTL)
    const cached = getCachedSearchResults(q);
    if (Array.isArray(cached) && cached.length > 0) {
      setProducts(cached);
      setLoading(false);
      setError("");
      return;
    }

    if (activeAbortRef.current) {
      activeAbortRef.current.abort();
    }
    const abortController = new AbortController();
    activeAbortRef.current = abortController;

    setLoading(true);
    setError("");

    let ksamProducts = [];
    let externalProducts = [];
    let notice = "";

    try {
      // 1. Query Supabase products table
      const searchTermSql = `%${q}%`;
      const supabaseQuery = supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          about_text,
          key_features,
          specifications,
          sku,
          condition,
          store_name,
          image_url,
          additional_images,
          price,
          old_price,
          discount,
          discount_percent,
          rating,
          review_count,
          category,
          store_id,
          source,
          product_url,
          affiliate_url,
          availability,
          external_id,
          is_active,
          stores ( id, name, logo_url )
        `)
        .eq("is_active", true)
        .or(`name.ilike.${searchTermSql},description.ilike.${searchTermSql},store_name.ilike.${searchTermSql}`)
        .order("discount", { ascending: false, nullsFirst: false })
        .limit(40);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database search timed out")), 6000)
      );

      const { data: dbData, error: dbError } = await Promise.race([
        supabaseQuery,
        timeoutPromise
      ]).catch((e) => ({ data: null, error: e }));

      if (abortController.signal.aborted) return;

      if (!dbError && Array.isArray(dbData)) {
        ksamProducts = dbData.map((item, idx) =>
          normalizeDatabaseProduct({
            ...item,
            store_name: item.store_name || getStoreName(item)
          })
        );
      }

      // 2. If fewer than 5 results from database, call search-products Edge Function (SerpApi)
      if (ksamProducts.length < 5) {
        const edgeBase = import.meta.env.VITE_SUPABASE_URL;
        const edgeKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (edgeBase && edgeKey) {
          try {
            const edgeTimer = setTimeout(() => abortController.abort(), 10000);
            const edgeRes = await fetch(`${edgeBase}/functions/v1/search-products`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: edgeKey,
                Authorization: `Bearer ${edgeKey}`
              },
              body: JSON.stringify({ query: q }),
              signal: abortController.signal
            });
            clearTimeout(edgeTimer);

            if (edgeRes.ok) {
              const edgeData = await edgeRes.json();
              if (edgeData?.success && Array.isArray(edgeData.products)) {
                externalProducts = edgeData.products.map((item, idx) => {
                  const normalized = normalizeDatabaseProduct(item);
                  // Save external deal to session storage & background upsert
                  saveDealToSession(normalized);
                  upsertExternalDeal(normalized).catch(() => {});
                  return normalized;
                });
              }
              if (edgeData?.external_error) {
                notice = edgeData.external_error;
              }
            }
          } catch (edgeErr) {
            if (abortController.signal.aborted) return;
            // Silent fallback
          }
        }
      }

      if (abortController.signal.aborted) return;

      // 3. Deduplicate combined results
      const combined = [...ksamProducts, ...externalProducts];
      const unique = [];
      const seenIds = new Set();
      const seenUrls = new Set();

      for (const item of combined) {
        if (!item || !item.name) continue;
        const idKey = String(item.id || item.uid || "");
        const urlKey = (item.affiliateUrl || item.url || item.product_url || "").toLowerCase();

        if (idKey && seenIds.has(idKey)) continue;
        if (urlKey && urlKey !== "#" && seenUrls.has(urlKey)) continue;

        if (idKey) seenIds.add(idKey);
        if (urlKey && urlKey !== "#") seenUrls.add(urlKey);
        unique.push(item);
      }

      setProducts(unique);
      setCachedSearchResults(q, unique);
      setError("");
    } catch (err) {
      if (abortController.signal.aborted) return;
      console.error("[SearchPage] Failed to fetch search results:", err);
      if (ksamProducts.length > 0) {
        setProducts(ksamProducts);
        setError("");
      } else {
        setError("Unable to load search results. Please check your connection and try again.");
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch when query changes
  useEffect(() => {
    executeSearch(query);
  }, [query, executeSearch]);

  // Handle bfcache (pageshow event)
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) {
        const s = getSearchNavigationState();
        if (s && s.query && s.query.toLowerCase() === query.toLowerCase()) {
          if (s.loadedCount && s.loadedCount > visibleCount) {
            setVisibleCount(s.loadedCount);
          }
          performScrollRestoration(s.clickedProductId, s.scrollY);
        }
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [query, visibleCount]);

  // Client filtering & sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. Category filter
    if (category && category !== "All") {
      const catLower = category.toLowerCase();
      list = list.filter((p) => {
        const c = (p.category || "").toLowerCase();
        return c.includes(catLower) || catLower.includes(c);
      });
    }

    // 2. Store filter
    if (store && store !== "All") {
      const storeLower = store.toLowerCase();
      list = list.filter((p) => {
        const s = (getStoreName(p) || p.store || p.platform || "").toLowerCase();
        return s.includes(storeLower);
      });
    }

    // 3. Sort
    if (sort === "biggest_discount") {
      list.sort((a, b) => Number(b.discount || 0) - Number(a.discount || 0));
    } else if (sort === "price_low_high") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sort === "price_high_low") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sort === "rating") {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }

    return list;
  }, [products, category, store, sort]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  // Scroll Restoration when visibleProducts render
  useEffect(() => {
    if (restorationDoneRef.current || !savedState || visibleProducts.length === 0) return;
    restorationDoneRef.current = true;
    const cleanup = performScrollRestoration(savedState.clickedProductId, savedState.scrollY);
    return cleanup;
  }, [savedState, visibleProducts]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && !isLoadingMoreRef.current) {
          isLoadingMoreRef.current = true;
          setIsLoadingMore(true);

          // 2-second spinner display before appending next 12 items
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 12, filteredProducts.length));
            setIsLoadingMore(false);
            isLoadingMoreRef.current = false;
          }, 2000);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, filteredProducts.length]);

  // Save navigation state when user clicks on a product card
  const handleProductCardClick = (product) => {
    saveSearchNavigationState({
      query,
      category,
      store,
      sort,
      loadedCount: visibleCount,
      scrollY: window.scrollY,
      clickedProductId: product.id,
      timestamp: Date.now()
    });
  };

  const handleClearSearch = (e) => {
    e.preventDefault();
    clearSearchNavigationState();
    window.location.href = dealsUrl;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="search-page">
      {/* 1. Shared KSAM Navbar (Pre-populated with current query) */}
      <Navbar searchPlaceholder={`Search for products, brands and more...`} />

      <main className="search-main">
        {/* Breadcrumb Navigation: Home / Search results */}
        <nav className="search-breadcrumb" aria-label="Breadcrumb">
          <a href={homeUrl}>Home</a>
          <span className="sep">/</span>
          <span className="current">Search results</span>
        </nav>

        {/* Header Block: Results for "query", count, Back to Deals, Clear search */}
        <div className="search-header-card">
          <div className="search-header-info">
            <span className="search-label">KSAM Deal Search</span>
            <h1 className="search-title">
              {query ? `Search results for “${query}”` : "All Products"}
            </h1>
            <p className="search-count" aria-live="polite">
              {!loading ? `${filteredProducts.length} product${filteredProducts.length === 1 ? "" : "s"} found` : "Searching verified deals..."}
            </p>
          </div>

          <div className="search-header-actions">
            <a href={dealsUrl} className="search-back-deals-btn" title="Return to Deals">
              <ArrowLeft size={16} />
              <span>Back to Deals</span>
            </a>

            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClearSearch}
              title="Clear search and return to deals"
            >
              <X size={15} />
              <span>Clear search</span>
            </button>
          </div>
        </div>

        {/* Toolbar & Filters Bar */}
        <div className="search-toolbar">
          <div className="search-filters-group">
            {/* Category Filter */}
            <div className="search-filter-select-wrap">
              <select
                className="search-filter-select"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setVisibleCount(12);
                }}
                aria-label="Filter by category"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Categories" : c}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="search-filter-icon" />
            </div>

            {/* Store Filter */}
            <div className="search-filter-select-wrap">
              <select
                className="search-filter-select"
                value={store}
                onChange={(e) => {
                  setStore(e.target.value);
                  setVisibleCount(12);
                }}
                aria-label="Filter by store"
              >
                {STORES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="search-filter-icon" />
            </div>
          </div>

          {/* Sort Filter */}
          <div className="search-sort-group">
            <span className="search-sort-label">Sort by:</span>
            <div className="search-filter-select-wrap">
              <select
                className="search-filter-select"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setVisibleCount(12);
                }}
                aria-label="Sort products"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="search-filter-icon" />
            </div>
          </div>
        </div>

        {/* Initial Loading Skeletons */}
        {loading && (
          <div className="search-products-grid" aria-label="Loading products">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="search-skeleton-card">
                <div className="search-skeleton-img" />
                <div className="search-skeleton-line" style={{ width: "85%" }} />
                <div className="search-skeleton-line" style={{ width: "50%" }} />
                <div className="search-skeleton-line" style={{ width: "70%", marginTop: 8 }} />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="search-error-card" role="alert">
            <h3 className="search-error-title">Search Error</h3>
            <p className="search-error-msg">{error}</p>
            <button
              type="button"
              className="search-retry-btn"
              onClick={() => executeSearch(query)}
            >
              <RefreshCw size={14} style={{ display: "inline-block", marginRight: 6, verticalAlign: "-2px" }} />
              Retry search
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="search-empty-card">
            <div className="search-empty-icon" aria-hidden="true">🔍</div>
            <h2 className="search-empty-title">
              No products found for “{query || "your search"}”
            </h2>
            <p className="search-empty-desc">
              We couldn't find any products matching your query and active filters.
            </p>

            <div className="search-tips-box">
              <div className="search-tips-title">Search Tips:</div>
              <ul className="search-tips-list">
                <li>Check your spelling for any typos.</li>
                <li>Try more general keywords (e.g. "books" instead of "class 12 maths book").</li>
                <li>Try resetting category or store filters to "All".</li>
                <li>Search popular categories like Mobiles, Laptops, Audio, or Shoes.</li>
              </ul>
            </div>

            <a href={dealsUrl} className="search-back-deals-btn">
              <ArrowLeft size={16} />
              <span>Back to Deals Catalog</span>
            </a>
          </div>
        )}

        {/* Products Grid (4 columns desktop, 2 tablet, 1-2 mobile) */}
        {!loading && visibleProducts.length > 0 && (
          <div className="search-products-grid" aria-label="Search results">
            {visibleProducts.map((prod, idx) => (
              <ProductCard
                key={prod.id || prod.uid || idx}
                product={{
                  ...prod,
                  from: "search"
                }}
                index={idx}
                onClick={handleProductCardClick}
              />
            ))}
          </div>
        )}

        {/* Infinite Scroll Spinner (smooth green circle for ~2s) */}
        {isLoadingMore && (
          <div
            className="search-infinite-spinner-wrap"
            aria-live="polite"
            role="status"
          >
            <div className="search-infinite-spinner" />
            <span className="search-infinite-text">Loading more deals...</span>
          </div>
        )}

        {/* Invisible Sentinel Element for IntersectionObserver */}
        {!loading && hasMore && (
          <div
            ref={sentinelRef}
            style={{ width: "100%", height: "2px", opacity: 0, pointerEvents: "none" }}
            aria-hidden="true"
          />
        )}

        {/* End of Results Indicator */}
        {!loading && filteredProducts.length > 0 && !hasMore && !isLoadingMore && (
          <div className="search-end-banner" aria-live="polite">
            <p>You've seen all {filteredProducts.length} results for “{query}”</p>
            <button
              type="button"
              className="search-back-to-top-btn"
              onClick={scrollToTop}
            >
              <ArrowUp size={15} />
              <span>Back to top</span>
            </button>
          </div>
        )}
      </main>

      {/* Shared KSAM Footer */}
      <Footer />
    </div>
  );
}
