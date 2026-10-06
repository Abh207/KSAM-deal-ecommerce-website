import { Menu, X, ShoppingBag, Search, Clock, TrendingUp, ArrowUpRight, Star } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabase";

/* =====================================================
   DATA
===================================================== */

const LINKS = [
    ["Home", "#home"],
    ["Deals", "#deals"],
    ["How It Works", "#how"],
    ["Features", "#features"],
    ["FAQ", "#faq"],
];

const TRENDING = ["Headphones", "Smart watch", "Sneakers", "Power bank", "Backpack", "Speaker"];

const CATEGORIES = [
    ["Electronics", "💻"],
    ["Fashion", "👕"],
    ["Home & Kitchen", "🏠"],
    ["Beauty", "💄"],
    ["Sports", "⚽"],
    ["Toys", "🧸"],
];

const RECENT_KEY = "ksam_recent_searches";

const IMG = (id) => `https://images.unsplash.com/${id}?w=500&auto=format&fit=crop&q=70`;

// Used when VITE_SUPABASE_URL is missing, and for the "Popular deals" row.
const DEMO_PRODUCTS = [
    { id: "d1", name: "Wireless Bluetooth Headphones", price: 1499, original_price: 2999, rating: 4.4, store: "Amazon", image: IMG("photo-1505740420928-5e560c06d30e") },
    { id: "d2", name: "Smart Watch Series 7", price: 2199, original_price: 4999, rating: 4.2, store: "Flipkart", image: IMG("photo-1523275335684-37898b6baf30") },
    { id: "d3", name: "Running Sneakers Red", price: 1799, original_price: 3499, rating: 4.5, store: "Myntra", image: IMG("photo-1542291026-7eec264c27ff") },
    { id: "d4", name: "Portable Power Bank 20000mAh", price: 999, original_price: 1999, rating: 4.3, store: "Amazon", image: IMG("photo-1609091839311-d5365f9ff1c5") },
    { id: "d5", name: "Travel Backpack 40L", price: 1199, original_price: 2499, rating: 4.1, store: "Flipkart", image: IMG("photo-1553062407-98eeb64c6a62") },
    { id: "d6", name: "Bluetooth Speaker Waterproof", price: 1299, original_price: 2599, rating: 4.6, store: "Amazon", image: IMG("photo-1608043152269-423dbba4e7e6") },
    { id: "d7", name: "Polarized Sunglasses", price: 599, original_price: 1499, rating: 4.0, store: "Myntra", image: IMG("photo-1572635196237-14b3f281503f") },
    { id: "d8", name: "Mechanical Gaming Keyboard", price: 2499, original_price: 4499, rating: 4.5, store: "Amazon", image: IMG("photo-1587829741301-dc798b83add3") },
    { id: "d9", name: "Wireless Gaming Mouse", price: 899, original_price: 1799, rating: 4.3, store: "Flipkart", image: IMG("photo-1527864550417-7fd91fc51a46") },
    { id: "d10", name: "Laptop 15.6 inch Slim", price: 38999, original_price: 54999, rating: 4.4, store: "Croma", image: IMG("photo-1496181133206-80ce9b88a853") },
    { id: "d11", name: "Smartphone 5G 128GB", price: 14999, original_price: 19999, rating: 4.3, store: "Flipkart", image: IMG("photo-1511707171634-5f897ff02aa9") },
    { id: "d12", name: "Mirrorless Digital Camera", price: 42999, original_price: 56999, rating: 4.6, store: "Amazon", image: IMG("photo-1526170375885-4d8ecf77b99f") },
];

/* =====================================================
   HELPERS
===================================================== */

const toNumber = (v) => {
    if (v === null || v === undefined || v === "") return null;
    if (typeof v === "number") return v;
    const n = parseFloat(String(v).replace(/[^0-9.]/g, ""));
    return Number.isNaN(n) ? null : n;
};

