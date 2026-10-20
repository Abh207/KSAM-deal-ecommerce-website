import { useState, useEffect } from "react";
import { Star, Heart, ArrowUpRight, Bell } from "lucide-react";
import { wishlistService } from "../services/wishlistService.js";
import PriceAlertModal from "./PriceAlertModal.jsx";

function DealCard({ product }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    let active = true;
    wishlistService.isSaved(product.id).then((saved) => {
      if (active) setIsSaved(saved);
    });

    const unsub = wishlistService.subscribe(() => {
      wishlistService.isSaved(product.id).then((saved) => {
        if (active) setIsSaved(saved);
      });
    });

    return () => {
      active = false;
      unsub();
    };
  }, [product.id]);

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      const nextState = await wishlistService.toggle(product);
      setIsSaved(nextState);
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
    } finally {
      setSaving(false);
    }
  };

  const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
  const detailUrl = `${base}deal.html?id=${encodeURIComponent(product.id)}`;

  return (
    <article
      className="
        group
        relative
        flex
        flex-col
        justify-between
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-[#0a0a0a]
        transition-all
        duration-500
        hover:-translate-y-2
        hover:border-[#22FF88]/50
        hover:shadow-[0_0_35px_rgba(34,255,136,.12)]
      "
    >
      {/* Product Image Area */}
      <div className="relative h-60 w-full overflow-hidden bg-[#111]">
        {!product.image || imgFailed ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02] p-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#22FF88]/20 to-[#38BDF8]/20 text-lg font-black text-[#22FF88]">
              {(product.name || "P").slice(0, 1).toUpperCase()}
            </div>
            <p className="mt-2 text-xs font-semibold text-gray-400 line-clamp-2">
              {product.name}
            </p>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-700
              group-hover:scale-105
            "
          />
        )}

        {/* Discount Badge */}
        {product.discount > 0 && (
          <span
            className="
              absolute
              left-3
              top-3
              rounded-full
              bg-[#FFD60A]
              px-2.5
              py-0.5
              text-[11px]
              font-black
              text-black
              shadow-[0_0_15px_rgba(255,214,10,.3)]
            "
          >
            -{product.discount}%
          </span>
        )}

        {/* Store Badge */}
        <span
          className="
            absolute
            right-3
            top-3
            flex
            items-center
            gap-1.5
            rounded-full
            border
            border-white/20
            bg-black/75
            px-2.5
            py-1
            text-[11px]
            font-semibold
            text-white
            backdrop-blur-md
          "
        >
          {product.storeLogo && (
            <img
              src={product.storeLogo}
              alt={product.store}
              className="h-3.5 w-3.5 rounded-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <span>{product.store}</span>
        </span>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* Category & Rating */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#38BDF8]">
              {product.category}
            </span>

            {product.rating > 0 && (
              <span className="flex items-center gap-1 text-xs text-[#FFD60A]">
                <Star size={13} fill="currentColor" />
                {product.rating}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="mb-2 min-h-[44px] text-base font-bold text-white line-clamp-2">
            <a href={detailUrl} className="transition hover:text-[#22FF88]">
              {product.name}
            </a>
          </h3>

          {/* Price Last Updated Label */}
          {product.priceUpdatedLabel && (
            <p className="mb-3 text-[11px] text-gray-500">
              {product.priceUpdatedLabel}
            </p>
          )}
        </div>

        <div>
          {/* Price & Save Heart Button */}
          <div className="flex items-end justify-between gap-2 border-t border-white/5 pt-3">
            <div>
              <p className="text-xl font-black text-[#22FF88]">
                ₹{Number(product.price || 0).toLocaleString("en-IN")}
              </p>

              {product.oldPrice > product.price && (
                <del className="text-xs text-gray-500">
                  ₹{Number(product.oldPrice).toLocaleString("en-IN")}
                </del>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Set Price Alert Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAlertModal(true);
                }}
                type="button"
                aria-label="Set price alert"
                title="Set price alert"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  text-gray-400
                  transition-all
                  hover:border-[#FFD60A]/50
                  hover:text-[#FFD60A]
                  focus:outline-none
                "
              >
                <Bell size={17} />
              </button>

              {/* Save Heart Button */}
              <button
                onClick={handleToggleSave}
                type="button"
                aria-label={isSaved ? "Remove from saved deals" : "Save deal"}
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  transition-all
                  focus:outline-none
                  ${
                    isSaved
                      ? "border-red-500/60 bg-red-500/15 text-red-400 shadow-[0_0_20px_rgba(239,68,68,.3)]"
                      : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-[#22FF88]/50 hover:text-[#22FF88]"
                  }
                `}
              >
                <Heart
                  size={18}
                  fill={isSaved ? "currentColor" : "none"}
                  className={saving ? "animate-pulse" : ""}
                />
              </button>
            </div>
          </div>

          {/* View Details Link */}
          <a
            href={detailUrl}
            className="
              mt-4
              flex
              w-full
              items-center
              justify-center
              gap-1.5
              rounded-xl
              border
              border-[#38BDF8]/40
              bg-[#38BDF8]/10
              py-2.5
              text-xs
              font-bold
              text-[#38BDF8]
              transition
              hover:bg-[#38BDF8]
              hover:text-black
            "
          >
            View details
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* Price Alert Popover/Modal */}
      <PriceAlertModal
        product={product}
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
      />
    </article>
  );
}

export default DealCard;
