import { useState, useEffect } from "react";
import {
  Star,
  ExternalLink,
  Heart,
  ArrowLeft,
  ShieldCheck,
  TrendingDown,
  Clock,
  Store,
  CheckCircle2,
  Tag,
  Bell
} from "lucide-react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import DealCard from "./components/DealCard.jsx";
import PriceAlertModal from "./components/PriceAlertModal.jsx";
import { getDealById, getDeals, logOutboundClick } from "./services/productService.js";
import { wishlistService } from "./services/wishlistService.js";
import { recordProductView } from "./services/accountActivityService.js";
import "../styles/kx-tokens.css";
import "../styles/kx-motion.css";

function PriceHistoryChart({ points }) {
  if (!points || points.length < 2) return null;

  const prices = points.map((p) => Number(p.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  const width = 360;
  const height = 90;
  const padding = 14;

  const coords = points.map((p, i) => {
    const x = padding + (i / (points.length - 1)) * (width - 2 * padding);
    const normalized = (Number(p.price) - minPrice) / range;
    const y = height - padding - normalized * (height - 2 * padding);
    return { x, y, price: p.price, date: new Date(p.captured_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) };
  });

  const polylineStr = coords.map((c) => `${c.x},${c.y}`).join(" ");

  return (
    <div className="mt-6 kx-card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--kx-cyan)]">
          <TrendingDown size={15} />
          <span>Price History</span>
        </div>
        <span className="text-xs text-[var(--kx-text-muted)]">
          Lowest: <strong className="text-[var(--kx-accent)]">₹{minPrice.toLocaleString("en-IN")}</strong>
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          {/* Subtle grid line */}
          <line x1="0" y1={height - padding} x2={width} y2={height - padding} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
          {/* Gradient Area */}
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22FF88" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22FF88" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points={`${coords[0].x},${height - padding} ${polylineStr} ${coords[coords.length - 1].x},${height - padding}`}
            fill="url(#priceGrad)"
          />
          {/* Main Price Line */}
          <polyline
            fill="none"
            stroke="#22FF88"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylineStr}
          />
          {/* Data Points */}
          {coords.map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r="3.5" fill="#22FF88" stroke="#000" strokeWidth="1.5" />
          ))}
        </svg>
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-gray-500">
        <span>{coords[0].date}</span>
        <span>{coords[coords.length - 1].date}</span>
      </div>
    </div>
  );
}

