import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, X, Clock, TrendingUp, ArrowUpRight, Star } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useCart, formatPrice, FREE_DELIVERY_THRESHOLD } from "../store/cartStore";
import { requireAuth, getSession, getProfile, onAuthChange, BASE_URL } from "../../auth/auth.js";
import "./Navbar.css";

/* =====================================================
   STATIC DATA & SEARCH DEFAULTS
===================================================== */
const LINKS = [
  ["Home", "#home"],
  ["Shop", "shop.html"],
  ["Deals", "#deals"],
  ["How It Works", "#how"],
  ["Features", "#features"],
  ["FAQ", "#faq"]
];

const TRENDING = [
  "Headphones",
  "Smart watch",
  "Sneakers",
  "Power bank",
  "Backpack",
  "Speaker"
];

const CATEGORIES = [
  ["Electronics", "💻"],
  ["Fashion", "👕"],
  ["Home & Kitchen", "🏠"],
  ["Beauty", "💄"],
  ["Sports", "⚽"],
  ["Toys", "🧸"]
];

const SORTS = [
  ["relevance", "Relevance"],
  ["low", "Price: Low to High"],
  ["high", "Price: High to Low"],
  ["rating", "Top rated"]
];

const SEARCH_PLACEHOLDERS = [
  "Search deals...",
  "Search phones...",
  "Search laptops...",
  "Search headphones..."
];

const RECENT_KEY = "ksam_recent_searches";

const IMG = (id) => `https://images.unsplash.com/${id}?w=500&auto=format&fit=crop&q=70`;

const DEMO_PRODUCTS = [
  { id: "d1", name: "Wireless Bluetooth Headphones", price: 1499, original_price: 2999, rating: 4.4, store: "Amazon", image: IMG("photo-1505740420928-5e560c06d30e") },
  { id: "d2", name: "Smart Watch Series 7", price: 2199, original_price: 4999, rating: 4.2, store: "Flipkart", image: IMG("photo-1523275335684-37898b6baf30") },
  { id: "d3", name: "Running Sneakers Red", price: 1799, original_price: 3499, rating: 4.5, store: "Myntra", image: IMG("photo-1542291026-7eec264c27ff") },
  { id: "d4", name: "Portable Power Bank 20000mAh", price: 999, original_price: 1999, rating: 4.3, store: "Amazon", image: IMG("photo-1609091839311-d5365f9ff1c5") },
  { id: "d5", name: "Travel Backpack 40L", price: 1199, original_price: 2499, rating: 4.1, store: "Flipkart", image: IMG("photo-1553062407-98eeb64c6a62") },
  { id: "d6", name: "Bluetooth Speaker Waterproof", price: 1299, original_price: 2599, rating: 4.6, store: "Amazon", image: IMG("photo-1608043152269-423dbba4e7e6") }
];

/* =====================================================
   SEARCH HELPERS
===================================================== */
const toNumber = (v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ""));
  return Number.isNaN(n) ? null : n;
};

const normalizeProduct = (p, i) => ({
  id: p.id ?? p.product_id ?? `p-${i}`,
  name: p.name ?? p.title ?? "Untitled product",
  image: p.image ?? p.image_url ?? p.thumbnail ?? p.serpapi_thumbnail ?? "",
  price: toNumber(p.extracted_price ?? p.price ?? p.sale_price) ?? 0,
  oldPrice: toNumber(p.extracted_old_price ?? p.original_price ?? p.mrp ?? p.old_price) ?? 0,
  rating: toNumber(p.rating),
  store: p.source ?? p.store ?? p.brand ?? "KSAM Deal",
  url: p.product_link ?? p.link ?? p.url ?? p.affiliate_url ?? "#"
});

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
    p.oldPrice && p.price && p.oldPrice > p.price
      ? Math.round((1 - p.price / p.oldPrice) * 100)
      : 0;

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
          <span className="ksam-now">{formatPrice(p.price)}</span>
          {discount > 0 && <span className="ksam-was">{formatPrice(p.oldPrice)}</span>}
        </div>

        <span className="ksam-cta">{cta}</span>
      </div>
    </button>
  );
}

