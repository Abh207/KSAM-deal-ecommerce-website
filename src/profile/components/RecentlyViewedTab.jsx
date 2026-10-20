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
          <div className="py-16 text-center space-y-4 rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
              <Clock size={28} />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-white">No Recently Viewed Products</h3>
              <p className="text-xs text-gray-400 mt-1">
                As you browse discounts across electronics, fashion, and lifestyle on KSAM Deal, your recently inspected items will appear here.
              </p>
            </div>
            <a
              href={`${BASE_URL}#deals`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#22FF88] to-[#38BDF8] px-5 py-2.5 text-xs font-black text-black hover:opacity-90 transition"
            >
              <ShoppingBag size={14} />
              <span>Browse Today's Deals</span>
            </a>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const detailUrl = `${BASE_URL}deal.html?id=${encodeURIComponent(item.id)}`;
              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 transition-all hover:border-[#38BDF8]/50 hover:shadow-[0_0_25px_rgba(56,189,248,.1)]"
                >
                  <div>
                    {/* Image */}
                    <div className="relative h-44 w-full overflow-hidden rounded-xl bg-[#111] mb-3">
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
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-[#FFD60A] px-2 py-0.5 text-[10px] font-black text-black">
                          -{item.discount}%
                        </span>
                      )}
                    </div>

                    {/* Category & Title */}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8]">
                      {item.category || "Deal"}
                    </span>
                    <h4 className="mt-1 text-sm font-bold text-white line-clamp-2 min-h-[40px]">
                      <a href={detailUrl} className="hover:text-[#22FF88] transition">
                        {item.name}
                      </a>
                    </h4>
                  </div>

                  {/* Price & Link */}
                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                    <div>
                      <p className="text-base font-black text-[#22FF88]">
                        ₹{Number(item.price || 0).toLocaleString("en-IN")}
                      </p>
                      {item.oldPrice > item.price && (
                        <del className="text-xs text-gray-500">
                          ₹{Number(item.oldPrice).toLocaleString("en-IN")}
                        </del>
                      )}
                    </div>

                    <a
                      href={detailUrl}
                      className="flex items-center gap-1 rounded-lg border border-[#38BDF8]/40 bg-[#38BDF8]/10 px-3 py-1.5 text-xs font-bold text-[#38BDF8] hover:bg-[#38BDF8] hover:text-black transition"
                    >
                      <span>View</span>
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
