import { useEffect, useRef, useState } from "react";

/* ============================================================
   ICONS
============================================================ */
function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round",
  };
  const icons = {
    mail: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>),
    arrow: (<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>),
    arrowUp: (<><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>),
    truck: (<><path d="M3 7h11v10H3z" /><path d="M14 10h4l3 3v4h-7z" /><circle cx="7" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></>),
    return: (<><path d="M4 12a8 8 0 1 0 3-6.2" /><path d="M4 4v6h6" /></>),
    shield: (<><path d="M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7z" /><path d="m8 12 2.5 2.5L16 9" /></>),
    support: (<><path d="M4 13a8 8 0 0 1 16 0" /><path d="M4 13v4h3v-4z" /><path d="M17 13v4h3v-4z" /><path d="M17 18c0 2-2 3-5 3" /></>),
    instagram: (<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" stroke="none" /></>),
    facebook: (<path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v5h4v-5h3l1-4h-4V9c0-.7.3-1 1-1z" />),
    youtube: (<><rect x="3" y="6" width="18" height="12" rx="4" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></>),
    x: (<><path d="M5 4 19 20" /><path d="M19 4 5 20" /></>),
    check: (<path d="m5 12 4 4L19 6" />),
    sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M4.9 4.9l1.4 1.4" /><path d="M17.7 17.7l1.4 1.4" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M4.9 19.1l1.4-1.4" /><path d="M17.7 6.3l1.4-1.4" /></>),
    moon: (<path d="M21 14.8A8.5 8.5 0 0 1 9.2 3a8.5 8.5 0 1 0 11.8 11.8Z" />),
    chevron: (<path d="m6 9 6 6 6-6" />),
    copy: (<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>),
    flame: (<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" />),
    tag: (<><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1" fill="currentColor" stroke="none" /></>),
  };
  return <svg {...common}>{icons[name]}</svg>;
}

/* ============================================================
   HOOKS
============================================================ */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, shown];
}

function useCountUp(target, run, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf, start;
    const tick = (t) => {
      start = start ?? t;
      const p = Math.min((t - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return value;
}

function useCountdown() {
  const calc = () => {
    const now = new Date();
    const end = new Date(now); end.setHours(24, 0, 0, 0);
    const s = Math.max(0, Math.floor((end - now) / 1000));
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60];
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function useCycle(length, ms) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % length), ms);
    return () => clearInterval(id);
  }, [length, ms]);
  return i;
}

/* Pointer tracking through CSS variables (no re-render per mouse move) */
const trackPointer = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 100;
  const y = ((e.clientY - r.top) / r.height) * 100;
  const s = e.currentTarget.style;
  s.setProperty("--mx", `${x}%`);
  s.setProperty("--my", `${y}%`);
  s.setProperty("--rx", `${((50 - y) / 50) * 5}deg`);
  s.setProperty("--ry", `${((x - 50) / 50) * 5}deg`);
};
const resetPointer = (e) => {
  const s = e.currentTarget.style;
  s.setProperty("--mx", "50%");
  s.setProperty("--my", "50%");
  s.setProperty("--rx", "0deg");
  s.setProperty("--ry", "0deg");
};

/* ============================================================
   SMALL COMPONENTS
============================================================ */
const TICKER_A = [
  "Electronics up to 40% off", "Fresh price drops every hour", "Free shipping on qualifying orders",
  "Verified deals only", "New arrivals added daily", "Compare offers in one place",
];
const TICKER_B = [
  "Fashion deals refreshed daily", "Home & kitchen offers", "Price-drop alerts on your wishlist",
  "Trusted sellers only", "Weekend flash sales", "Cashback on selected brands",
];

