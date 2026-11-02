import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Search, SlidersHorizontal, RefreshCw, ChevronDown, X, Info, WifiOff, Store as StoreIcon, ArrowUpDown } from "lucide-react";
import ProductCard from "./ProductCard.jsx";
import { getDeals, subscribeDealsRealtime } from "../services/productService.js";
import "./featuredDeals.css";

const CATEGORIES = [
  "All",
  "Audio",
  "Mobiles",
  "Laptops",
  "Shoes",
  "Fashion",
  "Home",
  "Gaming",
  "Watches",
  "Electronics",
  "Beauty"
];

const CATEGORY_ICONS = {
  All: "⚡",
  Audio: "🎧",
  Mobiles: "📱",
  Laptops: "💻",
  Shoes: "👟",
  Fashion: "👗",
  Home: "🏠",
  Gaming: "🎮",
  Watches: "⌚",
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

function FeaturedDeals() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [store, setStore] = useState("All");
  const [sort, setSort] = useState("biggest_discount");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  const loadDeals = useCallback(
    async (isPageReset = true) => {
      try {
        if (isPageReset) {
          setLoading(true);
          setPage(1);
        } else {
          setLoadingMore(true);
        }
        setError("");

        const currentPage = isPageReset ? 1 : page + 1;
        const res = await getDeals({
          category,
          store,
          sort,
          page: currentPage,
          pageSize: 12
        });

        if (isPageReset) {
          setProducts(res.products || []);
        } else {
          setProducts((prev) => [...prev, ...(res.products || [])]);
          setPage(currentPage);
        }

        setHasMore(Boolean(res.hasMore));
        setIsOffline(Boolean(res.isOffline));
      } catch (err) {
        console.error("Failed to fetch deals:", err);
        setError("Unable to load deals right now. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [category, store, sort, page]
  );

  useEffect(() => {
    loadDeals(true);
  }, [category, store, sort]);

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
    setCategory("All");
    setStore("All");
    setSort("biggest_discount");
    setSearch("");
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
            <div className="deals-grid mt-8 grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
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