// Works with your own table AND with SerpApi / Google Shopping style results.
const normalizeProduct = (p, i) => ({
    id: p.id ?? p.product_id ?? i,
    name: p.name ?? p.title ?? "Untitled product",
    image: p.image ?? p.image_url ?? p.thumbnail ?? p.serpapi_thumbnail ?? "",
    price: toNumber(p.extracted_price ?? p.price ?? p.sale_price),
    priceText: typeof p.price === "string" && Number.isNaN(Number(p.price)) ? p.price : null,
    oldPrice: toNumber(p.extracted_old_price ?? p.original_price ?? p.mrp ?? p.old_price),
    rating: toNumber(p.rating),
    store: p.source ?? p.store ?? p.brand ?? "",
    url: p.product_link ?? p.link ?? p.url ?? p.affiliate_url ?? "#",
});

const formatPrice = (n) => (n === null || n === undefined ? "" : `₹${Number(n).toLocaleString("en-IN")}`);

const emojiFor = (name = "") => {
    const s = name.toLowerCase();
    if (/head|ear|audio/.test(s)) return "🎧";
    if (/watch/.test(s)) return "⌚";
    if (/shoe|sneaker|run/.test(s)) return "👟";
    if (/bag|pack/.test(s)) return "🎒";
    if (/speaker/.test(s)) return "🔊";
    if (/phone|mobile/.test(s)) return "📱";
    if (/laptop|computer/.test(s)) return "💻";
    if (/camera/.test(s)) return "📷";
    if (/glass/.test(s)) return "🕶️";
    if (/keyboard|mouse|gaming/.test(s)) return "🎮";
    if (/shirt|jacket|dress|jeans/.test(s)) return "👕";
    return "🛍️";
};

// Colourful generated image used when a product photo is missing or broken.
const placeholderFor = (name = "") => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
        <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='hsl(${h},70%,28%)'/><stop offset='1' stop-color='hsl(${(h + 60) % 360},70%,14%)'/>
        </linearGradient></defs>
        <rect width='200' height='200' fill='url(#g)'/>
        <text x='100' y='122' font-size='72' text-anchor='middle'>${emojiFor(name)}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/* =====================================================
   STYLES (self-contained, no Tailwind needed)
===================================================== */

