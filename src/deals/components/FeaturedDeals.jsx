import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, SlidersHorizontal, RefreshCw, ChevronDown } from "lucide-react";
import DealCard from "./DealCard.jsx";
import { getDeals } from "../services/productService.js";

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

  const resetFilters = () => {
    setCategory("All");
    setStore("All");
    setSort("biggest_discount");
    setSearch("");
  };

  return (
    <section id="deals" className="bg-[#050505] py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header and Search */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[#22FF88]">
              LIVE DEALS DISCOVERY
            </p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              Deals worth <span className="text-[#FFD60A]">checking.</span>
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-gray-400">
              Discounts aggregated from verified Indian retail stores. Buy directly on the official store.
            </p>
          </div>

          {/* Search Box */}
          <div className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 transition focus-within:border-[#22FF88]/50 focus-within:shadow-[0_0_30px_rgba(34,255,136,.08)] lg:max-w-sm">
            <Search size={18} className="shrink-0 text-[#38BDF8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deals, brands, stores..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Filter Toolbar: Categories, Store, Sort */}
        <div className="mt-8 flex flex-col gap-4">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <SlidersHorizontal className="mr-1 shrink-0 text-[#FFD60A]" size={16} />
            {CATEGORIES.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  category === item
                    ? "bg-[#22FF88] text-black shadow-[0_0_15px_rgba(34,255,136,.25)]"
                    : "border border-white/10 bg-[#0a0a0a] text-gray-400 hover:border-[#22FF88]/40 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Store & Sort Selectors + Refresh */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Store Filter */}
              <div className="relative">
                <select
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  className="appearance-none rounded-xl border border-white/10 bg-[#0a0a0a] py-2 pl-3 pr-8 text-xs font-medium text-white transition hover:border-white/20 focus:border-[#38BDF8] focus:outline-none"
                >
                  {STORES.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#111] text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-3 text-gray-400" />
              </div>

              {/* Sort Filter */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none rounded-xl border border-white/10 bg-[#0a0a0a] py-2 pl-3 pr-8 text-xs font-medium text-white transition hover:border-white/20 focus:border-[#38BDF8] focus:outline-none"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#111] text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-3 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">
                {loading ? "Searching deals..." : `${filteredProducts.length} deals shown`}
              </span>
              <button
                onClick={() => loadDeals(true)}
                disabled={loading}
                aria-label="Refresh deals"
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-gray-400 transition hover:border-[#22FF88]/40 hover:text-[#22FF88] disabled:opacity-50"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Status / Disclaimer Note */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-gray-500">
          <p>Prices and availability can change on the store. Click a deal to view details.</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-12 rounded-2xl border border-white/10 bg-[#0a0a0a] p-10 text-center">
            <p className="text-lg font-bold text-white">Unable to load deals</p>
            <p className="mt-2 text-xs text-gray-500">{error}</p>
            <button
              onClick={() => loadDeals(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#22FF88] px-5 py-2.5 text-xs font-bold text-black transition hover:scale-105"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-[400px] animate-pulse rounded-2xl border border-white/5 bg-[#0a0a0a]"
              />
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <>
            <div className="grid mt-10 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <DealCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination / Load More */}
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => loadDeals(false)}
                  disabled={loadingMore}
                  className="
                    flex
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
                      Loading more deals...
                    </>
                  ) : (
                    "Load more deals"
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
              className="mt-6 rounded-xl bg-[#22FF88] px-5 py-2.5 text-xs font-bold text-black transition hover:scale-105"
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