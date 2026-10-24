import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Search, SlidersHorizontal, RefreshCw, ChevronDown, X, Info } from "lucide-react";
import ProductCard from "./ProductCard.jsx";
import ProductDetails from "./ProductDetails.jsx";
import { getDeals, getDealById } from "../services/productService.js";
import "./featuredDeals.css";

const CATEGORIES = [
  "All",
  "Electronics",
  "Mobiles",
  "Laptops",
  "Audio",
  "Shoes",
  "Gaming",
  "Fashion",
  "Home",
  "Beauty"
];

const CATEGORY_ICONS = {
  All: "⚡",
  Electronics: "🔌",
  Mobiles: "📱",
  Laptops: "💻",
  Audio: "🎧",
  Shoes: "👟",
  Gaming: "🎮",
  Fashion: "👗",
  Home: "🏠",
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
  { id: "jiomart", label: "JioMart" },
  { id: "lenskart", label: "Lenskart" }
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
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Synchronize modal state with URL hash (#product-<id>)
  useEffect(() => {
    const handleHashSync = async () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith("#product-")) {
        const id = hash.replace("#product-", "");
        if (id) {
          const found = products.find((p) => String(p.id) === String(id));
          if (found) {
            setSelectedProduct(found);
          } else {
            try {
              const fetched = await getDealById(id);
              if (fetched) setSelectedProduct(fetched);
            } catch (err) {
              console.error("Failed to fetch product for hash:", err);
            }
          }
        }
      } else if (!hash || !hash.startsWith("#product-")) {
        setSelectedProduct(null);
      }
    };

    const handleCustomOpen = (e) => {
      if (e?.detail) {
        setSelectedProduct(e.detail);
        if (e.detail.id) {
          window.location.hash = `product-${e.detail.id}`;
        }
      }
    };

    handleHashSync();
    window.addEventListener("hashchange", handleHashSync);
    window.addEventListener("popstate", handleHashSync);
    window.addEventListener("open-product-details", handleCustomOpen);

    return () => {
      window.removeEventListener("hashchange", handleHashSync);
      window.removeEventListener("popstate", handleHashSync);
      window.removeEventListener("open-product-details", handleCustomOpen);
    };
  }, [products]);

  const handleOpenDetails = (product) => {
    setSelectedProduct(product);
    window.location.hash = `product-${product.id}`;
  };

  const handleCloseDetails = () => {
    setSelectedProduct(null);
    if (window.location.hash && window.location.hash.startsWith("#product-")) {
      window.history.pushState(
        "",
        document.title,
        window.location.pathname + window.location.search
      );
    }
  };

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

        setHasMore(res.hasMore);
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

  // Client-side search filtering on current loaded products or full term
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(q);
      const matchStore = p.store?.toLowerCase().includes(q);
      const matchCat = p.category?.toLowerCase().includes(q);
      const matchBrand = p.brand?.toLowerCase().includes(q);
      return matchName || matchStore || matchCat || matchBrand;
    });
  }, [products, search]);

  const searchInputRef = useRef(null);
  const chipsScrollRef = useRef(null);

  // Keyboard shortcut: Pressing "/" focuses the search bar (unless already in an input)
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
            <div className="fd-live-badge">
              <span className="fd-live-dot" aria-hidden="true" />
              <span>LIVE DEALS DISCOVERY</span>
            </div>
            <h2 className="fd-heading">
              Deals worth <span className="fd-heading-highlight">checking.</span>
            </h2>
            <p className="fd-subtitle">
              Discounts aggregated from verified Indian retail stores. Buy directly on the official store.
            </p>
          </div>

          {/* Search Box: 420px on desktop, 52px tall, rounded 14px, glass, X clear, / shortcut */}
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
                  searchInputRef.current?.blur();
                }
              }}
              placeholder="Search deals, brands, stores..."
              className="fd-search-input"
              aria-label="Search deals, brands, stores"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  searchInputRef.current?.focus();
                }}
                className="fd-search-clear"
                aria-label="Clear search text"
              >
                <X size={13} strokeWidth={2.4} />
              </button>
            )}
            <kbd className="fd-shortcut-hint" title="Press / to search">/</kbd>
          </div>
        </div>

        {/* ROW 2: One Tidy Filter Bar (Rounded Glass Panel with 16px padding) */}
        <div className="fd-filter-panel">
          {/* Left: Category Chips */}
          <div className="fd-chips-wrapper">
            <div className="fd-chips-scroll" ref={chipsScrollRef}>
              {CATEGORIES.map((item) => {
                const isSelected = category === item;
                const icon = CATEGORY_ICONS[item] || "🏷️";
                return (
                  <button
                    key={item}
                    type="button"
                    data-category={item}
                    onClick={() => handleSelectCategory(item)}
                    className={`fd-chip ${isSelected ? "fd-chip-active" : ""}`}
                    aria-pressed={isSelected}
                  >
                    <span className="fd-chip-icon">{icon}</span>
                    <span className="fd-chip-label">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selects (All Stores and Sort) */}
          <div className="fd-selects-group">
            {/* Store Select */}
            <div className="fd-select-wrapper">
              <select
                value={store}
                onChange={(e) => setStore(e.target.value)}
                aria-label="Filter by store"
                className="fd-select"
              >
                {STORES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} strokeWidth={2.4} className="fd-select-chevron" />
            </div>

            {/* Sort Select */}
            <div className="fd-select-wrapper">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort deals"
                className="fd-select"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id === "biggest_discount" ? "Sort: Biggest discount" : `Sort: ${s.label}`}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} strokeWidth={2.4} className="fd-select-chevron" />
            </div>
          </div>
        </div>

        {/* ROW 3: Result Bar (No divider line, tidy spacing) */}
        <div className="fd-result-bar">
          <div className="fd-result-left">
            <div className="fd-count-wrap">
              <span className="fd-count-num">
                {loading ? "..." : filteredProducts.length}
              </span>
              <span className="fd-count-label">deals shown</span>
            </div>

            {/* Active Removable Chips */}
            {hasActiveFilters && (
              <div className="fd-active-chips">
                {category !== "All" && (
                  <button
                    type="button"
                    onClick={() => setCategory("All")}
                    className="fd-active-chip"
                    title={`Remove ${category} filter`}
                  >
                    <span>{category}</span>
                    <X size={12} strokeWidth={2.2} />
                  </button>
                )}
                {store !== "All" && (
                  <button
                    type="button"
                    onClick={() => setStore("All")}
                    className="fd-active-chip"
                    title={`Remove ${activeStoreLabel} filter`}
                  >
                    <span>{activeStoreLabel}</span>
                    <X size={12} strokeWidth={2.2} />
                  </button>
                )}
                {search.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="fd-active-chip"
                    title="Remove search query"
                  >
                    <span>"{search.trim()}"</span>
                    <X size={12} strokeWidth={2.2} />
                  </button>
                )}
                {sort !== "biggest_discount" && (
                  <button
                    type="button"
                    onClick={() => setSort("biggest_discount")}
                    className="fd-active-chip"
                    title="Reset to biggest discount"
                  >
                    <span>Sort: {activeSortLabel}</span>
                    <X size={12} strokeWidth={2.2} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="fd-clear-all-btn"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Right: Refresh Button */}
          <button
            type="button"
            onClick={() => loadDeals(true)}
            disabled={loading}
            aria-label="Refresh deals"
            className="fd-refresh-btn"
          >
            <RefreshCw
              size={14}
              strokeWidth={2.2}
              className={`fd-refresh-icon ${loading ? "animate-spin text-[#22FF88]" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* Note / Disclaimer: Small info line (13px) with tiny ⓘ icon */}
        <div className="fd-note-row">
          <Info size={14} strokeWidth={2.2} className="fd-note-icon shrink-0" />
          <span>Prices and availability can change on the store. Click a deal to view details.</span>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 text-center">
            <p className="text-lg font-bold text-white">Unable to load deals</p>
            <p className="mt-2 text-xs text-gray-500">{error}</p>
            <button
              onClick={() => loadDeals(true)}
              className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#22FF88] px-5 py-2.5 text-xs font-bold text-black transition hover:scale-105"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons matching Image 1 */}
        {loading && (
          <div className="deals-grid mt-8 grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="flex flex-col rounded-[24px] border border-white/[0.08] bg-[#0b0b0d] p-3 sm:p-4 animate-pulse"
              >
                <div className="w-full aspect-[4/5] md:aspect-square rounded-2xl bg-white/[0.04]" />
                <div className="mt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="h-5 w-4/5 rounded bg-white/[0.06]" />
                    <div className="h-4 w-2/3 rounded bg-white/[0.04] mt-2" />
                    <div className="mt-4 flex items-center justify-between">
                      <div className="h-7 w-28 rounded bg-white/[0.08]" />
                      <div className="h-5 w-12 rounded bg-white/[0.06]" />
                    </div>
                  </div>
                  <div className="h-[46px] sm:h-[52px] w-full rounded-full bg-white/[0.08] mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <>
            <div className="deals-grid mt-8 grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={handleOpenDetails}
                />
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
                    hover:border-[#22FF88]/50
                    hover:shadow-[0_0_25px_rgba(34,255,136,.15)]
                    disabled:opacity-50
                  "
                >
                  {loadingMore ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-[#22FF88]" />
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
            <h3 className="mt-5 text-xl font-black text-white">No deals found</h3>
            <p className="mt-2 text-xs text-gray-500">
              Try adjusting your filters, store selection, or search query.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-[#22FF88] px-5 py-2.5 text-xs font-bold text-black transition hover:scale-105"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Product Details Modal / Bottom Sheet */}
      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={handleCloseDetails}
          onSelectProduct={(newProduct) => {
            setSelectedProduct(newProduct);
            window.location.hash = `product-${newProduct.id}`;
          }}
        />
      )}
    </section>
  );
}

export default FeaturedDeals;