export function DealDetail() {
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [similarDeals, setSimilarDeals] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
      setLoading(false);
      setError(true);
      return;
    }

    async function loadProduct() {
      try {
        setLoading(true);
        const data = await getDealById(id);
        if (!data) {
          setError(true);
          return;
        }

        setDeal(data);
        setSelectedImage(data.image);

        // Record product view in database (for signed-in users) and localStorage
        recordProductView(data);

        // Update document title for SEO
        document.title = `${data.name} | KSAM Deal`;

        // Check wishlist state
        const saved = await wishlistService.isSaved(data.id);
        setIsSaved(saved);

        // Load similar deals in the same category
        const similarRes = await getDeals({
          category: data.category !== "Deals" ? data.category : "All",
          pageSize: 5
        });
        const filtered = (similarRes.products || []).filter((p) => p.id !== data.id).slice(0, 4);
        setSimilarDeals(filtered);
      } catch (err) {
        console.error("Failed to load deal detail:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, []);

  const handleToggleSave = async () => {
    if (!deal || saving) return;
    setSaving(true);
    try {
      const next = await wishlistService.toggle(deal);
      setIsSaved(next);
    } finally {
      setSaving(false);
    }
  };

  const handleBuyClick = () => {
    if (!deal) return;
    logOutboundClick(deal.id, "deal_detail_buy_button");
  };

  const galleryImages = [
    deal?.image,
    ...(Array.isArray(deal?.additionalImages) ? deal.additionalImages : [])
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-white/10" />
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div className="h-96 animate-pulse rounded-2xl bg-white/5" />
            <div className="space-y-4">
              <div className="h-6 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-10 w-full animate-pulse rounded bg-white/10" />
              <div className="h-8 w-40 animate-pulse rounded bg-white/10" />
              <div className="h-32 w-full animate-pulse rounded-2xl bg-white/5" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-32 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a0a] text-2xl">
            🔍
          </div>
          <h1 className="mt-6 text-2xl font-black text-white sm:text-3xl">Deal Not Found</h1>
          <p className="mt-3 text-sm text-gray-400">
            This deal may have expired, changed its link, or is no longer active in our index.
          </p>
          <a
            href={base}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#22FF88] px-6 py-3 font-bold text-black transition hover:scale-105"
          >
            <ArrowLeft size={16} />
            Back to Deals
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="kx-page min-h-screen flex flex-col justify-between relative overflow-hidden" style={{ background: "var(--kx-base)", color: "var(--kx-text)" }}>
      {/* Dynamic Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="kx-mesh-bg opacity-30" />
        <div className="kx-noise-overlay" />
        <div className="kx-floating-shape w-96 h-96 -top-20 -left-20 bg-[var(--kx-accent)] opacity-10 blur-3xl rounded-full" />
        <div className="kx-floating-shape w-80 h-80 top-1/2 -right-20 bg-[var(--kx-cyan)] opacity-10 blur-3xl rounded-full" style={{ animationDelay: "-6s" }} />
      </div>

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16 relative z-10">
        {/* Breadcrumb / Back Link */}
        <div className="mb-8 flex items-center justify-between">
          <a
            href={base}
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--kx-text-muted)] transition hover:text-[var(--kx-accent)]"
          >
            <ArrowLeft size={15} />
            Back to all deals
          </a>

          <div className="flex items-center gap-2 text-xs text-[var(--kx-text-dim)]">
            <Clock size={13} />
            <span>{deal.priceUpdatedLabel}</span>
          </div>
        </div>

        {/* Product Hero Section: Gallery + Purchase info */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Gallery (Left Column) */}
          <div className="lg:col-span-6">
            <div className="relative aspect-square w-full overflow-hidden kx-card flex items-center justify-center p-6 shadow-2xl">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={deal.name}
                  className="h-full w-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-black text-[var(--kx-accent)]">
                  {deal.name.slice(0, 1).toUpperCase()}
                </div>
              )}

              {deal.discount > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-[var(--kx-yellow)] px-3.5 py-1 text-xs font-black text-black shadow-[0_0_20px_var(--kx-yellow-soft)]">
                  -{deal.discount}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Carousel if additional images exist */}
            {galleryImages.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-[var(--kx-surface-2)] p-1 transition ${
                      selectedImage === img
                        ? "border-[var(--kx-accent)] shadow-[0_0_15px_var(--kx-accent-glow)]"
                        : "border-[var(--kx-border)] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Price History Sparkline */}
            <PriceHistoryChart points={deal.priceHistory} />
          </div>

          {/* Details (Right Column) */}
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              {/* Category & Store Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-[var(--kx-cyan)]/30 bg-[var(--kx-cyan-soft)] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--kx-cyan)]">
                  {deal.category}
                </span>

                {deal.brand && (
                  <span className="rounded-md border border-[var(--kx-border)] bg-[var(--kx-surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--kx-text-muted)]">
                    {deal.brand}
                  </span>
                )}

                <span className="flex items-center gap-1.5 rounded-md border border-[var(--kx-border)] bg-[var(--kx-surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--kx-text)]">
                  <Store size={13} className="text-[var(--kx-yellow)]" />
                  {deal.store}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="mt-4 text-2xl font-black leading-tight text-[var(--kx-text)] sm:text-3xl lg:text-4xl tracking-tight">
                {deal.name}
              </h1>

              {/* Rating & Reviews */}
              {deal.rating > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm font-bold text-[var(--kx-yellow)]">
                    <Star size={16} fill="currentColor" />
                    <span>{deal.rating}</span>
                  </div>
                  {deal.reviews > 0 && (
                    <span className="text-xs text-[var(--kx-text-muted)]">
                      ({deal.reviews.toLocaleString("en-IN")} customer reviews)
                    </span>
                  )}
                  <span className="text-[var(--kx-border)]">·</span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-[var(--kx-accent)]">
                    <CheckCircle2 size={13} />
                    {deal.availability}
                  </span>
                </div>
              )}

              {/* Price Block */}
              <div className="mt-6 kx-card p-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-[var(--kx-accent)]">
                    ₹{Number(deal.price || 0).toLocaleString("en-IN")}
                  </span>
                  {deal.oldPrice > deal.price && (
                    <del className="text-base text-[var(--kx-text-dim)]">
                      ₹{Number(deal.oldPrice).toLocaleString("en-IN")}
                    </del>
                  )}
                  {deal.discount > 0 && (
                    <span className="rounded-full bg-[var(--kx-yellow-soft)] px-2.5 py-0.5 text-xs font-bold text-[var(--kx-yellow)] border border-[var(--kx-yellow)]/20">
                      Save {deal.discount}%
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-[var(--kx-text-muted)]">
                  Inclusive of all taxes. Free shipping may apply on store checkout.
                </p>
              </div>

              {/* Primary Outbound Action Buttons */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={deal.affiliateUrl || deal.productUrl}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  onClick={handleBuyClick}
                  className="kx-btn kx-btn--primary flex-1 py-4 text-base font-black flex items-center justify-center gap-2"
                >
                  Buy on {deal.store}
                  <ExternalLink size={18} />
                </a>

                <button
                  type="button"
                  onClick={handleToggleSave}
                  aria-label={isSaved ? "Saved" : "Save deal"}
                  className={`kx-btn px-6 py-4 text-sm font-bold flex items-center justify-center gap-2 ${
                    isSaved
                      ? "border-[#14f1b2]/60 bg-[#14f1b2]/10 text-[#14f1b2]"
                      : "kx-btn--secondary"
                  }`}
                >
                  <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
                  {isSaved ? "Saved" : "Save Deal"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowAlertModal(true)}
                  aria-label="Set price alert"
                  className="kx-btn kx-btn--outline px-6 py-4 text-sm font-bold flex items-center justify-center gap-2 hover:border-[var(--kx-yellow)]/50 hover:text-[var(--kx-yellow)]"
                >
                  <Bell size={18} />
                  <span>Price Alert</span>
                </button>
              </div>

              {/* Disclaimer Notice */}
              <div className="mt-4 rounded-xl border border-[var(--kx-border)] bg-[var(--kx-surface-2)] p-3 text-xs leading-relaxed text-[var(--kx-text-muted)]">
                <p>
                  <strong className="text-[var(--kx-text)]">Notice:</strong> You will complete your purchase directly on {deal.store}. KSAM Deal is an independent deal-discovery platform and does not process orders, collect payments, or deliver products.
                </p>
              </div>

              {/* Trust Guarantee Badges */}
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-[var(--kx-text-muted)]">
                <div className="kx-card p-3 flex items-center gap-2">
                  <ShieldCheck size={16} className="shrink-0 text-[var(--kx-accent)]" />
                  <span>Verified Indian Merchant</span>
                </div>
                <div className="kx-card p-3 flex items-center gap-2">
                  <Tag size={16} className="shrink-0 text-[var(--kx-cyan)]" />
                  <span>Live Price Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Deals Section */}
        {similarDeals.length > 0 && (
          <div className="mt-24 border-t border-[var(--kx-border)] pt-16">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--kx-accent)]">
                  RELATED OFFERS
                </p>
                <h2 className="mt-2 text-2xl font-black text-[var(--kx-text)] sm:text-3xl tracking-tight">
                  Similar deals in {deal.category}
                </h2>
              </div>
              <a
                href={base}
                className="hidden text-xs font-bold text-[var(--kx-cyan)] hover:underline sm:block"
              >
                Browse all deals →
              </a>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similarDeals.map((prod) => (
                <DealCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Price Alert Modal */}
      <PriceAlertModal
        product={deal}
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
      />
    </div>
  );
}

export default DealDetail;
