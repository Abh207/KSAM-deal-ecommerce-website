import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Search, SlidersHorizontal, RefreshCw, ChevronDown, X, Info, WifiOff, Store as StoreIcon, ArrowUpDown } from "lucide-react";
import ProductCard from "./ProductCard.jsx";
import {
  getDeals,
  subscribeDealsRealtime,
  saveDealsNavigationState,
  getDealsNavigationState,
  clearDealsNavigationState,
  getInstantCachedDeals
} from "../services/productService.js";
import "./featuredDeals.css";

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

const CATEGORY_ICONS = {
  All: "⚡",
  Clothes: "👕",
  Watches: "⌚",
  Mobiles: "📱",
  Laptops: "💻",
  Audio: "🎧",
  Shoes: "👟",
  Fashion: "👗",
  Home: "🏠",
  Gaming: "🎮",
  Electronics: "🔌",
  Beauty: "💄"
};

const SORTS = [
  { id: "biggest_discount", label: "Biggest discount" },
  { id: "price_low_high", label: "Price: Low to High" },
  { id: "price_high_low", label: "Price: High to Low" },
  { id: "newest", label: "Newest" }
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

function performScrollRestoration(state) {
  if (!state) return () => {};
  const targetId = state.clickedProductId;
  const targetScrollY = state.scrollY;
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
      if (Math.abs(window.scrollY - targetScrollY) < 40 || document.body.scrollHeight >= targetScrollY + window.innerHeight) {
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

function FeaturedDeals() {
  const savedNavState = useMemo(() => getDealsNavigationState(), []);
  const initialCategory = savedNavState?.category || "All";
  const initialStore = savedNavState?.store || "All";
  const initialSort = savedNavState?.sort || "biggest_discount";
  const initialSearch = savedNavState?.search || "";
  const initialPage = savedNavState?.page || 1;
  const initialLoadedCount = savedNavState?.loadedCount || (savedNavState?.page ? savedNavState.page * 12 : 12);

  // Try instant render from localStorage cache
  const initialCache = useMemo(() => {
    return getInstantCachedDeals({
      category: initialCategory,
      store: initialStore,
      sort: initialSort,
      search: initialSearch,
      loadedCount: initialLoadedCount
    });
  }, []);

  const [products, setProducts] = useState(() => initialCache?.products || []);
  const [category, setCategory] = useState(initialCategory);
  const [store, setStore] = useState(initialStore);
  const [sort, setSort] = useState(initialSort);
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(() => Boolean(initialCache?.hasMore));
  const [loading, setLoading] = useState(() => !initialCache);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  const isRestoringRef = useRef(Boolean(savedNavState && savedNavState.loadedCount));
  const restorationDoneRef = useRef(false);
  const isLoadingMoreRef = useRef(false);
  const sentinelRef = useRef(null);

  // Set manual scroll restoration so browser doesn't conflict
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual";
      } catch {}
    }
  }, []);

  // Handle bfcache (back-forward cache)
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) {
        const state = getDealsNavigationState();
        if (state) {
          performScrollRestoration(state);
        }
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  // Save state on pagehide and beforeunload as safety net
  useEffect(() => {
    const saveCurrent = () => {
      saveDealsNavigationState({
        category,
        store,
        sort,
        search,
        page,
        loadedCount: products.length,
        scrollY: window.scrollY
      });
    };
    window.addEventListener("pagehide", saveCurrent);
    window.addEventListener("beforeunload", saveCurrent);
    return () => {
      window.removeEventListener("pagehide", saveCurrent);
      window.removeEventListener("beforeunload", saveCurrent);
    };
  }, [category, store, sort, search, page, products.length]);

  const loadDeals = useCallback(
    async (isPageReset = true) => {
      try {
        if (isPageReset) {
          if (!initialCache) {
            setLoading(true);
          }
          if (isRestoringRef.current) {
            setPage(initialPage);
          } else {
            setPage(1);
          }
        }
        setError("");
        setLoadMoreError("");

        const fetchPageSize = isRestoringRef.current && isPageReset
          ? Math.max(12, initialLoadedCount)
          : 12;

        const res = await getDeals({
          category,
          store,
          sort,
          page: isRestoringRef.current && isPageReset ? 1 : 1,
          pageSize: fetchPageSize
        });

        setProducts(res.products || []);
        if (isRestoringRef.current) {
          setPage(initialPage);
          isRestoringRef.current = false;
        } else {
          setPage(1);
        }

        setHasMore(Boolean(res.hasMore));
        setIsOffline(Boolean(res.isOffline));
      } catch (err) {
        console.error("Failed to fetch deals:", err);
        setError("Unable to load deals right now. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [category, store, sort]
  );

  const loadNextBatch = useCallback(async () => {
    if (!hasMore || loading || loadingMore || isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadMoreError("");

    const startTime = Date.now();
    const nextPage = page + 1;

    try {
      const res = await getDeals({
        category,
        store,
        sort,
        page: nextPage,
        pageSize: 12
      });

      // Keep green spinner visible for at least 2 seconds before appending next batch
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2000 - elapsed);
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }

      if (Array.isArray(res.products) && res.products.length > 0) {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => String(p.id)));
          const fresh = res.products.filter((p) => !existingIds.has(String(p.id)));
          return [...prev, ...fresh];
        });
        setPage(nextPage);
      }
      setHasMore(Boolean(res.hasMore));
      setIsOffline(Boolean(res.isOffline));
    } catch (err) {
      console.error("Failed to load more deals:", err);
      setLoadMoreError("Unable to load more deals. Please try again.");
    } finally {
      isLoadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, loading, loadingMore, page, category, store, sort]);

  // Infinite Scroll IntersectionObserver (rootMargin: 200px)
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading) return;

    let observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          loadNextBatch();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0
      }
    );

    observer.observe(sentinel);

    return () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    };
  }, [hasMore, loading, loadNextBatch]);

  useEffect(() => {
    loadDeals(true);
  }, [category, store, sort]);

  // Attempt scroll restoration once products are in the DOM (with retries up to 2 seconds)
  useEffect(() => {
    if (savedNavState && !restorationDoneRef.current && products.length > 0) {
      const cancel = performScrollRestoration(savedNavState);
      restorationDoneRef.current = true;
      return cancel;
    }
  }, [products, savedNavState]);

  // Smooth scroll to #deals on mount if hash is #deals
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#deals") {
      setTimeout(() => {
        const el = document.getElementById("deals");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, []);

  // Stable ref for loadDeals to prevent subscription churn
  const loadDealsRef = useRef(loadDeals);
  useEffect(() => {
    loadDealsRef.current = loadDeals;
  }, [loadDeals]);

  // Realtime subscription to price drops
  useEffect(() => {
    const unsub = subscribeDealsRealtime(() => {
      loadDealsRef.current?.(true);
    });
    return unsub;
  }, []);

  // Client-side search filtering on current loaded products or full term
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(q);
      const matchStore = (p.platform || p.store)?.toLowerCase().includes(q);
      const matchCat = p.category?.toLowerCase().includes(q);
      const matchBrand = p.brand?.toLowerCase().includes(q);
      return matchName || matchStore || matchCat || matchBrand;
    });
  }, [products, search]);

  const searchInputRef = useRef(null);
  const chipsScrollRef = useRef(null);

  // Keyboard shortcut: Pressing "/" focuses the search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName) &&
        !document.activeElement?.isContentEditable
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectCategory = (cat) => {
    setCategory(cat);
    const chipEl = chipsScrollRef.current?.querySelector(`[data-category="${cat}"]`);
    if (chipEl) {
      chipEl.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
    }
  };

  const activeStoreObj = STORES.find((s) => s.id === store);
  const activeStoreLabel = activeStoreObj ? activeStoreObj.label : store;
  const activeSortObj = SORTS.find((s) => s.id === sort);
  const activeSortLabel = activeSortObj ? activeSortObj.label : sort;
  const hasActiveFilters = category !== "All" || store !== "All" || search.trim() !== "" || sort !== "biggest_discount";

  const resetFilters = () => {
    clearDealsNavigationState();
    setCategory("All");
    setStore("All");
    setSort("biggest_discount");
    setSearch("");
    setPage(1);
    loadDeals(true);
  };

  return (
    <section id="deals" className="bg-[#050505] py-14 sm:py-20 lg:py-24">
      <div className="fd-container mx-auto max-w-7xl px-3 sm:px-6">
        {/* ROW 1: Heading, Subtitle & Search Box */}
        <div className="fd-title-row">
          <div className="fd-title-group">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="fd-live-badge">
                <span className="fd-live-dot" aria-hidden="true" />
                <span>LIVE DEALS DISCOVERY</span>
              </div>
              {isOffline && (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30"
                  title="Showing cached deals (offline)"
                >
                  <WifiOff size={12} />
                  <span>Cached Data</span>
                </div>
              )}
            </div>
            <h2 className="fd-heading">
              Deals worth <span className="fd-heading-highlight">checking.</span>
            </h2>
            <p className="fd-subtitle">
              Discounts aggregated from verified Indian retail stores. Buy directly on the official store.
            </p>
          </div>

          {/* Search Box */}
          <div className="fd-search-box">
            <Search size={18} className="fd-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearch("");
                  e.currentTarget.blur();
                }
              }}
              placeholder='Search deals by name, brand, platform (press "/" to focus)...'
              aria-label="Search deals"
              className="fd-search-input"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="fd-search-clear"
              >
                <X size={16} />
              </button>
            )}
            <kbd className="fd-search-kbd" aria-hidden="true">
              /
            </kbd>
          </div>
        </div>

        {/* ROW 2: Category Chips Row */}
        <div className="fd-category-scroll-wrap" ref={chipsScrollRef}>
          <div className="fd-category-chips">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat;
              return (
                <button
                  key={cat}
                  data-category={cat}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className={`fd-chip ${isActive ? "is-active" : ""}`}
                >
                  <span className="fd-chip-icon" aria-hidden="true">
                    {CATEGORY_ICONS[cat] || "🏷️"}
                  </span>
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ROW 3: Redesigned Glass Toolbar Card (Store | Sort | Refresh) */}
        <div className="fd-toolbar-glass-card">
          <div className="fd-toolbar-grid">
            {/* 1. Store Select Column */}
            <div className="fd-control-col">
              <div className="fd-control-label-row">
                <label htmlFor="store-select" className="fd-control-label">
                  FILTER BY STORE
                </label>
                {store !== "All" && (
                  <span className="fd-store-count-chip">
                    {STORES.find((s) => s.id === store)?.label || store}
                  </span>
                )}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="fd-reset-link"
                    aria-label="Reset all filters"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="fd-custom-select-wrap">
                <StoreIcon size={16} className="fd-select-icon-left" aria-hidden="true" />
                <select
                  id="store-select"
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  className="fd-styled-select"
                  aria-label="Filter by store"
                >
                  {STORES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="fd-select-custom-chevron" aria-hidden="true" />
              </div>
            </div>

            {/* 2. Sort Select Column */}
            <div className="fd-control-col">
              <div className="fd-control-label-row">
                <label htmlFor="sort-select" className="fd-control-label">
                  SORT DEALS
                </label>
              </div>
              <div className="fd-custom-select-wrap">
                <ArrowUpDown size={16} className="fd-select-icon-left" aria-hidden="true" />
                <select
                  id="sort-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="fd-styled-select"
                  aria-label="Sort deals"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="fd-select-custom-chevron" aria-hidden="true" />
              </div>
            </div>

            {/* 3. Refresh Action Column */}
            <div className="fd-refresh-col">
              <button
                type="button"
                onClick={() => loadDeals(true)}
                disabled={loading}
                aria-label="Refresh live deals"
                className="fd-action-refresh-btn"
              >
                <RefreshCw
                  size={15}
                  strokeWidth={2.4}
                  className={`fd-refresh-icon ${loading ? "animate-spin text-[#8cff00]" : ""}`}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Info / Disclaimer Note Inside Glass Card */}
          <div className="fd-toolbar-note">
            <Info size={13} strokeWidth={2.2} className="fd-toolbar-note-icon shrink-0" aria-hidden="true" />
            <span>Prices and availability can change on official stores. Click any product to view details.</span>
          </div>
        </div>

        {/* Error State with Retry Button */}
        {error && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 text-center">
            <p className="text-lg font-bold text-white">Unable to load deals</p>
            <p className="mt-2 text-xs text-gray-500">{error}</p>
            <button
              onClick={() => loadDeals(true)}
              className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#8cff00] px-5 py-2.5 text-xs font-bold text-black transition hover:scale-105"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons matching Image 2 Style */}
        {loading && (
          <div className="deals-grid mt-8 grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="flex flex-col rounded-[22px] border border-gray-100 bg-white p-3 sm:p-4 shadow-sm animate-pulse"
              >
                <div className="w-full h-[180px] sm:h-[220px] rounded-xl bg-gray-100" />
                <div className="mt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="h-3 w-1/3 rounded bg-gray-200" />
                    <div className="h-5 w-4/5 rounded bg-gray-200 mt-2" />
                    <div className="h-3 w-1/2 rounded bg-gray-100 mt-2" />
                    <div className="h-6 w-28 rounded bg-gray-200 mt-3" />
                  </div>
                  <div className="h-[46px] sm:h-[48px] w-full rounded-xl bg-gray-100 mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid: 4 cols desktop, 3 tablet, 2 mobile */}
        {!loading && !error && filteredProducts.length > 0 && (
          <>
            <div
              className="deals-grid mt-8 grid"
              onClickCapture={(e) => {
                const card = e.target.closest("[data-product-id]");
                const pId = card?.getAttribute("data-product-id");
                saveDealsNavigationState({
                  category,
                  store,
                  sort,
                  search,
                  page,
                  loadedCount: products.length,
                  clickedProductId: pId,
                  scrollY: window.scrollY
                });
              }}
            >
              {filteredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>

            {/* Pagination / Load More */}
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => loadDeals(false)}
                  disabled={loadingMore}
                  aria-label="Load more deals"
                  className="
                    flex
                    min-h-[44px]
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-white/10
                    bg-[#0a0a0a]
                    px-8
                    py-3.5
                    text-sm
                    font-bold
                    text-white
                    transition-all
                    hover:border-[#8cff00]/50
                    hover:shadow-[0_0_25px_rgba(140, 255, 0, .15)]
                    disabled:opacity-50
                  "
                >
                  {loadingMore ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-[#8cff00]" />
                      <span>Loading more deals...</span>
                    </>
                  ) : (
                    <span>Load more deals</span>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a0a] text-xl">
              🔎
            </div>
            <h3 className="mt-5 text-xl font-black text-white">No deals right now</h3>
            <p className="mt-2 text-xs text-gray-500">
              Try adjusting your filters, store selection, or search query.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-[#8cff00] px-5 py-2.5 text-xs font-bold text-black transition hover:scale-105"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedDeals;