function TickerRow({ items, reverse }) {
  const list = [...items, ...items];
  return (
    <div className="ks-marquee-wrap ks-trow flex w-max whitespace-nowrap">
      <div className={`${reverse ? "ks-marquee-rev" : "ks-marquee"} ks-tgap flex`}>
        {list.map((t, i) => (
          <span key={i} className="flex items-center ks-tgap text-sm font-semibold text-white/50">
            {t}
            <span className="text-[#22FF88]"><Icon name="flame" size={14} /></span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Ticker() {
  return (
    <div className="ks-surface-soft relative overflow-hidden border-y border-white/10 bg-white/[0.02]" aria-hidden="true">
      <div className="ks-fade-l pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[#030303] to-transparent" />
      <div className="ks-fade-r pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[#030303] to-transparent" />
      <TickerRow items={TICKER_A} />
      <div className="h-px bg-white/5" />
      <TickerRow items={TICKER_B} reverse />
    </div>
  );
}

function Divider() {
  return <div className="ks-divider my-0 h-px w-full" aria-hidden="true" />;
}

function TrustBadge({ icon, title, description, index, shown }) {
  return (
    <div
      className={`group relative ks-badge flex items-center overflow-hidden border border-white/10 bg-white/[0.025] transition-all duration-700 hover:-translate-y-2 hover:border-[#22FF88]/40 hover:bg-[#22FF88]/[0.04] hover:shadow-[0_20px_50px_-20px_rgba(34,255,136,.25)] ${shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      style={{ transitionDelay: shown ? `${index * 110}ms` : "0ms" }}
    >
      <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#22FF88]/0 blur-2xl transition-all duration-700 group-hover:bg-[#22FF88]/20" />
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#22FF88]/20 bg-[#22FF88]/10 text-[#22FF88] transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(34,255,136,.3)]">
        <Icon name={icon} size={23} />
      </div>
      <div className="relative">
        <h4 className="text-base font-bold text-white">{title}</h4>
        <p className="mt-1.5 text-sm text-white/40">{description}</p>
      </div>
    </div>
  );
}

function Stat({ value, suffix, label, icon, run, index }) {
  const n = useCountUp(value, run);
  return (
    <div
      className={`ks-stat group relative overflow-hidden border border-white/10 bg-white/[0.02] transition-all duration-700 hover:-translate-y-1.5 hover:border-[#38BDF8]/40 ${run ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      style={{ transitionDelay: run ? `${index * 100}ms` : "0ms" }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
        <Icon name={icon} size={18} />
      </div>
      <p className="text-3xl font-bold tabular-nums text-white sm:text-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {n.toLocaleString("en-IN")}<span className="text-[#22FF88]">{suffix}</span>
      </p>
      <p className="text-sm text-white/40">{label}</p>
      <span className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-[#22FF88] to-[#38BDF8] transition-all duration-[1800ms] ease-out"
        style={{ width: run ? "100%" : "0%" }} />
    </div>
  );
}

function TimeBox({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="ks-surface relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/60 text-2xl font-bold tabular-nums text-white sm:h-[72px] sm:w-[72px] sm:text-3xl"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <span key={value} className="ks-tick block">{String(value).padStart(2, "0")}</span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
      </div>
      <span className="mt-2.5 text-[11px] text-white/35">{label}</span>
    </div>
  );
}

function LinkGroup({ title, links, shown, order, className = "" }) {
  return (
    <div className={`ks-group group/col border border-white/10 bg-white/[0.02] transition-all duration-500 hover:border-[#22FF88]/30 hover:bg-[#22FF88]/[0.025] ${className}`}>
      <h4 className="ks-hgap flex items-center text-base font-bold text-white">
        <span className="h-4 w-1 rounded-full bg-gradient-to-b from-[#22FF88] to-[#38BDF8] transition-all duration-500 group-hover/col:h-5" />
        {title}
      </h4>
      <ul className="ks-list">
        {links.map((link, i) => (
          <li key={link}
            className={`transition-all duration-700 ${shown ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
            style={{ transitionDelay: shown ? `${order * 120 + i * 70}ms` : "0ms" }}>
            <a href="#" className="group flex w-fit items-center gap-2 text-[15px] text-white/45 transition-all duration-300 hover:translate-x-1.5 hover:text-[#22FF88]">
              {link}
              <span className="h-px w-0 bg-[#22FF88] transition-all duration-300 group-hover:w-5" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Confetti({ run }) {
  if (!run) return null;
  const colors = ["#22FF88", "#38BDF8", "#A855F7", "#FFD60A", "#ffffff"];
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 56 }, (_, i) => (
        <span key={i} className="ks-confetti absolute top-0 block h-2.5 w-1.5 rounded-[1px]"
          style={{
            left: `${(i * 23) % 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${(i % 7) * 90}ms`,
            animationDuration: `${1.6 + (i % 5) * 0.25}s`,
            "--drift": `${((i % 9) - 4) * 22}px`,
          }} />
      ))}
    </div>
  );
}

const SOCIALS = [
  ["instagram", "Instagram", "hover:text-[#F472B6] hover:border-[#F472B6]/50 hover:bg-[#F472B6]/10 hover:shadow-[0_10px_30px_-10px_rgba(244,114,182,.5)]"],
  ["facebook", "Facebook", "hover:text-[#60A5FA] hover:border-[#60A5FA]/50 hover:bg-[#60A5FA]/10 hover:shadow-[0_10px_30px_-10px_rgba(96,165,250,.5)]"],
  ["x", "X", "hover:text-white hover:border-white/50 hover:bg-white/10 hover:shadow-[0_10px_30px_-10px_rgba(255,255,255,.3)]"],
  ["youtube", "YouTube", "hover:text-[#F87171] hover:border-[#F87171]/50 hover:bg-[#F87171]/10 hover:shadow-[0_10px_30px_-10px_rgba(248,113,113,.5)]"],
];

const ACTIVITY = [
  ["Aarav", "Delhi", "2 min ago"], ["Priya", "Mumbai", "just now"], ["Rohan", "Meerut", "5 min ago"],
  ["Sneha", "Pune", "1 min ago"], ["Kabir", "Jaipur", "3 min ago"], ["Ananya", "Lucknow", "just now"],
];
const PLACEHOLDERS = ["you@example.com", "name@gmail.com", "deals@yourmail.com"];

/* ============================================================
   FOOTER
============================================================ */
function Footer() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [copied, setCopied] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [progress, setProgress] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [magnet, setMagnet] = useState({ x: 0, y: 0 });

  const [badgesRef, badgesShown] = useReveal();
  const [newsRef, newsShown] = useReveal(0.1);
  const [statsRef, statsShown] = useReveal(0.25);
  const [linksRef, linksShown] = useReveal(0.1);
  const [wordRef, wordShown] = useReveal(0.2);
  const [h, m, s] = useCountdown();
  const activityIdx = useCycle(ACTIVITY.length, 4200);
  const placeholderIdx = useCycle(PLACEHOLDERS.length, 2600);
  const [who, city, when] = ACTIVITY[activityIdx];

  /* Fonts */
  useEffect(() => {
    if (document.getElementById("ksam-footer-font")) return;
    const font = document.createElement("link");
    font.id = "ksam-footer-font";
    font.rel = "stylesheet";
    font.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap";
    document.head.appendChild(font);
  }, []);

  /* Restore theme */
  useEffect(() => {
    try {
      if (localStorage.getItem("ksam-theme") === "light") setDarkMode(false);
    } catch (e) { /* storage unavailable */ }
  }, []);

  /* Scroll progress */
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
      setShowTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Ambient parallax for background glows */
  const parallax = (e) => {
    const s = e.currentTarget.style;
    s.setProperty("--px", `${(e.clientX / window.innerWidth - 0.5) * 70}px`);
    s.setProperty("--py", `${(e.clientY / window.innerHeight - 0.5) * 50}px`);
  };

  const magnetMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setMagnet({ x: (e.clientX - (r.left + r.width / 2)) * 0.1, y: (e.clientY - (r.top + r.height / 2)) * 0.2 });
  };

  const handleSubscribe = async (event) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) return setEmailError("Enter your email address.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return setEmailError("Enter a valid email address, like you@example.com.");
    setEmailError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1600)); // mock API request
    setLoading(false);
    setCoupon("KSAM10-" + Math.random().toString(36).slice(2, 6).toUpperCase());
    setSubscribed(true);
    setEmail("");
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3200);
  };

  const copyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(coupon);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) { /* clipboard blocked */ }
  };

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    try { localStorage.setItem("ksam-theme", next ? "dark" : "light"); } catch (e) { /* ignore */ }
  };

  const showDomains = email.length > 0 && !email.includes("@");

  return (
    <footer
      id="ksam-footer"
      onMouseMove={parallax}
      className={`ksam-footer ${darkMode ? "" : "ksam-light"} relative overflow-hidden border-t border-white/10 bg-[#030303] text-white`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Ambient glow with mouse parallax */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="ks-par absolute -left-32 top-40" style={{ "--k": 1 }}>
          <div className="ks-float h-[420px] w-[420px] rounded-full bg-[#22FF88]/[0.06] blur-[130px]" />
        </div>
        <div className="ks-par absolute -right-32 bottom-20" style={{ "--k": -1.4 }}>
          <div className="ks-float h-[480px] w-[480px] rounded-full bg-[#38BDF8]/[0.06] blur-[140px]" style={{ animationDelay: "-5s" }} />
        </div>
        <div className="ks-par absolute left-1/2 top-1/3" style={{ "--k": 0.6 }}>
          <div className="ks-float h-[320px] w-[320px] rounded-full bg-[#A855F7]/[0.05] blur-[120px]" style={{ animationDelay: "-9s" }} />
        </div>
      </div>

      <Ticker />

      <div className="relative z-10 ks-wrap">
        {/* TRUST BADGES */}
        <div ref={badgesRef} className="ks-badges">
          <TrustBadge index={0} shown={badgesShown} icon="truck" title="Free Shipping" description="On qualifying orders" />
          <TrustBadge index={1} shown={badgesShown} icon="return" title="Easy Returns" description="Simple & hassle-free" />
          <TrustBadge index={2} shown={badgesShown} icon="shield" title="Secure Payments" description="Protected checkout" />
          <TrustBadge index={3} shown={badgesShown} icon="support" title="24/7 Support" description="We're here to help" />
        </div>

        {/* NEWSLETTER */}
        <section
          ref={newsRef}
          onMouseMove={trackPointer}
          onMouseLeave={resetPointer}
          className={`ks-news relative overflow-hidden transition-all duration-1000 ${newsShown ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
        >
          <div className="ks-spin-border pointer-events-none absolute inset-[-100%]" />

          <div className="ks-surface ks-news-in relative overflow-hidden bg-[#050505]">
            {/* Cursor spotlight */}
            <div className="pointer-events-none absolute inset-0 opacity-80"
              style={{ background: "radial-gradient(460px circle at var(--mx,50%) var(--my,50%), rgba(34,255,136,.14), transparent 60%)" }} />

            {/* Twinkling particles */}
            {Array.from({ length: 22 }, (_, i) => (
              <span key={i} className="ks-twinkle pointer-events-none absolute h-1 w-1 rounded-full bg-[#22FF88]/60"
                style={{ left: `${5 + (i * 17) % 90}%`, top: `${8 + (i * 31) % 84}%`, animationDelay: `${i * 260}ms` }} />
            ))}

            <Confetti run={confetti} />

            <div className="ks-news-grid relative z-10">
              {/* LEFT */}
              <div className="ks-stack">
                <div className="ks-tag inline-flex items-center rounded-full border border-[#FFD60A]/30 bg-[#FFD60A]/10 text-xs font-bold tracking-wide text-[#FFD60A]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FFD60A]" />
                  Member perk · Today only
                </div>

                <h2 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[58px]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Get <span className="ks-gradient-text">10% off</span>
                  <br />your first order.
                </h2>

                <p className="max-w-md text-base leading-8 text-white/50">
                  Join KSAM Deal for new offers and price drops before everyone else. Your code arrives the moment you join.
                </p>

                {/* Countdown */}
                <div className="ks-countdown">
                  <p className="text-sm font-semibold text-white/40">Today's welcome offer ends in</p>
                  <div className="ks-time-gap flex items-start">
                    <TimeBox value={h} label="hours" />
                    <span className="pt-4 text-2xl text-white/25 sm:pt-5">:</span>
                    <TimeBox value={m} label="min" />
                    <span className="pt-4 text-2xl text-white/25 sm:pt-5">:</span>
                    <TimeBox value={s} label="sec" />
                  </div>
                </div>

                {/* Live activity */}
                <div className="h-12" aria-live="polite">
                  <div key={activityIdx} className="ks-slide-in ks-surface-soft inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] py-2 pl-2 pr-5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#22FF88] to-[#38BDF8] text-xs font-black text-black">
                      {who[0]}
                    </span>
                    <span className="text-xs text-white/55">
                      <b className="font-semibold text-white">{who}</b> from {city} claimed 10% off · {when}
                    </span>
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22FF88]/70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22FF88]" />
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT — 3D tilt card */}
              <div className="relative [perspective:1200px]">
                <div className="ks-glow absolute bg-gradient-to-r from-[#22FF88]/10 via-[#38BDF8]/5 to-[#A855F7]/10 opacity-80 blur-2xl" />
                <div className="ks-surface-soft ks-tilt ks-card relative border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-xl">
                  <div className="ks-card-head flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white/35">Member discount</p>
                      <p className="mt-1.5 text-base font-semibold text-white">Claim your welcome offer</p>
                    </div>
                    <div className="ks-pulse-ring flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22FF88] to-[#38BDF8] text-base font-black text-black">
                      10%
                    </div>
                  </div>

                  {!subscribed ? (
                    <form onSubmit={handleSubscribe} noValidate className="ks-form">
                      <label htmlFor="newsletter-email" className="block text-sm font-semibold text-white/55">Email address</label>
                      <div className={`ks-input ks-field flex items-center border bg-black/50 transition-all duration-300 ${emailError ? "border-red-500/60" : "border-white/10 focus-within:border-[#22FF88]/60 focus-within:shadow-[0_0_40px_rgba(34,255,136,.12)]"}`}>
                        <span className="text-white/40"><Icon name="mail" size={20} /></span>
                        <input
                          id="newsletter-email" type="email" value={email} autoComplete="email"
                          onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                          placeholder={PLACEHOLDERS[placeholderIdx]}
                          aria-invalid={!!emailError}
                          aria-describedby={emailError ? "email-error" : undefined}
                          className="min-w-0 flex-1 bg-transparent ks-inp text-sm text-white outline-none placeholder:text-white/25"
                        />
                      </div>

                      {showDomains && (
                        <div className="ks-slide-in ks-chip-gap flex flex-wrap">
                          {["gmail.com", "outlook.com", "yahoo.com"].map((d) => (
                            <button key={d} type="button" onClick={() => setEmail(`${email}@${d}`)}
                              className="ks-minichip rounded-full border border-white/10 text-xs text-white/50 transition hover:-translate-y-0.5 hover:border-[#22FF88]/40 hover:text-[#22FF88]">
                              @{d}
                            </button>
                          ))}
                        </div>
                      )}

                      {emailError && <p id="email-error" role="alert" className="ks-slide-in text-xs text-red-400">{emailError}</p>}

                      <button type="submit" disabled={loading}
                        onMouseMove={magnetMove}
                        onMouseLeave={() => setMagnet({ x: 0, y: 0 })}
                        style={{ transform: `translate(${magnet.x}px, ${magnet.y}px)` }}
                        className="group/button ks-submit relative flex w-full items-center justify-center overflow-hidden bg-gradient-to-r from-[#22FF88] via-[#35e6a0] to-[#38BDF8] text-sm font-black text-black transition-[box-shadow,opacity] duration-300 hover:shadow-[0_0_45px_rgba(34,255,136,.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22FF88] active:brightness-95 disabled:cursor-not-allowed disabled:opacity-70">
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover/button:translate-x-full" />
                        {loading ? (
                          <span className="relative z-10 flex items-center gap-2.5">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                            Joining…
                          </span>
                        ) : (
                          <>
                            <span className="relative z-10">Get my 10% code</span>
                            <span className="relative z-10 transition-transform duration-300 group-hover/button:translate-x-1.5">
                              <Icon name="arrow" size={17} strokeWidth={2.5} />
                            </span>
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-white/30">No spam. Unsubscribe anytime.</p>
                    </form>
                  ) : (
                    <div className="ks-success flex flex-col items-center justify-center text-center" role="status">
                      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#22FF88]/10">
                        <div className="absolute inset-0 animate-ping rounded-full bg-[#22FF88]/10" />
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#22FF88] text-black shadow-[0_0_40px_rgba(34,255,136,.35)]">
                          <Icon name="check" size={30} strokeWidth={3} />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>You're in! 🎉</h3>
                      <p className="text-sm text-white/45">Use this code at checkout:</p>

                      <button type="button" onClick={copyCoupon}
                        className="ks-coupon group flex items-center border border-dashed border-[#22FF88]/50 bg-[#22FF88]/[0.06] transition hover:scale-[1.03] hover:bg-[#22FF88]/10">
                        <span className="text-xl font-bold tracking-widest text-[#22FF88]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{coupon}</span>
                        <span className="flex items-center gap-1.5 text-xs text-white/50 group-hover:text-white">
                          <Icon name={copied ? "check" : "copy"} size={14} />
                          {copied ? "Copied" : "Copy"}
                        </span>
                      </button>

                      <button type="button" onClick={() => setSubscribed(false)}
                        className="text-xs font-bold text-white/50 underline-offset-4 hover:text-[#22FF88] hover:underline">
                        Use another email
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div ref={statsRef} className="ks-stats">
          <Stat index={0} icon="check" run={statsShown} value={250000} suffix="+" label="Happy shoppers" />
          <Stat index={1} icon="tag" run={statsShown} value={12000} suffix="+" label="Deals tracked daily" />
          <Stat index={2} icon="shield" run={statsShown} value={4800} suffix="+" label="Verified brands" />
          <Stat index={3} icon="truck" run={statsShown} value={98} suffix="%" label="Orders delivered on time" />
        </div>

        <div className="ks-gap"><Divider /></div>

        {/* MAIN LINKS */}
        <div ref={linksRef} className="ks-links">
          <div className={`ks-brand transition-all duration-1000 ${linksShown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <div className="flex items-center gap-4">
              <span className="ks-logo flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22FF88] text-xl font-black text-black shadow-[0_0_30px_rgba(34,255,136,.25)]">K</span>
              <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                KSAM<span className="text-[#22FF88]">DEAL</span>
              </span>
            </div>
            <p className="max-w-sm text-[15px] leading-8 text-white/45">
              Discover interesting deals, compare offers, and find products worth buying, all in one place.
            </p>
            <div className="ks-soc flex">
              {SOCIALS.map(([icon, label, hover]) => (
                <a key={label} href="#" aria-label={label}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-white/45 transition-all duration-300 hover:-translate-y-2 hover:rotate-6 ${hover}`}>
                  <Icon name={icon} size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="ks-groups">
            <LinkGroup order={0} shown={linksShown} title="Shop"
              links={["Categories", "New Arrivals", "Best Sellers", "Sale"]} />
            <LinkGroup order={1} shown={linksShown} title="Customer Care"
              links={["Track Order", "Shipping", "Returns", "FAQs", "Contact"]} />
            <LinkGroup order={2} shown={linksShown} title="Company" className="ks-span2"
              links={["About", "Careers", "Blog", "Sustainability"]} />
          </div>
        </div>

        <Divider />

        {/* PAYMENTS + APPS */}
        <div className="ks-pay">
          <div>
            <p className="text-xs font-semibold text-white/30">Secure payments</p>
            <div className="ks-chips flex flex-wrap">
              {["VISA", "Mastercard", "PayPal", "UPI", "Apple Pay", "G Pay"].map((p) => (
                <div key={p} className="ks-chip flex items-center justify-center border border-white/10 bg-white/[0.025] text-[11px] font-black text-white/50 transition-all duration-300 hover:-translate-y-1 hover:border-[#22FF88]/40 hover:text-white">
                  {p}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/30">Get the app</p>
            <div className="ks-chips flex">
              <a href="#" className="ks-chip ks-chip-btn border border-white/10 bg-white/[0.025] text-xs font-bold text-white/70 transition-all duration-300 hover:-translate-y-1 hover:border-[#22FF88]/40 hover:text-white">App Store</a>
              <a href="#" className="ks-chip ks-chip-btn border border-white/10 bg-white/[0.025] text-xs font-bold text-white/70 transition-all duration-300 hover:-translate-y-1 hover:border-[#38BDF8]/40 hover:text-white">▶ Google Play</a>
            </div>
          </div>
        </div>

        <Divider />

        {/* BOTTOM BAR */}
        <div className="ks-bottom text-xs text-white/35">
          <p>© {new Date().getFullYear()} KSAM Deal. All rights reserved.</p>
          <div className="ks-bottom-links">
            <a href="#" className="transition hover:text-[#22FF88]">Privacy Policy</a>
            <a href="#" className="transition hover:text-[#22FF88]">Terms</a>
            <a href="#" className="transition hover:text-[#22FF88]">Cookie Settings</a>
            <select defaultValue="INR" aria-label="Currency" className="cursor-pointer bg-transparent text-white/45 outline-none">
              <option value="INR" className="bg-black text-white">₹ INR</option>
              <option value="USD" className="bg-black text-white">$ USD</option>
            </select>
            <button type="button" onClick={toggleTheme}
              className="ks-pill flex items-center rounded-full border border-white/10 transition hover:border-[#22FF88]/40 hover:text-[#22FF88]">
              <Icon name={darkMode ? "sun" : "moon"} size={14} />
              {darkMode ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </div>

      {/* GIANT INTERACTIVE WORDMARK */}
      <div ref={wordRef} onMouseMove={trackPointer} onMouseLeave={resetPointer}
        className={`relative mt-4 select-none overflow-hidden pb-4 text-center transition-all duration-[1400ms] ease-out ${wordShown ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}
        aria-hidden="true">
        <div className="relative mx-auto w-fit">
          <span className="ks-outline block whitespace-nowrap text-[22vw] font-bold leading-[0.85] tracking-tighter lg:text-[17rem]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            KSAMDEAL
          </span>
          {/* Cursor-following fill */}
          <span className="ks-word-fill pointer-events-none absolute inset-0 block whitespace-nowrap text-[22vw] font-bold leading-[0.85] tracking-tighter lg:text-[17rem]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            KSAMDEAL
          </span>
          {/* Idle shimmer sweep */}
          <span className="ks-word-sweep pointer-events-none absolute inset-0 block whitespace-nowrap text-[22vw] font-bold leading-[0.85] tracking-tighter lg:text-[17rem]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            KSAMDEAL
          </span>
        </div>
      </div>

      {/* BACK TO TOP */}
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top"
        className={`ks-surface fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#090909]/90 text-[#22FF88] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(34,255,136,.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22FF88] ${showTop ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-5 scale-75 opacity-0"}`}>
        <svg className="pointer-events-none absolute inset-[-3px] h-[62px] w-[62px] -rotate-90" viewBox="0 0 62 62">
          <circle cx="31" cy="31" r="28" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2" />
          <circle cx="31" cy="31" r="28" fill="none" stroke="#22FF88" strokeWidth="2" strokeLinecap="round"
            strokeDasharray="175.9" strokeDashoffset={175.9 - (175.9 * progress) / 100} />
        </svg>
        <Icon name="arrowUp" size={19} strokeWidth={2.5} />
      </button>

      <style>{`
        @keyframes ksMarquee { to { transform: translateX(-50%); } }
        @keyframes ksMarqueeRev { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        @keyframes ksFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(40px,-30px,0) scale(1.08); } }
        @keyframes ksSpin { to { transform: rotate(360deg); } }
        @keyframes ksFall {
          0% { transform: translate3d(0,-10px,0) rotate(0); opacity: 1; }
          100% { transform: translate3d(var(--drift),560px,0) rotate(540deg); opacity: 0; }
        }
        @keyframes ksPulseRing {
          0% { box-shadow: 0 0 0 0 rgba(34,255,136,.45); }
          100% { box-shadow: 0 0 0 18px rgba(34,255,136,0); }
        }
        @keyframes ksShift { to { background-position: 200% 0; } }
        @keyframes ksTwinkle { 0%,100% { opacity: .1; transform: scale(.6); } 50% { opacity: 1; transform: scale(1.6); } }
        @keyframes ksSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ksTick { from { opacity: 0; transform: translateY(-40%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ksSweep { from { background-position: 200% 0; } to { background-position: -100% 0; } }
        @keyframes ksDivider { to { background-position: 200% 0; } }

        .ks-marquee, .ks-marquee-rev { width: max-content; }
        .ks-marquee { animation: ksMarquee 45s linear infinite; }
        .ks-marquee-rev { animation: ksMarqueeRev 52s linear infinite; }
        .ks-marquee-wrap:hover .ks-marquee, .ks-marquee-wrap:hover .ks-marquee-rev { animation-play-state: paused; }
        .ks-float { animation: ksFloat 16s ease-in-out infinite; }
        .ks-par { transform: translate3d(calc(var(--px, 0px) * var(--k, 1)), calc(var(--py, 0px) * var(--k, 1)), 0); transition: transform .6s ease-out; }
        .ks-confetti { animation: ksFall 2s ease-out forwards; }
        .ks-pulse-ring { animation: ksPulseRing 2.2s ease-out infinite; }
        .ks-twinkle { animation: ksTwinkle 3.4s ease-in-out infinite; }
        .ks-slide-in { animation: ksSlideIn .5s ease-out both; }
        .ks-tick { animation: ksTick .35s ease-out both; }
        .ks-tilt { transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); transition: transform .25s ease-out; transform-style: preserve-3d; }
        .ks-logo { transition: transform .5s ease; }
        .ks-logo:hover { transform: rotate(-12deg) scale(1.1); }
        .ks-spin-border {
          background: conic-gradient(from 0deg, #22FF88, #38BDF8, #A855F7, #FFD60A, #22FF88);
          animation: ksSpin 8s linear infinite; opacity: .55;
        }
        .ks-gradient-text {
          background: linear-gradient(90deg, #22FF88, #38BDF8, #A855F7, #22FF88);
          background-size: 200% 100%; -webkit-background-clip: text; background-clip: text;
          color: transparent; animation: ksShift 6s linear infinite;
        }
        .ks-divider {
          background: linear-gradient(90deg, transparent, rgba(34,255,136,.5), rgba(56,189,248,.5), rgba(168,85,247,.5), transparent);
          background-size: 200% 100%; animation: ksDivider 8s linear infinite; opacity: .5;
        }
        .ks-outline { color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,.1); }
        .ks-word-fill {
          color: transparent;
          background-image: radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), #22FF88, #38BDF8 45%, transparent 70%);
          -webkit-background-clip: text; background-clip: text;
        }
        .ks-word-sweep {
          color: transparent;
          background-image: linear-gradient(110deg, transparent 40%, rgba(255,255,255,.22) 50%, transparent 60%);
          background-size: 250% 100%; -webkit-background-clip: text; background-clip: text;
          animation: ksSweep 7s ease-in-out infinite;
        }


        /* ---- Layout & spacing (scoped + specific, so global CSS resets or missing utilities can't collapse it) ---- */
        .ksam-footer .ks-wrap { max-width: 80rem; margin: 0 auto; padding: 5rem 1.5rem; }
        .ksam-footer .ks-trow { padding: .875rem 0; gap: 3.5rem; }
        .ksam-footer .ks-tgap { gap: 3.5rem; }
        .ksam-footer .ks-badges { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        .ksam-footer .ks-badge { gap: 1.25rem; padding: 1.75rem 1.5rem; border-radius: 1.5rem; }
        .ksam-footer .ks-news { margin-top: 6rem; padding: 1.5px; border-radius: 36px; }
        .ksam-footer .ks-news-in { border-radius: 35px; }
        .ksam-footer .ks-news-grid { display: grid; grid-template-columns: 1fr; gap: 4rem; padding: 3.5rem 2rem; align-items: center; }
        .ksam-footer .ks-stack { display: flex; flex-direction: column; align-items: flex-start; gap: 2rem; }
        .ksam-footer .ks-tag { padding: .625rem 1.25rem; gap: .625rem; }
        .ksam-footer .ks-countdown { display: flex; flex-direction: column; gap: 1rem; }
        .ksam-footer .ks-time-gap { gap: .75rem; }
        .ksam-footer .ks-card { border-radius: 28px; padding: 1.75rem; }
        .ksam-footer .ks-card-head { margin-bottom: 2.25rem; gap: 1rem; }
        .ksam-footer .ks-glow { inset: -1.5rem; border-radius: 36px; }
        .ksam-footer .ks-form { display: flex; flex-direction: column; gap: .875rem; }
        .ksam-footer .ks-form > p { margin-top: .5rem; }
        .ksam-footer .ks-field { padding: 0 1.25rem; gap: .75rem; border-radius: 1rem; }
        .ksam-footer .ks-inp { padding: 1.125rem 0; }
        .ksam-footer .ks-chip-gap { gap: .5rem; }
        .ksam-footer .ks-minichip { padding: .375rem .875rem; }
        .ksam-footer .ks-submit { padding: 1.125rem 1.5rem; gap: .75rem; border-radius: 1rem; margin-top: .5rem; }
        .ksam-footer .ks-success { min-height: 290px; gap: 1rem; }
        .ksam-footer .ks-coupon { gap: 1rem; padding: 1rem 1.5rem; border-radius: 1rem; margin: .5rem 0; }
        .ksam-footer .ks-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; margin-top: 6rem; }
        .ksam-footer .ks-stat { display: flex; flex-direction: column; gap: .5rem; padding: 1.75rem; border-radius: 1.5rem; }
        .ksam-footer .ks-stat > :first-child { margin-bottom: .75rem; }
        .ksam-footer .ks-gap { margin-top: 6rem; }
        .ksam-footer .ks-links { display: grid; grid-template-columns: 1fr; gap: 4rem; padding: 5rem 0; }
        .ksam-footer .ks-brand { display: flex; flex-direction: column; gap: 1.75rem; }
        .ksam-footer .ks-soc { gap: .75rem; }
        .ksam-footer .ks-groups { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .ksam-footer .ks-span2 { grid-column: span 2; }
        .ksam-footer .ks-group { display: flex; flex-direction: column; gap: 1.5rem; padding: 1.5rem; border-radius: 1.5rem; }
        .ksam-footer .ks-hgap { gap: .75rem; }
        .ksam-footer .ks-list { display: flex; flex-direction: column; gap: .9rem; list-style: none; margin: 0; padding: 0; }
        .ksam-footer .ks-pay { display: flex; flex-direction: column; gap: 2.5rem; padding: 3.5rem 0; }
        .ksam-footer .ks-chips { margin-top: 1.25rem; gap: .75rem; }
        .ksam-footer .ks-chip { height: 2.75rem; padding: 0 1rem; border-radius: .75rem; }
        .ksam-footer .ks-chip-btn { height: auto; padding: .75rem 1.25rem; }
        .ksam-footer .ks-bottom { display: flex; flex-direction: column; gap: 1.5rem; padding-top: 2.5rem; }
        .ksam-footer .ks-bottom-links { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem 1.75rem; }
        .ksam-footer .ks-pill { padding: .5rem 1rem; gap: .5rem; }

        @media (min-width: 640px) {
          .ksam-footer .ks-wrap { padding: 6rem 2.5rem; }
          .ksam-footer .ks-badges { grid-template-columns: repeat(2, 1fr); }
          .ksam-footer .ks-news { margin-top: 7rem; }
          .ksam-footer .ks-news-grid { padding: 5rem 3.5rem; }
          .ksam-footer .ks-time-gap { gap: 1rem; }
          .ksam-footer .ks-card { padding: 2.5rem; }
          .ksam-footer .ks-stats { gap: 1.5rem; margin-top: 7rem; }
          .ksam-footer .ks-gap { margin-top: 7rem; }
          .ksam-footer .ks-groups { grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
          .ksam-footer .ks-span2 { grid-column: span 1; }
          .ksam-footer .ks-group { padding: 1.75rem; }
        }
        @media (min-width: 768px) {
          .ksam-footer .ks-bottom { flex-direction: row; align-items: center; justify-content: space-between; }
        }
        @media (min-width: 1024px) {
          .ksam-footer .ks-wrap { padding: 6rem 3rem; }
          .ksam-footer .ks-badges { grid-template-columns: repeat(4, 1fr); }
          .ksam-footer .ks-news-grid { grid-template-columns: 1fr 1fr; gap: 6rem; padding: 6rem 5rem; }
          .ksam-footer .ks-stats { grid-template-columns: repeat(4, 1fr); }
          .ksam-footer .ks-links { grid-template-columns: repeat(5, 1fr); gap: 3rem; }
          .ksam-footer .ks-brand { grid-column: span 2; }
          .ksam-footer .ks-groups { grid-column: span 3; gap: 2.5rem; }
          .ksam-footer .ks-group, .ksam-footer .ks-group:hover { padding: 0; border-color: transparent !important; background: transparent !important; }
          .ksam-footer .ks-pay { flex-direction: row; align-items: center; justify-content: space-between; }
        }

        /* Light theme overrides */
        .ksam-light { background: #f5f7f6; color: #0b0b0b; border-color: rgba(0,0,0,.1); }
        .ksam-light .text-white { color: #0b0b0b; }
        .ksam-light [class*="text-white/"] { color: rgba(11,11,11,.6); }
        .ksam-light [class*="border-white/"] { border-color: rgba(0,0,0,.12); }
        .ksam-light [class*="bg-white/"] { background-color: rgba(0,0,0,.04); }
        .ksam-light .ks-surface { background-color: #ffffff; }
        .ksam-light .ks-surface-soft { background-color: rgba(255,255,255,.75); }
        .ksam-light .ks-input { background-color: #fff; }
        .ksam-light .ks-fade-l, .ksam-light .ks-fade-r { --tw-gradient-from: #f5f7f6; }
        .ksam-light .ks-outline { -webkit-text-stroke: 1px rgba(0,0,0,.1); }
        .ksam-light input::placeholder { color: rgba(0,0,0,.35); }
        .ksam-light .text-\\[\\#22FF88\\] { color: #0a9d52; }

        @media (prefers-reduced-motion: reduce) {
          .ksam-footer *, .ksam-footer *::before, .ksam-footer *::after {
            animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important; scroll-behavior: auto !important;
          }
          .ks-marquee, .ks-marquee-rev { animation: none; }
        }
      `}</style>
    </footer>
  );
}

export default Footer;