const CSS = `
.ksam-overlay{position:fixed;inset:0;z-index:99999;display:flex;justify-content:center;align-items:flex-start;padding:4.5rem 1rem 1rem;animation:ksamFade .18s ease}
.ksam-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.ksam-panel{position:relative;width:100%;max-width:62rem;max-height:calc(100vh - 5.5rem);display:flex;flex-direction:column;overflow:hidden;color:#fff;
  background:linear-gradient(180deg,#0f1512 0%,#080808 100%);border:1px solid rgba(255,255,255,.1);border-radius:22px;
  box-shadow:0 40px 90px rgba(0,0,0,.85),0 0 0 1px rgba(34,255,136,.07),0 0 80px rgba(34,255,136,.06);animation:ksamPop .22s cubic-bezier(.2,.9,.3,1.1)}
.ksam-panel *{box-sizing:border-box}
.ksam-panel button{font:inherit;cursor:pointer}
.ksam-panel button:focus-visible,.ksam-panel select:focus-visible{outline:2px solid #38BDF8;outline-offset:2px}

.ksam-bar{display:flex;align-items:center;gap:.75rem;padding:1rem 1.25rem;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02)}
.ksam-bar-icon{color:#38BDF8;flex-shrink:0}
.ksam-input{flex:1;min-width:0;background:transparent;border:0;outline:0;color:#fff;font-size:1.05rem;font-family:inherit}
.ksam-input::placeholder{color:#6b7280}
.ksam-spin{width:20px;height:20px;border-radius:50%;border:2px solid rgba(255,255,255,.15);border-top-color:#22FF88;animation:ksamSpin .7s linear infinite;flex-shrink:0}
.ksam-iconbtn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:transparent;color:#9ca3af;transition:.15s;flex-shrink:0}
.ksam-iconbtn:hover{color:#fff;border-color:rgba(255,255,255,.3)}
.ksam-go{padding:.55rem 1.1rem;border-radius:10px;border:0;background:linear-gradient(135deg,#22FF88,#38BDF8);color:#000;font-weight:800;font-size:.85rem;flex-shrink:0;transition:transform .15s}
.ksam-go:hover{transform:scale(1.05)}

.ksam-body{overflow-y:auto;padding:1.25rem;scrollbar-width:thin;scrollbar-color:#333 transparent}
.ksam-sec{margin-bottom:1.75rem}
.ksam-sec:last-child{margin-bottom:0}
.ksam-h{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin:0 0 .8rem;font-size:.82rem;font-weight:700;color:#9ca3af}
.ksam-h span{display:flex;align-items:center;gap:.45rem}
.ksam-link{background:none;border:0;color:#6b7280;font-size:.75rem}
.ksam-link:hover{color:#22FF88}

.ksam-chips{display:flex;flex-wrap:wrap;gap:.5rem}
.ksam-chip{padding:.5rem 1rem;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);color:#e5e7eb;font-size:.85rem;transition:.15s}
.ksam-chip:hover{background:#22FF88;border-color:#22FF88;color:#000;transform:translateY(-1px)}

.ksam-cats{display:grid;grid-template-columns:repeat(3,1fr);gap:.65rem}
.ksam-cat{display:flex;align-items:center;gap:.75rem;padding:.75rem .9rem;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:#e5e7eb;font-size:.9rem;text-align:left;transition:.15s}
.ksam-cat:hover{border-color:rgba(56,189,248,.6);background:rgba(56,189,248,.08);color:#38BDF8}
.ksam-cat-ico{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.07);font-size:1.15rem}
.ksam-cat-arrow{margin-left:auto;color:#6b7280}

.ksam-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:.9rem}
.ksam-card{display:flex;flex-direction:column;padding:0;text-align:left;color:inherit;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);transition:transform .2s,border-color .2s,box-shadow .2s}
.ksam-card:hover{transform:translateY(-4px);border-color:rgba(34,255,136,.5);box-shadow:0 14px 30px rgba(0,0,0,.5),0 0 24px rgba(34,255,136,.1)}
.ksam-img{position:relative;aspect-ratio:1/1;overflow:hidden;background:#141414}
.ksam-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s}
.ksam-card:hover .ksam-img img{transform:scale(1.07)}
.ksam-badge{position:absolute;top:.55rem;left:.55rem;padding:.2rem .5rem;border-radius:8px;background:#FFD60A;color:#000;font-size:.7rem;font-weight:800}
.ksam-store{position:absolute;bottom:.55rem;left:.55rem;padding:.2rem .55rem;border-radius:999px;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);font-size:.68rem;color:#e5e7eb}
.ksam-info{display:flex;flex-direction:column;gap:.35rem;flex:1;padding:.75rem .85rem .9rem}
.ksam-name{margin:0;font-size:.85rem;font-weight:600;line-height:1.3;color:#fff;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.2em}
.ksam-rate{display:flex;align-items:center;gap:.3rem;font-size:.75rem;color:#9ca3af}
.ksam-price{display:flex;align-items:baseline;gap:.5rem;margin-top:auto}
.ksam-now{font-size:1.05rem;font-weight:800;color:#22FF88}
.ksam-was{font-size:.75rem;color:#6b7280;text-decoration:line-through}
.ksam-cta{margin-top:.35rem;padding:.45rem;border-radius:10px;text-align:center;font-size:.78rem;font-weight:700;color:#22FF88;border:1px solid rgba(34,255,136,.35);transition:.15s}
.ksam-card:hover .ksam-cta{background:#22FF88;color:#000}

.ksam-sort{display:flex;gap:.4rem;flex-wrap:wrap}
.ksam-sortbtn{padding:.3rem .7rem;border-radius:999px;border:1px solid rgba(255,255,255,.1);background:transparent;color:#9ca3af;font-size:.75rem;transition:.15s}
.ksam-sortbtn:hover{color:#fff}
.ksam-sortbtn.on{background:rgba(56,189,248,.15);border-color:#38BDF8;color:#38BDF8}

.ksam-skel{border-radius:16px;border:1px solid rgba(255,255,255,.06);overflow:hidden;background:rgba(255,255,255,.03)}
.ksam-shim{background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.04) 75%);background-size:200% 100%;animation:ksamShim 1.2s infinite}
.ksam-msg{padding:2.5rem 1rem;text-align:center}
.ksam-msg strong{display:block;font-size:1rem;margin-bottom:.35rem}
.ksam-msg p{margin:0;color:#9ca3af;font-size:.88rem}
.ksam-err{padding:1rem;border-radius:14px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#fca5a5;font-size:.88rem}

.ksam-foot{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.8rem 1.25rem;border-top:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.4)}
.ksam-foot small{color:#6b7280;font-size:.75rem}
.ksam-all{display:flex;align-items:center;gap:.4rem;padding:.55rem 1.1rem;border-radius:10px;border:0;background:linear-gradient(135deg,#22FF88,#38BDF8);color:#000;font-weight:800;font-size:.85rem}

@media (max-width:640px){
  .ksam-overlay{padding:0}
  .ksam-panel{max-height:100vh;height:100%;border-radius:0}
  .ksam-cats{grid-template-columns:repeat(2,1fr)}
  .ksam-grid{grid-template-columns:repeat(2,1fr);gap:.7rem}
  .ksam-go{display:none}
  .ksam-foot small{display:none}
  .ksam-all{width:100%;justify-content:center}
}
@media (prefers-reduced-motion:reduce){.ksam-overlay,.ksam-panel,.ksam-shim,.ksam-spin{animation:none}}
@keyframes ksamFade{from{opacity:0}to{opacity:1}}
@keyframes ksamPop{from{opacity:0;transform:translateY(-14px) scale(.98)}to{opacity:1;transform:none}}
@keyframes ksamSpin{to{transform:rotate(360deg)}}
@keyframes ksamShim{to{background-position:-200% 0}}
`;

