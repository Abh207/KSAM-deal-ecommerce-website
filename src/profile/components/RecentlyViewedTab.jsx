import { useState } from "react";
import { Trash2, ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import { BASE_URL } from "../../auth/auth.js";
import { clearRecentlyViewed } from "../../deals/services/accountActivityService.js";

export default function RecentlyViewedTab({
  items = [],
  userId,
  onReloadHistory,
  onShowToast,
  onNavigateTab
}) {
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear your browsing history?")) return;
    setClearing(true);
    try {
      const ok = await clearRecentlyViewed(userId);
      if (ok) {
        onShowToast?.("Browsing history cleared");
        onReloadHistory?.();
      } else {
        onShowToast?.("Failed to clear history");
      }
    } finally {
      setClearing(false);
    }
  };

  const handleBack = () => {
    if (onNavigateTab) {
      onNavigateTab("overview");
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <div className="su-canvas-wrap" role="tabpanel" aria-label="Recently Viewed Products">
      {/* 1. Header Row */}
      <div className="su-recent-header-row">
        <div className="su-recent-header-left">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="su-btn-circle-raised"
              title="Go back to Overview"
              aria-label="Back to Overview"
            >
              <ArrowLeft size={18} className="text-[#1E293B]" strokeWidth={2.4} />
            </button>
            <h2 className="su-page-title mb-0">Recently Viewed Deals</h2>
          </div>
          <p className="su-page-subtitle mt-1">
            Quickly revisit gadgets, apparel, and electronic deals you recently explored.
          </p>
        </div>
      </div>

      {/* 2. Main Container Card */}
      <div className="su-card su-card-raised">
        {items.length > 0 && (
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E5E7EB]">
            <span className="text-xs font-semibold text-[#4B5563]">
              {items.length} {items.length === 1 ? "product" : "products"} in browsing history
            </span>
            <button
              type="button"
              disabled={clearing}
              onClick={handleClear}
              className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1.5 transition"
            >
              <Trash2 size={13} />
              <span>{clearing ? "Clearing..." : "Clear history"}</span>
            </button>
          </div>
        )}

        {/* Inner Empty State Box or Product Grid */}
        {items.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-[#111827] mb-1.5">
              Nothing viewed yet
            </h3>
            <p className="text-sm text-[#4B5563] max-w-md mb-6 leading-relaxed">
              Products you open will show up here so you can find them again.
            </p>
            <a
              href={`${BASE_URL}#deals`}
              className="su-btn-secondary-white"
            >
              <span>Browse Deals</span>
              <ArrowRight size={15} strokeWidth={2} />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const detailUrl = `${BASE_URL}deal.html?id=${encodeURIComponent(item.id)}`;
              return (
                <div
                  key={item.id}
                  className="su-product-card group"
                >
                  <div>
                    {/* Image with 16:10 aspect ratio */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-100 mb-3.5 border border-[#E5E7EB]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400 font-bold">
                          {(item.name || "P").slice(0, 1)}
                        </div>
                      )}

                      {/* Store Badge */}
                      <span className="absolute right-2.5 top-2.5 text-[10px] py-0.5 px-2 bg-white/95 text-[#111827] font-semibold rounded border border-[#E5E7EB]">
                        {item.store || "Store"}
                      </span>

                      {/* Discount Badge */}
                      {item.discount > 0 && (
                        <span className="absolute left-2.5 top-2.5 rounded bg-emerald-600 text-white font-bold px-2 py-0.5 text-[10px] shadow-sm">
                          -{item.discount}%
                        </span>
                      )}
                    </div>

                    {/* Category & Rating */}
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold uppercase tracking-wider text-emerald-700">
                        {item.category || "Deal"}
                      </span>
                      <span className="text-amber-600 font-semibold flex items-center gap-1">
                        ★ {item.rating || "4.5"}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-bold text-[#111827] line-clamp-2 min-h-[40px] leading-snug">
                      <a href={detailUrl} className="hover:text-emerald-700 transition">
                        {item.name}
                      </a>
                    </h4>
                  </div>

                  {/* Price & Action Row */}
                  <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                    <div>
                      <p className="text-base font-black text-emerald-700">
                        ₹{Number(item.price || 0).toLocaleString("en-IN")}
                      </p>
                      {item.oldPrice > item.price && (
                        <del className="text-xs text-[#6B7280] block -mt-0.5">
                          ₹{Number(item.oldPrice).toLocaleString("en-IN")}
                        </del>
                      )}
                    </div>

                    <a
                      href={detailUrl}
                      className="su-btn-secondary-white text-xs h-8 px-3"
                    >
                      <span>View Deal</span>
                      <ArrowRight size={13} strokeWidth={2} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
