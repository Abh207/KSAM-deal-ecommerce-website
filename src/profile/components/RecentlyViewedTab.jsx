import { useState } from "react";
import { Clock, Trash2, ArrowUpRight, ShoppingBag, Store, ExternalLink } from "lucide-react";
import { BASE_URL } from "../../auth/auth.js";
import { clearRecentlyViewed } from "../../deals/services/accountActivityService.js";

export default function RecentlyViewedTab({
  items = [],
  userId,
  onReloadHistory,
  onShowToast
}) {
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear your browsing history?")) return;
    setClearing(true);
    try {
      const ok = await clearRecentlyViewed(userId);
      if (ok) {
        onShowToast("Browsing history cleared");
        onReloadHistory();
      } else {
        onShowToast("Failed to clear history");
      }
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="ks-tab-panel" role="tabpanel" aria-label="Recently Viewed Products">
      <div className="ks-card">
        <div className="ks-card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="ks-card-title">
              <Clock size={20} color="#38BDF8" />
              <span>Recently Viewed Deals</span>
            </h2>
            <p className="ks-card-desc">
              Revisit the deals, products, and discounts you recently explored across Indian partner stores.
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              disabled={clearing}
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:border-red-500/30 hover:bg-red-500/10 text-xs font-semibold text-gray-300 hover:text-red-400 transition"
            >
              <Trash2 size={14} />
              <span>{clearing ? "Clearing..." : "Clear History"}</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="ks-empty-state-compact-box">
            <div className="ks-empty-icon-tile ks-empty-icon-tile--cyan">
              <Clock size={24} />
            </div>
            <div className="max-w-md mx-auto space-y-1.5 text-center">
              <h3 className="text-base font-bold text-white">No Recently Viewed Products</h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
                Explore the latest electronics, fashion, and lifestyle discounts across partner stores to see them tracked here.
              </p>
            </div>
            <a
              href={`${BASE_URL}#deals`}
              className="ks-btn-primary inline-flex items-center gap-2 mt-2"
            >
              <ShoppingBag size={15} />
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
                  className="ks-product-dashboard-card group relative flex flex-col justify-between"
                >
                  <div>
                    {/* Image with 16:10 aspect ratio */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#090D14] mb-3.5">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-500 font-bold">
                          {(item.name || "P").slice(0, 1)}
                        </div>
                      )}

                      {/* Store Badge */}
                      <span className="absolute right-2.5 top-2.5 rounded-full border border-white/20 bg-black/80 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                        {item.store}
                      </span>

                      {/* Discount Badge */}
                      {item.discount > 0 && (
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-[#00F5A0] px-2 py-0.5 text-[10px] font-black text-black">
                          -{item.discount}%
                        </span>
                      )}
                    </div>

                    {/* Category & Rating */}
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold uppercase tracking-wider text-[#25C8FF]">
                        {item.category || "Deal"}
                      </span>
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        ★ {item.rating || "4.5"}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-bold text-white line-clamp-2 min-h-[40px] leading-snug">
                      <a href={detailUrl} className="hover:text-[#00F5A0] transition">
                        {item.name}
                      </a>
                    </h4>
                  </div>

                  {/* Price & Action Row (No horizontal divider) */}
                  <div className="mt-4 flex items-center justify-between pt-1">
                    <div>
                      <p className="text-base font-black text-[#00F5A0]">
                        ₹{Number(item.price || 0).toLocaleString("en-IN")}
                      </p>
                      {item.oldPrice > item.price && (
                        <del className="text-xs text-gray-500 block -mt-0.5">
                          ₹{Number(item.oldPrice).toLocaleString("en-IN")}
                        </del>
                      )}
                    </div>

                    <a
                      href={detailUrl}
                      className="flex items-center gap-1.5 rounded-xl border border-[#25C8FF]/40 bg-[#25C8FF]/10 px-3.5 py-2 text-xs font-bold text-[#25C8FF] hover:bg-[#25C8FF] hover:text-black transition"
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