/* =====================================================
   SMALL COMPONENTS
===================================================== */

function ProductImage({ src, name }) {
    const [failed, setFailed] = useState(!src);
    return (
        <img
            src={failed ? placeholderFor(name) : src}
            alt={name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
        />
    );
}

function ProductCard({ p, onClick, cta = "View deal" }) {
    const discount =
        p.oldPrice && p.price && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

    return (
        <button type="button" className="ksam-card" onClick={() => onClick(p)}>
            <div className="ksam-img">
                <ProductImage src={p.image} name={p.name} />
                {discount > 0 && <span className="ksam-badge">{discount}% OFF</span>}
                {p.store && <span className="ksam-store">{p.store}</span>}
            </div>

            <div className="ksam-info">
                <h4 className="ksam-name">{p.name}</h4>

                {p.rating ? (
                    <span className="ksam-rate">
                        <Star size={12} fill="#FFD60A" color="#FFD60A" /> {p.rating}
                    </span>
                ) : null}

                <div className="ksam-price">
                    <span className="ksam-now">{p.priceText || formatPrice(p.price)}</span>
                    {discount > 0 && <span className="ksam-was">{formatPrice(p.oldPrice)}</span>}
                </div>

                <span className="ksam-cta">{cta}</span>
            </div>
        </button>
    );
}

/* =====================================================
   NAVBAR
===================================================== */

const SORTS = [
    ["relevance", "Relevance"],
    ["low", "Price: Low to High"],
    ["high", "Price: High to Low"],
    ["rating", "Top rated"],
];

function Navbar({ cartCount = 0, onProductClick, onViewAll }) {
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);
    const [recent, setRecent] = useState([]);
    const [sort, setSort] = useState("relevance");

    const inputRef = useRef(null);
    const requestId = useRef(0);

    /* ---------- recent searches ---------- */
    useEffect(() => {
        try {
            setRecent(JSON.parse(localStorage.getItem(RECENT_KEY)) || []);
        } catch {
            setRecent([]);
        }
    }, []);

    const saveRecent = (q) => {
        if (!q) return;
        const next = [q, ...recent.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 6);
        setRecent(next);
        try {
            localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        } catch {}
    };

    const clearRecent = () => {
        setRecent([]);
        try {
            localStorage.removeItem(RECENT_KEY);
        } catch {}
    };

    /* ---------- open / close ---------- */
    const openSearch = () => {
        setOpen(false);
        setSearchOpen(true);
    };

    const closeSearch = () => {
        requestId.current++;
        setSearchOpen(false);
        setQuery("");
        setResults([]);
        setError("");
        setSearched(false);
        setLoading(false);
        setSort("relevance");
    };

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") closeSearch();
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                openSearch();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        if (!searchOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
        return () => {
            document.body.style.overflow = prev;
            clearTimeout(t);
        };
    }, [searchOpen]);



    const runSearch = async (term = query) => {
    const q = term.trim();

    if (!q) {
        setResults([]);
        setError("");
        setLoading(false);
        setSearched(false);
        return;
    }

    setLoading(true);
    setError("");
    setSearched(false);

    try {
        // =====================================================
        // 1. SEARCH KSAM DEAL PRODUCTS FROM SUPABASE
        // =====================================================

        const searchTerm = `%${q}%`;

        const {
            data: databaseProducts,
            error: databaseError,
        } = await supabase
            .from("products")
            .select(`
                id,
                name,
                description,
                image_url,
                price,
                old_price,
                discount,
                rating,
                reviews,
                category_id,
                store_id,
                product_url,
                availability,
                external_id,
                is_active,
                stores (
                    id,
                    name
                )
            `)
            .eq("is_active", true)
            .or(
                `name.ilike.${searchTerm},description.ilike.${searchTerm}`
            )
            .order("discount", {
                ascending: false,
                nullsFirst: false,
            })
            .limit(30);

        if (databaseError) {
            console.error(
                "Supabase search error:",
                databaseError
            );
        }

        const ksamProducts =
            !databaseError && databaseProducts
                ? databaseProducts.map((product, index) =>
                      normalizeProduct(
                          {
                              ...product,
                              store:
                                  product.stores?.name || "",
                          },
                          index
                      )
                  )
                : [];


        // =====================================================
        // 2. SEARCH EXTERNAL PRODUCTS THROUGH EDGE FUNCTION
        // =====================================================

        const baseUrl =
            import.meta.env.VITE_SUPABASE_URL;

        const anonKey =
            import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!baseUrl || !anonKey) {
            setResults(ksamProducts);
            setSearched(true);
            return;
        }

        const response = await fetch(
            `${baseUrl}/functions/v1/search-products`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    apikey: anonKey,
                    Authorization: `Bearer ${anonKey}`,
                },

                body: JSON.stringify({
                    query: q,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(
                `External search failed: ${response.status}`
            );
        }

        const externalData =
            await response.json();

        if (!externalData.success) {
            throw new Error(
                externalData.error ||
                    "External product search failed."
            );
        }

        const externalProducts =
            (externalData.products || []).map(
                (product, index) =>
                    normalizeProduct(product, index)
            );


        // =====================================================
        // 3. COMBINE KSAM + EXTERNAL PRODUCTS
        // =====================================================

        const combinedProducts = [
            ...ksamProducts,
            ...externalProducts,
        ];


        // =====================================================
        // 4. REMOVE DUPLICATE PRODUCTS
        // =====================================================

        const uniqueProducts = [];
        const seen = new Set();

        for (const product of combinedProducts) {

            const key =
                product.url !== "#"
                    ? product.url
                    : `${product.name}-${product.store}`;

            if (seen.has(key)) {
                continue;
            }

            seen.add(key);
            uniqueProducts.push(product);
        }


        // =====================================================
        // 5. LIMIT DISPLAY RESULTS
        // =====================================================

        setResults(
            uniqueProducts.slice(0, 30)
        );

        setSearched(true);

    } catch (err) {

        console.error(
            "KSAM DEAL SEARCH ERROR:",
            err
        );

        // If external search fails but KSAM products
        // were found, still show the KSAM products.
        if (typeof ksamProducts !== "undefined" &&
            ksamProducts.length > 0) {

            setResults(ksamProducts);

            setError(
                "Showing KSAM Deal products. External products could not be loaded."
            );

        } else {

            setResults([]);

            setError(
                err?.message ||
                    "Couldn't load products. Please try again."
            );
        }

        setSearched(true);

    } finally {

        setLoading(false);

    }
};
    
    // live search while typing
    // useEffect(() => {
    //     if (!searchOpen) return;
    //     const t = setTimeout(() => runSearch(query), 350);
    //     return () => clearTimeout(t);
    // }, [query, searchOpen]);

    const submit = (e) => {
        e.preventDefault();
        saveRecent(query.trim());
        runSearch(query);
    };

    const pickTerm = (term) => {
        setQuery(term);
        saveRecent(term);
        if (inputRef.current) inputRef.current.focus();
    };

    const openProduct = (p) => {
        saveRecent(query.trim());
        if (onProductClick) {
            onProductClick(p);
            closeSearch();
        } else if (p.url && p.url !== "#") {
            window.open(p.url, "_blank", "noopener,noreferrer");
        }
    };

    const showIdle = !query.trim();

    const sorted = [...results].sort((a, b) => {
        if (sort === "low") return (a.price ?? Infinity) - (b.price ?? Infinity);
        if (sort === "high") return (b.price ?? -1) - (a.price ?? -1);
        if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
        return 0;
    });

    /* ---------- search panel ---------- */
    const searchPanel = (
        <div className="ksam-overlay" role="dialog" aria-modal="true" aria-label="Search products">
            <style>{CSS}</style>
            <div className="ksam-backdrop" onClick={closeSearch} />

            <div className="ksam-panel">
                {/* Input row */}
                <form className="ksam-bar" onSubmit={submit}>
                    <Search size={20} className="ksam-bar-icon" />

                    <input
                        ref={inputRef}
                        className="ksam-input"
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for products, brands and more..."
                        autoComplete="off"
                    />

                    {loading && <span className="ksam-spin" />}

                    {query && !loading && (
                        <button
                            type="button"
                            className="ksam-iconbtn"
                            aria-label="Clear search"
                            onClick={() => {
                                setQuery("");
                                if (inputRef.current) inputRef.current.focus();
                            }}
                        >
                            <X size={15} />
                        </button>
                    )}

                    <button type="submit" className="ksam-go">
                        Search
                    </button>

                    <button type="button" className="ksam-iconbtn" aria-label="Close search" onClick={closeSearch}>
                        <X size={16} />
                    </button>
                </form>

                {/* Body */}
                <div className="ksam-body">
                    {showIdle && (
                        <>
                            {recent.length > 0 && (
                                <div className="ksam-sec">
                                    <div className="ksam-h">
                                        <span>
                                            <Clock size={14} /> Recent searches
                                        </span>
                                        <button type="button" className="ksam-link" onClick={clearRecent}>
                                            Clear
                                        </button>
                                    </div>
                                    <div className="ksam-chips">
                                        {recent.map((r) => (
                                            <button type="button" key={r} className="ksam-chip" onClick={() => pickTerm(r)}>
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="ksam-sec">
                                <div className="ksam-h">
                                    <span>
                                        <TrendingUp size={14} /> Trending now
                                    </span>
                                </div>
                                <div className="ksam-chips">
                                    {TRENDING.map((t) => (
                                        <button type="button" key={t} className="ksam-chip" onClick={() => pickTerm(t)}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="ksam-sec">
                                <div className="ksam-h">
                                    <span>Popular deals</span>
                                </div>
                                <div className="ksam-grid">
                                    {DEMO_PRODUCTS.slice(0, 6).map((p, i) => (
                                        <ProductCard
                                            key={p.id}
                                            p={normalizeProduct(p, i)}
                                            cta="Search similar"
                                            onClick={(prod) => pickTerm(prod.name.split(" ").slice(0, 2).join(" "))}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="ksam-sec">
                                <div className="ksam-h">
                                    <span>Browse categories</span>
                                </div>
                                <div className="ksam-cats">
                                    {CATEGORIES.map(([c, emoji]) => (
                                        <button type="button" key={c} className="ksam-cat" onClick={() => pickTerm(c)}>
                                            <span className="ksam-cat-ico">{emoji}</span>
                                            {c}
                                            <ArrowUpRight size={15} className="ksam-cat-arrow" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {!showIdle && loading && results.length === 0 && (
                        <div className="ksam-grid">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="ksam-skel">
                                    <div className="ksam-shim" style={{ aspectRatio: "1/1" }} />
                                    <div style={{ padding: ".8rem" }}>
                                        <div className="ksam-shim" style={{ height: 12, borderRadius: 6, width: "80%" }} />
                                        <div className="ksam-shim" style={{ height: 12, borderRadius: 6, width: "40%", marginTop: 8 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!showIdle && error && <div className="ksam-err">{error}</div>}

                    {!showIdle && !loading && !error && searched && results.length === 0 && (
                        <div className="ksam-msg">
                            <strong>No products found for "{query.trim()}"</strong>
                            <p>Check the spelling or try a broader term.</p>
                        </div>
                    )}

                    {!showIdle && results.length > 0 && (
                        <div className="ksam-sec">
                            <div className="ksam-h" style={{ flexWrap: "wrap" }}>
                                <span>
                                    {results.length} result{results.length === 1 ? "" : "s"} for "{query.trim()}"
                                </span>
                                <div className="ksam-sort">
                                    {SORTS.map(([key, label]) => (
                                        <button
                                            type="button"
                                            key={key}
                                            className={`ksam-sortbtn${sort === key ? " on" : ""}`}
                                            onClick={() => setSort(key)}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="ksam-grid">
                                {sorted.map((p) => (
                                    <ProductCard key={p.id} p={p} onClick={openProduct} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!showIdle && results.length > 0 && (
                    <div className="ksam-foot">
                        <small>Press Esc to close</small>
                        <button
                            type="button"
                            className="ksam-all"
                            onClick={() => {
                                saveRecent(query.trim());
                                if (onViewAll) onViewAll(query.trim(), sorted);
                                closeSearch();
                            }}
                        >
                            View all results <ArrowUpRight size={15} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    /* ---------- header ---------- */
    return (
        <>
            <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
                    <a href="#home" className="flex items-center gap-2 text-xl font-black text-white">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#22FF88] to-[#38BDF8] text-black">
                            K
                        </span>
                        KSAM
                        <span className="text-[#22FF88]">DEAL</span>
                    </a>

                    <div className="hidden items-center gap-7 lg:flex">
                        {LINKS.map(([label, href]) => (
                            <a key={label} href={href} className="text-sm font-medium text-gray-300 transition hover:text-[#22FF88]">
                                {label}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={openSearch}
                            aria-label="Search products"
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 text-gray-300 transition hover:border-[#38BDF8]/50 hover:text-[#38BDF8] md:py-2.5 md:pl-3 md:pr-4"
                        >
                            <Search size={19} />
                            <span className="hidden text-sm md:inline">Search products...</span>
                        </button>

                        <button
                            type="button"
                            aria-label="Cart"
                            className="relative rounded-xl bg-[#22FF88] p-2.5 text-black transition hover:scale-105"
                        >
                            <ShoppingBag size={19} />
                            {cartCount > 0 && (
                                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FFD60A] px-1 text-xs font-black">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setOpen(!open)}
                            aria-label="Menu"
                            className="rounded-xl border border-white/10 p-2.5 text-white lg:hidden"
                        >
                            {open ? <X /> : <Menu />}
                        </button>
                    </div>
                </nav>

                {open && (
                    <div className="border-t border-white/10 bg-[#050505] px-5 py-5 lg:hidden">
                        <div className="flex flex-col gap-5">
                            {LINKS.map(([label, href]) => (
                                <a key={label} href={href} onClick={() => setOpen(false)} className="text-gray-200 hover:text-[#22FF88]">
                                    {label}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            {searchOpen && createPortal(searchPanel, document.body)}
        </>
    );
}

export default Navbar;