/* =====================================================
   MAIN NAVBAR COMPONENT
===================================================== */
export default function Navbar({ onProductClick, onViewAll }) {
  // Cross-page detection: check if on deals/home page vs category/shop page
  const isShopPage = typeof window !== "undefined" && window.location.pathname.includes("shop.html");

  const isHomePage = (() => {
    if (typeof window === "undefined") return true;
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    const base = (BASE_URL || "/KSAM-deal-ecommerce-website/").replace(/\/+$/, "");
    if (path === "/" || path === "" || path === base || path === `${base}/index.html` || path.endsWith("/index.html")) {
      return true;
    }
    return false;
  })();

  const getLinkHref = (href) => {
    if (href === "shop.html") {
      const base = (BASE_URL || "/KSAM-deal-ecommerce-website/").replace(/\/+$/, "");
      return `${base}/shop.html`;
    }
    if (isHomePage) return href;
    const base = BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    return `${normalizedBase}index.html${href}`;
  };

  const handleNavLinkClick = (e, href) => {
    if (href === "shop.html") {
      return;
    }
    if (isHomePage && href.startsWith("#")) {
      const targetId = href.replace("#", "");
      const el = document.getElementById(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
        try {
          window.history.pushState(null, "", href);
        } catch {}
        setActiveSection(href);
      }
    }
  };

  const isActiveLink = (href) => {
    if (href === "shop.html") return isShopPage;
    if (!isHomePage) return false;
    return activeSection === href;
  };

  // Shared Cart
  const { items, count, subtotal, savings, setQty, remove } = useCart();

  // Navigation State
  const [activeSection, setActiveSection] = useState(() => (isHomePage ? "#home" : ""));
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartBouncing, setCartBouncing] = useState(false);
  const [badgeRolling, setBadgeRolling] = useState(false);
  const prevCountRef = useRef(count);

  // Search Trigger Pill State
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Supabase Search Modal State
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [recent, setRecent] = useState([]);
  const [sort, setSort] = useState("relevance");

  // User Profile & Auth State
  const [userSession, setUserSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const userSessionRef = useRef(null);

  const fetchProfileData = useCallback(async (currentSession, force = false) => {
    try {
      const sess = currentSession !== undefined ? currentSession : await getSession();
      setUserSession(sess);
      userSessionRef.current = sess;
      if (sess?.user?.id) {
        const prof = await getProfile(force);
        setUserProfile(prof);
      } else {
        setUserProfile(null);
      }
    } catch (e) {
      // never throw
    }
  }, []);

  useEffect(() => {
    let active = true;

    // Fetch initial profile
    fetchProfileData();

    // Subscribe to auth changes: fires once after sign-in / auth change
    const sub = onAuthChange((event, session) => {
      if (!active) return;
      if (event === "INITIAL_SESSION") {
        if (!userSessionRef.current && session) {
          fetchProfileData(session);
        }
        return;
      }
      fetchProfileData(session, event === "USER_UPDATED" || event === "SIGNED_IN");
    });

    const handleAvatarUpdated = () => {
      if (!active) return;
      fetchProfileData(undefined, true);
    };
    window.addEventListener("ksam:avatar-updated", handleAvatarUpdated);

    return () => {
      active = false;
      if (sub && typeof sub.unsubscribe === "function") {
        sub.unsubscribe();
      }
      window.removeEventListener("ksam:avatar-updated", handleAvatarUpdated);
    };
  }, [fetchProfileData]);

  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const mobileDrawerRef = useRef(null);
  const cartDrawerRef = useRef(null);
  const cartBtnRef = useRef(null);

  /* --------------------------------------------------------------------------
     1. Scroll & Sticky Navbar Background
     -------------------------------------------------------------------------- */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* --------------------------------------------------------------------------
     2. Active Section Spy via IntersectionObserver
     -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!isHomePage) {
      setActiveSection("");
      return;
    }
    const sectionIds = ["home", "deals", "how", "features", "faq"];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-30% 0px -40% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHomePage]);

  /* --------------------------------------------------------------------------
     3. Rotating Search Placeholder (2.5s)
     -------------------------------------------------------------------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  /* --------------------------------------------------------------------------
     4. Speech Recognition (Web Speech API)
     -------------------------------------------------------------------------- */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
          openSearch();
          runSearch(transcript);
        }
      };

      recognitionRef.current = recognition;
    }
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const handleVoiceSearch = (e) => {
    e.stopPropagation();
    if (!recognitionRef.current) return;
    try {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    } catch (err) {
      setIsListening(false);
    }
  };

  /* --------------------------------------------------------------------------
     5. Hotkeys: Ctrl/Cmd+K and '/' to Open Search, Escape to Close
     -------------------------------------------------------------------------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (searchOpen) closeSearch();
        if (isCartOpen) setIsCartOpen(false);
        if (isMobileNavOpen) setIsMobileNavOpen(false);
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
        return;
      }

      if (e.key === "/" && !searchOpen && !isCartOpen && !isMobileNavOpen) {
        const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
        if (tag !== "input" && tag !== "textarea") {
          e.preventDefault();
          openSearch();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, isCartOpen, isMobileNavOpen]);

  /* --------------------------------------------------------------------------
     6. Auto-Close Mobile Nav on Resize >= 1024px
     -------------------------------------------------------------------------- */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileNavOpen]);

  /* --------------------------------------------------------------------------
     7. Scroll Lock on Modals & Drawers
     -------------------------------------------------------------------------- */
  useEffect(() => {
    const shouldLock = searchOpen || isCartOpen || isMobileNavOpen;
    const prev = document.body.style.overflow;
    if (shouldLock) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, [searchOpen, isCartOpen, isMobileNavOpen]);

  /* --------------------------------------------------------------------------
     8. Cart Add Bounce Feedback
     -------------------------------------------------------------------------- */
  useEffect(() => {
    if (count > prevCountRef.current) {
      setCartBouncing(true);
      setBadgeRolling(true);
      const t1 = setTimeout(() => setCartBouncing(false), 700);
      const t2 = setTimeout(() => setBadgeRolling(false), 500);
      prevCountRef.current = count;
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    prevCountRef.current = count;
  }, [count]);

  /* --------------------------------------------------------------------------
     9. Recent Searches Storage
     -------------------------------------------------------------------------- */
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

  /* --------------------------------------------------------------------------
     10. Search Modal Logic (Supabase + Edge Function + Fallback)
     -------------------------------------------------------------------------- */
  const openSearch = () => {
    setIsMobileNavOpen(false);
    setIsCartOpen(false);
    setSearchOpen(true);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 60);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    setError("");
    setSearched(false);
    setLoading(false);
    setSort("relevance");
  };

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

    let ksamProducts = [];
    try {
      const searchTerm = `%${q}%`;
      const supabaseQuery = supabase
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
          stores ( id, name )
        `)
        .eq("is_active", true)
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .order("discount", { ascending: false, nullsFirst: false })
        .limit(30);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out after 8s")), 8000)
      );

      const { data: databaseProducts, error: databaseError } = await Promise.race([
        supabaseQuery,
        timeoutPromise
      ]);

      if (databaseError) {
        throw databaseError;
      }

      ksamProducts =
        databaseProducts
          ? databaseProducts.map((product, index) =>
              normalizeProduct(
                { ...product, store: product.stores?.name || "KSAM Deal" },
                index
              )
            )
          : [];

      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!baseUrl || !anonKey) {
        setResults(ksamProducts);
        setSearched(true);
        return;
      }

      let externalProducts = [];
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(`${baseUrl}/functions/v1/search-products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`
          },
          body: JSON.stringify({ query: q }),
          signal: controller.signal
        });
        clearTimeout(timer);

        if (response.ok) {
          const externalData = await response.json();
          if (externalData.success && Array.isArray(externalData.products)) {
            externalProducts = externalData.products.map((product, index) =>
              normalizeProduct(product, index)
            );
          }
        }
      } catch (e) {
        // External edge search skipped or timed out
      }

      const combined = [...ksamProducts, ...externalProducts];
      const unique = [];
      const seen = new Set();
      for (const p of combined) {
        const key = p.url !== "#" ? p.url : `${p.name}-${p.store}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(p);
        }
      }

      if (unique.length > 0) {
        setResults(unique.slice(0, 30));
        if (ksamProducts.length > 0 && externalProducts.length === 0) {
          setError("Showing KSAM Deal products. External products could not be loaded.");
        }
      } else {
        const matched = DEMO_PRODUCTS.filter((p) =>
          p.name.toLowerCase().includes(q.toLowerCase())
        );
        setResults((matched.length > 0 ? matched : DEMO_PRODUCTS).map(normalizeProduct));
        setError("Showing KSAM Deal products.");
      }
      setSearched(true);
    } catch (err) {
      console.error("Failed to fetch deals:", err);
      if (ksamProducts.length > 0) {
        setResults(ksamProducts);
        setError("Showing KSAM Deal products. External products could not be loaded.");
      } else {
        const matched = DEMO_PRODUCTS.filter((p) =>
          p.name.toLowerCase().includes(q.toLowerCase())
        );
        setResults((matched.length > 0 ? matched : DEMO_PRODUCTS).map(normalizeProduct));
        setError("Showing KSAM Deal products.");
      }
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const submitSearch = (e) => {
    e.preventDefault();
    saveRecent(query.trim());
    runSearch(query);
  };

  const pickTerm = (term) => {
    setQuery(term);
    saveRecent(term);
    runSearch(term);
    if (inputRef.current) inputRef.current.focus();
  };

  const openProduct = (p) => {
    saveRecent(query.trim());
    if (onProductClick) {
      onProductClick(p);
      closeSearch();
    } else if (p.id && !String(p.id).startsWith("p-") && !String(p.id).startsWith("demo-")) {
      const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
      window.location.href = `${base}deal.html?id=${encodeURIComponent(p.id)}`;
    } else if (p.url && p.url !== "#") {
      window.open(p.url, "_blank", "noopener,noreferrer");
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sort === "low") return (a.price ?? Infinity) - (b.price ?? Infinity);
    if (sort === "high") return (b.price ?? -1) - (a.price ?? -1);
    if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    return 0;
  });

  /* --------------------------------------------------------------------------
     11. User Profile Navigation & Initials Helper
     -------------------------------------------------------------------------- */
  const getInitials = (profile, session) => {
    if (profile?.full_name && profile.full_name.trim()) {
      const parts = profile.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    const email = profile?.email || session?.user?.email || "";
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  const handleUserClick = (e) => {
    e.preventDefault();
    if (userSession) {
      window.location.href = `${BASE_URL}profile.html`;
    } else {
      requireAuth({ returnTo: `${BASE_URL}profile.html` });
    }
  };

  /* --------------------------------------------------------------------------
     12. Checkout Navigation
     -------------------------------------------------------------------------- */
  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    if (!requireAuth({ type: "checkout" })) return;
    setIsCartOpen(false);
    const checkoutUrl = new URL("checkout.html", window.location.href).href;
    window.location.href = checkoutUrl;
  };

  /* --------------------------------------------------------------------------
     12. Logo Click: Smooth Scroll to Top + Bounce
     -------------------------------------------------------------------------- */
  const handleLogoClick = (e) => {
    e.preventDefault();
    if (!isHomePage) {
      const base = BASE_URL || "/KSAM-deal-ecommerce-website/";
      const normalizedBase = base.endsWith("/") ? base : `${base}/`;
      window.location.href = `${normalizedBase}index.html#home`;
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* --------------------------------------------------------------------------
     13. Quantity Steppers & Removal Animation
     -------------------------------------------------------------------------- */
  const handleMinusQty = (item, rowEl) => {
    const currentQty = Number(item.quantity || item.qty || 1);
    if (currentQty > 1) {
      setQty(item.id, currentQty - 1);
    } else {
      handleRemoveItem(item.id, rowEl);
    }
  };

  const handlePlusQty = (item) => {
    const currentQty = Number(item.quantity || item.qty || 1);
    setQty(item.id, currentQty + 1);
  };

  const handleRemoveItem = (id, rowEl) => {
    if (rowEl) {
      rowEl.classList.add("slide-out");
      setTimeout(() => {
        remove(id);
      }, 300);
    } else {
      remove(id);
    }
  };

  /* --------------------------------------------------------------------------
     14. Free Delivery Calculations (Threshold ₹999)
     -------------------------------------------------------------------------- */
  const threshold = FREE_DELIVERY_THRESHOLD;
  const remainingForDelivery = Math.max(0, threshold - subtotal);
  const deliveryPct = Math.min(100, Math.round((subtotal / threshold) * 100));

  /* --------------------------------------------------------------------------
     15. Search Overlay Modal JSX (Portal to document.body)
     -------------------------------------------------------------------------- */
  const searchOverlayPortal = searchOpen && typeof document !== "undefined"
    ? createPortal(
        <div
          className="ksam-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search products"
        >
          <div className="ksam-backdrop" onClick={closeSearch} />

          <div className="ksam-panel">
            {/* Input Row */}
            <form className="ksam-bar" onSubmit={submitSearch}>
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

              <button
                type="button"
                className="ksam-iconbtn"
                aria-label="Close search"
                onClick={closeSearch}
              >
                <X size={16} />
              </button>
            </form>

            {/* Modal Body */}
            <div className="ksam-body">
              {!query.trim() && (
                <>
                  {recent.length > 0 && (
                    <div className="ksam-sec">
                      <div className="ksam-h">
                        <span>
                          <Clock size={14} /> Recent searches
                        </span>
                        <button
                          type="button"
                          className="ksam-link"
                          onClick={clearRecent}
                        >
                          Clear
                        </button>
                      </div>
                      <div className="ksam-chips">
                        {recent.map((r) => (
                          <button
                            type="button"
                            key={r}
                            className="ksam-chip"
                            onClick={() => pickTerm(r)}
                          >
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
                        <button
                          type="button"
                          key={t}
                          className="ksam-chip"
                          onClick={() => pickTerm(t)}
                        >
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
                          onClick={(prod) =>
                            pickTerm(prod.name.split(" ").slice(0, 2).join(" "))
                          }
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
                        <button
                          type="button"
                          key={c}
                          className="ksam-cat"
                          onClick={() => pickTerm(c)}
                        >
                          <span className="ksam-cat-ico">{emoji}</span>
                          {c}
                          <ArrowUpRight size={15} className="ksam-cat-arrow" />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {query.trim() && loading && results.length === 0 && (
                <div className="ksam-grid">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="ksam-skel">
                      <div className="ksam-shim" style={{ aspectRatio: "1/1" }} />
                      <div style={{ padding: ".8rem" }}>
                        <div
                          className="ksam-shim"
                          style={{ height: 12, borderRadius: 6, width: "80%" }}
                        />
                        <div
                          className="ksam-shim"
                          style={{
                            height: 12,
                            borderRadius: 6,
                            width: "40%",
                            marginTop: 8
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {query.trim() && error && <div className="ksam-err">{error}</div>}

              {query.trim() && !loading && !error && searched && results.length === 0 && (
                <div className="ksam-msg">
                  <strong>No products found for "{query.trim()}"</strong>
                  <p>Check the spelling or try a broader term.</p>
                </div>
              )}

              {query.trim() && results.length > 0 && (
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
                    {sortedResults.map((p) => (
                      <ProductCard key={p.id} p={p} onClick={openProduct} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {query.trim() && results.length > 0 && (
              <div className="ksam-foot">
                <small>Press Esc to close</small>
                <button
                  type="button"
                  className="ksam-all"
                  onClick={() => {
                    saveRecent(query.trim());
                    if (onViewAll) onViewAll(query.trim(), sortedResults);
                    closeSearch();
                  }}
                >
                  View all results <ArrowUpRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )
    : null;

  /* =====================================================
     RENDER NAVBAR
  ===================================================== */
  return (
    <>
      <header className={`kh-nav-header${isScrolled ? " kh-nav-scrolled" : ""}`} id="navbar">
        <div className="kh-nav-container">

          {/* 1. Animated KSAM Deal Inline SVG Logo Lockup */}
          <a
            href={!isHomePage ? `${(BASE_URL || "/KSAM-deal-ecommerce-website/").replace(/\/+$/, "")}/index.html#home` : "#home"}
            className="kh-nav-brand"
            id="navBrandLogo"
            aria-label="KSAM Deal - Home"
            onClick={handleLogoClick}
          >
            <svg
              className="kh-nav-brand-svg"
              viewBox="0 0 252 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="KSAM Deal"
            >
              <defs>
                <linearGradient id="khNavLogoBagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4dffa3" />
                  <stop offset="45%" stopColor="#16c86b" />
                  <stop offset="100%" stopColor="#0e9f55" />
                </linearGradient>

                <linearGradient id="khNavLogoSpeedGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="30" y2="0">
                  <stop offset="0%" stopColor="#4dffa3" />
                  <stop offset="100%" stopColor="#16c86b" />
                </linearGradient>

                <linearGradient id="khNavLogoKsamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#b8ffd9" />
                </linearGradient>

                <linearGradient id="khNavLogoDealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22ff88" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>

                <linearGradient id="khNavLogoLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#7cff9b" />
                </linearGradient>

                <linearGradient id="khNavCartIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22ff88" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {/* Icon Group: Speed Lines + Bag + Cart */}
              <g className="kh-nav-logo-icon-wrap" filter="url(#khNavLogoIconGlow)">
                <g className="kh-nav-logo-speed-lines">
                  <circle className="kh-nav-speed-dot" cx="4" cy="19.5" r="2.1" fill="#4dffa3" />
                  <rect className="kh-nav-speed-line sl-1" x="9" y="18" width="13.5" height="3" rx="1.5" fill="url(#khNavLogoSpeedGrad)" />
                  <rect className="kh-nav-speed-line sl-2" x="1.5" y="24.5" width="23.5" height="3.5" rx="1.75" fill="url(#khNavLogoSpeedGrad)" />
                  <rect className="kh-nav-speed-line sl-3" x="5.5" y="31" width="16.5" height="3" rx="1.5" fill="url(#khNavLogoSpeedGrad)" />
                </g>

                <g className="kh-nav-logo-bag-body">
                  <path className="kh-nav-bag-handle" d="M 32 10.5 C 32 3.5, 46 3.5, 46 10.5" fill="none" stroke="url(#khNavLogoBagGrad)" strokeWidth="2.8" strokeLinecap="round" />
                  <path className="kh-nav-bag-tote" d="M 25 10.5 L 53 10.5 C 55.5 10.5, 57.2 12.5, 56.7 15 L 53.8 32 C 53.2 34.2, 51.2 35.5, 48.8 35.5 L 29.2 35.5 C 26.8 35.5, 24.8 34.2, 24.2 32 L 21.3 15 C 20.8 12.5, 22.5 10.5, 25 10.5 Z" fill="url(#khNavLogoBagGrad)" stroke="rgba(255, 255, 255, 0.28)" strokeWidth="0.8" />
                  <path className="kh-nav-bag-gloss" d="M 25.2 11.5 L 52.8 11.5 C 54.5 11.5, 55.5 12.8, 55 14.5 L 53.8 19.5 C 47.5 22, 27.5 22, 23 19.5 L 22.2 14.5 C 21.7 12.8, 22.7 11.5, 25.2 11.5 Z" fill="#ffffff" fillOpacity="0.32" />
                  <circle cx="32" cy="12" r="1.6" fill="#0e9f55" stroke="#4dffa3" strokeWidth="0.8" />
                  <circle cx="46" cy="12" r="1.6" fill="#0e9f55" stroke="#4dffa3" strokeWidth="0.8" />

                  <g className="kh-nav-logo-cart">
                    <path className="kh-nav-cart-basket" d="M 26 17.5 L 30 17.5 L 34.5 29 L 47.5 29 L 50.5 21.5 L 32 21.5" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <g className="kh-nav-cart-wheel-left" transform="translate(35.5, 33.5)">
                      <circle cx="0" cy="0" r="2.2" fill="#ffffff" />
                      <circle cx="0.7" cy="0" r="0.65" fill="#16c86b" />
                    </g>
                    <g className="kh-nav-cart-wheel-right" transform="translate(46, 33.5)">
                      <circle cx="0" cy="0" r="2.2" fill="#ffffff" />
                      <circle cx="0.7" cy="0" r="0.65" fill="#16c86b" />
                    </g>
                  </g>
                </g>
              </g>

              {/* Wordmark: "ksamdeal" */}
              <g className="kh-nav-logo-wordmark" filter="url(#khNavLogoTextShadow)" fontFamily="'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif" fontSize="28" fontWeight="800">
                <text className="kh-nav-logo-letter" x="64" y="35" fill="url(#khNavLogoKsamGrad)">k</text>
                <text className="kh-nav-logo-letter" x="82.3" y="35" fill="url(#khNavLogoKsamGrad)">s</text>
                <text className="kh-nav-logo-letter" x="98.9" y="35" fill="url(#khNavLogoKsamGrad)">a</text>
                <text className="kh-nav-logo-letter" x="117.2" y="35" fill="url(#khNavLogoKsamGrad)">m</text>
                <text className="kh-nav-logo-letter" x="144.8" y="35" fill="url(#khNavLogoDealGrad)">d</text>
                <text className="kh-nav-logo-letter" x="163" y="35" fill="url(#khNavLogoDealGrad)">e</text>
                <text className="kh-nav-logo-letter" x="181.3" y="35" fill="url(#khNavLogoDealGrad)">a</text>
                <text className="kh-nav-logo-letter" x="199.5" y="35" fill="url(#khNavLogoDealGrad)">l</text>
              </g>

              {/* Leaf Anchor Attached to 'l' */}
              <g className="kh-nav-logo-leaf-anchor" transform="translate(208.5, 16)">
                <g className="kh-nav-logo-leaf-wrap">
                  <path className="kh-nav-leaf-stem" d="M 0 0 C 2 -3, 4 -5.5, 7.5 -8" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                  <path className="kh-nav-leaf-blade-main" d="M 7.5 -8 C 6 -14, 16 -18, 22.5 -13.5 C 22.5 -7, 14 -3, 7.5 -8 Z" fill="url(#khNavLogoLeafGrad)" />
                  <path className="kh-nav-leaf-vein" d="M 7.5 -8 Q 14 -12, 20.5 -13.5" fill="none" stroke="#ffffff" strokeWidth="0.9" opacity="0.8" strokeLinecap="round" />
                  <path className="kh-nav-leaf-blade-sub" d="M 5 -6 C 1.5 -8.5, -1 -13.5, 3 -14.5 C 6 -13.5, 7 -8.5, 5 -6 Z" fill="url(#khNavLogoLeafGrad)" />
                </g>
              </g>

            </svg>
          </a>

          {/* 2. Centered Desktop Navigation Links with Active Underline */}
          <nav className="kh-nav-menu" aria-label="Primary Navigation">
            <ul className="kh-nav-links">
              {LINKS.map(([label, href]) => (
                <li key={label}>
                  <a
                    href={getLinkHref(href)}
                    className={`kh-nav-link${isActiveLink(href) ? " kh-nav-active" : ""}`}
                    onClick={(e) => handleNavLinkClick(e, href)}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* 3. Actions Cluster: Search Pill Trigger, Cart Button, Hamburger */}
          <div className="kh-nav-actions">

            {/* Pill Search Trigger (Opens Supabase Search Overlay) */}
            <div
              className="kh-nav-search-box"
              onClick={openSearch}
              role="button"
              tabIndex={0}
              aria-label="Open search dialog"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openSearch();
                }
              }}
            >
              <Search size={16} className="kh-nav-search-icon" />
              <span className="kh-nav-search-placeholder">
                {SEARCH_PLACEHOLDERS[placeholderIdx]}
              </span>
              <kbd className="kh-nav-search-kbd" aria-hidden="true">/</kbd>
              {speechSupported && (
                <button
                  type="button"
                  className={`kh-nav-search-mic-btn${isListening ? " listening" : ""}`}
                  onClick={handleVoiceSearch}
                  aria-label="Voice search"
                  title="Search by voice"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>
              )}
            </div>

            {/* Colorful 48px Animated Cart Button */}
            <div className="kh-nav-cart-btn-wrap">
              <button
                ref={cartBtnRef}
                type="button"
                className={`kh-nav-cart-btn${count > 0 ? " has-items" : ""}${cartBouncing ? " kh-nav-cart-bounce" : ""}`}
                data-ksam-cart
                aria-label={`View shopping cart with ${count} items`}
                onClick={() => setIsCartOpen(true)}
              >
                <div className="kh-nav-cart-conic-ring" aria-hidden="true" />
                <div className="kh-nav-cart-inner">
                  <svg
                    className="kh-nav-cart-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="url(#khNavCartIconGrad)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 8h12l1.5 13H4.5L6 8z" />
                    <path d="M9 8V5a3 3 0 0 1 6 0v3" />
                  </svg>
                </div>
                <span className={`kh-nav-cart-badge${badgeRolling ? " roll" : ""}`} aria-live="polite">
                  {count}
                </span>
              </button>

              <div className="kh-nav-cart-tooltip">
                {count} item{count === 1 ? "" : "s"} • {formatPrice(subtotal)}
              </div>
            </div>

            {/* User Profile / Auth Avatar Button (44px circle, 40px on mobile) */}
            <div className="kh-nav-avatar-wrap">
              <button
                type="button"
                className={`kh-nav-avatar-btn${userSession ? " is-authenticated" : " is-guest"}`}
                onClick={handleUserClick}
                aria-label={userSession ? "Open your profile" : "Sign in to KSAM Deal"}
              >
                {userSession ? (
                  <>
                    <div className="kh-nav-avatar-ring" aria-hidden="true" />
                    <div className="kh-nav-avatar-inner">
                      {userProfile?.avatar_url ? (
                        <img
                          src={userProfile.avatar_url}
                          alt={userProfile.full_name || "Profile avatar"}
                          className="kh-nav-avatar-img"
                        />
                      ) : (
                        <div className="kh-nav-avatar-initials">
                          {getInitials(userProfile, userSession)}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="kh-nav-avatar-guest-inner">
                    <svg
                      className="kh-nav-avatar-silhouette"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
              </button>

              <div className="kh-nav-avatar-tooltip" role="tooltip">
                {userSession ? (userProfile?.full_name || "Profile") : "Sign in"}
              </div>
            </div>

            {/* Hamburger Button (<1024px) */}
            <button
              type="button"
              className={`kh-nav-hamburger-btn${isMobileNavOpen ? " is-active" : ""}`}
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileNavOpen}
              aria-controls="khMobileNavDrawer"
            >
              <span className="kh-nav-hamburger-box" aria-hidden="true">
                <span className="kh-nav-hamburger-line line-top" />
                <span className="kh-nav-hamburger-line line-mid" />
                <span className="kh-nav-hamburger-line line-bot" />
              </span>
            </button>

          </div>
        </div>
      </header>

      {/* 4. Mobile Navigation Drawer (<1024px) */}
      <div
        className={`kh-nav-mobile-backdrop${isMobileNavOpen ? " is-open" : ""}`}
        onClick={() => setIsMobileNavOpen(false)}
        aria-hidden="true"
      />
      <aside
        id="khMobileNavDrawer"
        ref={mobileDrawerRef}
        className={`kh-nav-mobile-drawer${isMobileNavOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        <div className="kh-nav-mobile-header">
          <span className="kh-nav-mobile-title">Menu</span>
          <button
            type="button"
            className="kh-nav-mobile-close-btn"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="kh-nav-mobile-menu">
          <ul className="kh-nav-mobile-list">
            {LINKS.map(([label, href]) => (
              <li key={label} className="kh-nav-mobile-item">
                <a
                  href={getLinkHref(href)}
                  className={`kh-nav-mobile-link${isActiveLink(href) ? " kh-nav-active" : ""}`}
                  onClick={(e) => {
                    setIsMobileNavOpen(false);
                    handleNavLinkClick(e, href);
                  }}
                >
                  <span className="kh-nav-mobile-dot" />
                  {label}
                </a>
              </li>
            ))}
            <li className="kh-nav-mobile-item">
              <a
                href={`${BASE_URL}profile.html`}
                className="kh-nav-mobile-link"
                onClick={(e) => {
                  setIsMobileNavOpen(false);
                  if (!userSession) {
                    e.preventDefault();
                    requireAuth({ returnTo: `${BASE_URL}profile.html` });
                  }
                }}
              >
                <span className="kh-nav-mobile-dot" style={{ background: "#38bdf8" }} />
                {userSession ? "My Profile" : "Sign In / Profile"}
              </a>
            </li>
            <li className="kh-nav-mobile-item">
              <a
                href={`${BASE_URL}contact-us.html`}
                className="kh-nav-mobile-link"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <span className="kh-nav-mobile-dot" style={{ background: "#22ff88" }} />
                Contact Us
              </a>
            </li>
          </ul>
        </nav>

        <div className="kh-nav-mobile-footer">
          <a
            href={`${import.meta.env.BASE_URL}shop.html`}
            className="kh-nav-mobile-cta"
            onClick={() => setIsMobileNavOpen(false)}
          >
            <span>Our Products</span>
            <ArrowUpRight size={16} />
          </a>
        </div>
      </aside>

      {/* 5. Mini Cart Drawer Sliding from Right */}
      <div
        className={`kh-nav-cart-backdrop${isCartOpen ? " is-open" : ""}`}
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />
      <aside
        ref={cartDrawerRef}
        className={`kh-nav-cart-drawer${isCartOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
      >
        {/* Drawer Header */}
        <div className="kh-nav-cart-drawer-header">
          <div className="kh-nav-cart-drawer-title-group">
            <h2 className="kh-nav-cart-drawer-title">Your Cart</h2>
            <span className="kh-nav-cart-drawer-count-badge">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            type="button"
            className="kh-nav-cart-drawer-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Delivery Bar (Threshold ₹999) */}
        <div className="kh-nav-cart-delivery-box">
          <div className="kh-nav-cart-delivery-text">
            {subtotal >= threshold ? (
              <span>🎉 <strong style={{ color: "#22ff88" }}>You've unlocked FREE Express Delivery!</strong></span>
            ) : (
              <span>
                Add <strong className="kh-nav-cart-delivery-needed">{formatPrice(remainingForDelivery)}</strong> more for <span style={{ color: "#22ff88" }}>FREE Express Delivery</span>
              </span>
            )}
          </div>
          <div className="kh-nav-cart-delivery-track">
            <div
              className={`kh-nav-cart-delivery-fill${subtotal >= threshold ? " complete" : ""}`}
              style={{ width: `${deliveryPct}%` }}
            />
          </div>
        </div>

        {/* Item Rows / Empty State */}
        {items.length === 0 ? (
          <div className="kh-nav-cart-empty-state">
            <div className="kh-nav-cart-empty-icon-wrap" aria-hidden="true">
              <svg className="kh-nav-cart-empty-bag-svg" viewBox="0 0 100 100" fill="none">
                <path d="M 32 38 C 32 20, 68 20, 68 38" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                <rect x="20" y="38" width="60" height="50" rx="12" stroke="currentColor" strokeWidth="5" />
                <line x1="38" y1="56" x2="62" y2="56" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <circle cx="50" cy="70" r="3.5" fill="currentColor" />
              </svg>
            </div>
            <h3 className="kh-nav-cart-empty-title">Your cart is empty</h3>
            <p className="kh-nav-cart-empty-desc">
              Discover handpicked flagship tech deals with up to 70% instant savings.
            </p>
            <button
              type="button"
              className="kh-nav-cart-empty-browse-btn"
              onClick={() => {
                setIsCartOpen(false);
                if (!isHomePage) {
                  const base = BASE_URL || "/KSAM-deal-ecommerce-website/";
                  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
                  window.location.href = `${normalizedBase}index.html#deals`;
                } else {
                  const el = document.getElementById("deals") || document.getElementById("showcase");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="kh-nav-cart-drawer-items" role="list">
            {items.map((item) => {
              const itemQty = Number(item.quantity || item.qty || 1);
              return (
                <div
                  key={item.id}
                  id={`cart-row-${item.id}`}
                  className="kh-nav-cart-item-row"
                >
                  <img
                    src={item.image || placeholderFor(item.name)}
                    alt={item.name}
                    className="kh-nav-cart-item-thumb"
                    onError={(e) => {
                      e.currentTarget.src = placeholderFor(item.name);
                    }}
                  />
                  <div className="kh-nav-cart-item-info">
                    <div className="kh-nav-cart-item-name" title={item.name}>
                      {item.name}
                    </div>
                    <div className="kh-nav-cart-item-price">
                      <span>{formatPrice(item.price)}</span>
                      {item.oldPrice && item.oldPrice > item.price ? (
                        <span className="kh-nav-cart-item-oldprice">
                          {formatPrice(item.oldPrice)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="kh-nav-cart-item-actions">
                    <div className="kh-nav-cart-qty-stepper">
                      <button
                        type="button"
                        className="kh-nav-cart-stepper-btn"
                        onClick={(e) => {
                          const row = e.currentTarget.closest(".kh-nav-cart-item-row");
                          handleMinusQty(item, row);
                        }}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="kh-nav-cart-stepper-qty">{itemQty}</span>
                      <button
                        type="button"
                        className="kh-nav-cart-stepper-btn"
                        onClick={() => handlePlusQty(item)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="kh-nav-cart-item-remove-btn"
                      onClick={(e) => {
                        const row = e.currentTarget.closest(".kh-nav-cart-item-row");
                        handleRemoveItem(item.id, row);
                      }}
                      aria-label={`Remove ${item.name} from cart`}
                      title="Remove item"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cart Drawer Footer */}
        <div className="kh-nav-cart-drawer-footer">
          <div className="kh-nav-cart-summary-line">
            <span>Subtotal</span>
            <span className="kh-nav-cart-summary-val">{formatPrice(subtotal)}</span>
          </div>

          {savings > 0 && (
            <div className="kh-nav-cart-summary-line kh-nav-cart-savings-line">
              <span>Instant Savings</span>
              <span className="kh-nav-cart-savings-val">-{formatPrice(savings)}</span>
            </div>
          )}

          <div className="kh-nav-cart-summary-line">
            <span>Express Delivery</span>
            <span className="kh-nav-cart-shipping-val">
              {subtotal >= threshold ? "FREE" : "₹49"}
            </span>
          </div>

          <div className="kh-nav-cart-total-line">
            <span>Total</span>
            <span className="kh-nav-cart-total-val">
              {formatPrice(subtotal >= threshold ? subtotal : subtotal + (subtotal > 0 ? 49 : 0))}
            </span>
          </div>

          <button
            type="button"
            className="kh-nav-cart-checkout-btn"
            disabled={items.length === 0}
            onClick={handleProceedToCheckout}
          >
            <span className="kh-nav-checkout-shine" aria-hidden="true" />
            <span>Proceed to Checkout</span>
            <ArrowUpRight size={18} />
          </button>

          <a
            href={`${(BASE_URL || "/KSAM-deal-ecommerce-website/").replace(/\/+$/, "")}/addToCart.html`}
            className="kh-nav-cart-view-cart-btn"
            onClick={() => setIsCartOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              padding: "10px 16px",
              marginTop: "8px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#94a3b8",
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.2s ease"
            }}
          >
            <span>View Full Cart Page (addToCart.html)</span>
          </a>
        </div>
      </aside>

      {/* Supabase Search Overlay Portal */}
      {searchOverlayPortal}
    </>
  );
}
