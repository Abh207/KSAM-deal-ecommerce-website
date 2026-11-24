import { useState } from "react";
import { Clock, Trash2, ArrowUpRight, ShoppingBag, ArrowLeft } from "lucide-react";
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
            <div className="su-eyebrow-pill">
              <Clock size={12} className="text-[#3B82F6]" strokeWidth={2.5} />
              <span>BROWSING HISTORY</span>
            </div>
          </div>

          <h2 className="su-page-title mt-1.5">Recently Viewed Deals</h2>
          <p className="su-page-subtitle">
            Quickly revisit gadgets, apparel, and electronic deals you recently explored.
          </p>
        </div>

        {/* Right: Rounded square raised icon button with clock icon */}
        <div className="su-card su-card-raised p-2.5 rounded-2xl flex items-center justify-center shrink-0">
          <Clock size={20} className="text-[#3B82F6]" strokeWidth={2.4} />
        </div>
      </div>

      {/* 2. Main Container Card (Large raised card) */}
      <div className="su-card su-card-raised">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="su-embossed-circle su-embossed-tile-blue w-11 h-11 rounded-xl">
              <Clock size={20} strokeWidth={2.4} />
            </div>
            <div>
              <h3 className="su-banner-title" style={{ fontSize: "16.5px" }}>Recently Viewed Deals</h3>
              <p className="su-banner-desc">
                Revisit the deals, products, and discounts you recently explored across Indian partner stores.
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              disabled={clearing}
              onClick={handleClear}
              className="su-btn-pill-raised text-xs py-2 px-3.5 hover:text-red-600"
            >
              <Trash2 size={14} className="text-red-500" />
              <span>{clearing ? "Clearing..." : "Clear History"}</span>
            </button>
          )}
        </div>

        {/* Inner Empty State Box or Product Grid */}
        {items.length === 0 ? (
          <div className="su-recent-empty-inner">
            {/* Raised white rounded square (56px x 56px) with soft blue clock icon */}
            <div className="su-white-square-icon" aria-hidden="true">
              <Clock size={28} className="text-[#3B82F6]" strokeWidth={2.2} />
            </div>

            <h3 className="su-empty-title" style={{ fontSize: "18px" }}>
              No Recently Viewed Products
            </h3>
            <p className="su-empty-subtitle text-xs" style={{ maxWidth: "420px" }}>
              Explore the latest electronics, fashion, and lifestyle discounts across partner stores to see them tracked here.
            </p>

            <a
              href={`${BASE_URL}#deals`}
              className="su-btn-gradient-cta"
            >
              <ShoppingBag size={16} strokeWidth={2.4} />
              <span>Browse Deals</span>
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
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100 mb-3.5 border border-slate-200/80">
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
                      <span className="absolute right-2.5 top-2.5 su-recessed-pill text-[10px] py-0.5 px-2 bg-white/90">
                        {item.store || "Store"}
                      </span>

                      {/* Discount Badge */}
                      {item.discount > 0 && (
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-emerald-500 text-white font-extrabold px-2 py-0.5 text-[10px] shadow-sm">
                          -{item.discount}%
                        </span>
                      )}
                    </div>

                    {/* Category & Rating */}
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold uppercase tracking-wider text-blue-600">
                        {item.category || "Deal"}
                      </span>
                      <span className="text-amber-500 font-semibold flex items-center gap-1">
                        ★ {item.rating || "4.5"}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-bold text-[#1E293B] line-clamp-2 min-h-[40px] leading-snug">
                      <a href={detailUrl} className="hover:text-blue-600 transition">
                        {item.name}
                      </a>
                    </h4>
                  </div>

                  {/* Price & Action Row */}
                  <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <div>
                      <p className="text-base font-black text-emerald-600">
                        ₹{Number(item.price || 0).toLocaleString("en-IN")}
                      </p>
                      {item.oldPrice > item.price && (
                        <del className="text-xs text-slate-400 block -mt-0.5">
                          ₹{Number(item.oldPrice).toLocaleString("en-IN")}
                        </del>
                      )}
                    </div>

                    <a
                      href={detailUrl}
                      className="su-btn-pill-raised text-xs py-1.5 px-3"
                    >
                      <span>View Deal</span>
                      <ArrowUpRight size={13} />
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
