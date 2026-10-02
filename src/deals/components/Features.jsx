import { useEffect, useRef, useState } from "react";
import {
  Search,
  GitCompare,
  BadgeDollarSign,
  Bell,
  Globe2,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from "lucide-react";

/* ============================================================
   DATA
============================================================ */
const features = [
  {
    icon: Search,
    title: "One Search",
    text: "Search products without opening multiple shopping apps.",
    accent: "#22FF88",
    visual: "search",
  },
  {
    icon: GitCompare,
    title: "Compare Prices",
    text: "See prices and discounts from multiple stores.",
    accent: "#38BDF8",
    visual: "compare",
  },
  {
    icon: BadgeDollarSign,
    title: "Find Savings",
    text: "Discover discounted products in one place.",
    accent: "#FFD60A",
    visual: "savings",
  },
  {
    icon: Bell,
    title: "Deal Alerts",
    text: "Get notified when interesting deals appear.",
    accent: "#F472B6",
    visual: "alerts",
  },
  {
    icon: Globe2,
    title: "Multiple Stores",
    text: "Explore products across different marketplaces.",
    accent: "#A855F7",
    visual: "stores",
  },
  {
    icon: Sparkles,
    title: "Smart Discovery",
    text: "Future AI features will personalize deal discovery.",
    accent: "#FB923C",
    visual: "smart",
  },
];

const SEARCH_TERMS = ["wireless earbuds", "running shoes", "air fryer", "smart watch"];

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

function useTypewriter(words, run) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!run) return;
    let w = 0, c = 0, deleting = false, t;
    const tick = () => {
      const word = words[w];
      if (!deleting) {
        c++; setText(word.slice(0, c));
        if (c === word.length) { deleting = true; t = setTimeout(tick, 1400); return; }
        t = setTimeout(tick, 85);
      } else {
        c--; setText(word.slice(0, c));
        if (c === 0) { deleting = false; w = (w + 1) % words.length; }
        t = setTimeout(tick, 40);
      }
    };
    tick();
    return () => clearTimeout(t);
  }, [run, words]);
  return text;
}

/* Reveal styles are inline so they never depend on utility classes */
const revealStyle = (shown, delay = 0, distance = 56) => ({
  opacity: shown ? 1 : 0,
  transform: shown ? "translateY(0)" : `translateY(${distance}px)`,
  transition: "opacity .9s ease, transform .9s cubic-bezier(.2,.8,.2,1)",
  transitionDelay: shown ? `${delay}ms` : "0ms",
});

/* ============================================================
   MINI VISUALS (one per feature)
============================================================ */
function SearchVisual({ shown }) {
  const text = useTypewriter(SEARCH_TERMS, shown);
  return (
    <div className="ft-vis-search">
      <Search size={16} className="text-white/40" />
      <span className="text-sm text-white/70">{text}</span>
      <span className="ft-caret" />
    </div>
  );
}

function CompareVisual({ shown }) {
  const rows = [
    ["Store A", "₹2,999", 86, true],
    ["Store B", "₹3,299", 94, false],
    ["Store C", "₹3,499", 100, false],
  ];
  return (
    <div className="ft-vis-compare">
      {rows.map(([name, price, w, best], i) => (
        <div key={name} className="ft-bar-row">
          <span className="ft-bar-label">{name}</span>
          <div className="ft-bar-track">
            <span className="ft-bar-fill"
              style={{
                width: shown ? `${w}%` : "0%",
                transitionDelay: `${500 + i * 160}ms`,
                background: best ? "linear-gradient(90deg,#38BDF8,#22FF88)" : "rgba(255,255,255,.14)",
              }} />
          </div>
          <span className={`ft-bar-price ${best ? "text-[#22FF88]" : "text-white/45"}`}>{price}</span>
        </div>
      ))}
    </div>
  );
}

function SavingsVisual() {
  return (
    <div className="ft-vis-savings">
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-black text-white">₹2,999</span>
        <span className="text-sm text-white/35 line-through">₹4,999</span>
      </div>
      <span className="ft-off">
        <TrendingDown size={14} />
        40% off
      </span>
    </div>
  );
}

function AlertsVisual() {
  return (
    <div className="ft-vis-alerts">
      <span className="ft-bell"><Bell size={18} /></span>
      <span className="ft-toast">Price dropped by ₹500</span>
    </div>
  );
}

function StoresVisual() {
  return (
    <div className="ft-vis-stores">
      {["A", "B", "C", "D"].map((l, i) => (
        <span key={l} className="ft-avatar"
          style={{ background: ["#22FF88", "#38BDF8", "#A855F7", "#FFD60A"][i], animationDelay: `${i * 220}ms` }}>
          {l}
        </span>
      ))}
      <span className="ft-avatar ft-avatar-more">+8</span>
    </div>
  );
}

function SmartVisual() {
  return (
    <div className="ft-vis-smart">
      {["Sneakers", "Gadgets", "Home decor"].map((c, i) => (
        <span key={c} className="ft-chip-smart" style={{ animationDelay: `${i * 400}ms` }}>
          <Sparkles size={12} />
          {c}
        </span>
      ))}
    </div>
  );
}

function Visual({ type, shown }) {
  switch (type) {
    case "search": return <SearchVisual shown={shown} />;
    case "compare": return <CompareVisual shown={shown} />;
    case "savings": return <SavingsVisual />;
    case "alerts": return <AlertsVisual />;
    case "stores": return <StoresVisual />;
    default: return <SmartVisual />;
  }
}

/* ============================================================
   CARD
============================================================ */
function FeatureCard({ feature, index, shown }) {
  const { icon: Icon, title, text, accent, visual } = feature;

  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    const s = e.currentTarget.style;
    s.setProperty("--mx", `${x}%`);
    s.setProperty("--my", `${y}%`);
    s.setProperty("--rx", `${((50 - y) / 50) * 5}deg`);
    s.setProperty("--ry", `${((x - 50) / 50) * 6}deg`);
  };
  const leave = (e) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <div style={revealStyle(shown, (index % 3) * 140 + Math.floor(index / 3) * 120)}>
      <div
        className="ft-card group"
        onMouseMove={move}
        onMouseLeave={leave}
        style={{ "--accent": accent, "--soft": `${accent}1f`, "--line": `${accent}45` }}
      >
        <div className="ft-ring"><div className="ft-spin" /></div>

        <article className="ft-article">
          <div className="ft-spot" />

          <div className="ft-icon">
            <Icon size={24} strokeWidth={1.8} />
          </div>

          <div className="ft-body">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="ft-text text-white/45">{text}</p>
          </div>

          <div className="ft-vis">
            <Visual type={visual} shown={shown} />
          </div>
        </article>
      </div>
    </div>
  );
}

/* ============================================================
   FEATURES
============================================================ */
function Features() {
  const [headRef, headShown] = useReveal(0.3);
  const [gridRef, gridShown] = useReveal(0.1);
  const [ctaRef, ctaShown] = useReveal(0.4);

  const parallax = (e) => {
    const s = e.currentTarget.style;
    s.setProperty("--px", `${(e.clientX / window.innerWidth - 0.5) * 60}px`);
    s.setProperty("--py", `${(e.clientY / window.innerHeight - 0.5) * 40}px`);
  };

  return (
    <section id="features" onMouseMove={parallax} className="ft-section relative overflow-hidden bg-[#050505]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="ft-dots absolute inset-0" />
        <div className="ft-par absolute" style={{ "--k": 1, left: "-4rem", top: "8rem" }}>
          <div className="ft-float ft-blur h-96 w-96 rounded-full bg-[#22FF88]/[0.06]" />
        </div>
        <div className="ft-par absolute" style={{ "--k": -1.3, right: "-3rem", bottom: "6rem" }}>
          <div className="ft-float ft-blur h-96 w-96 rounded-full bg-[#38BDF8]/[0.06]" style={{ animationDelay: "-7s" }} />
        </div>
      </div>

      <div className="ft-wrap relative z-10">
        {/* Header */}
        <div ref={headRef} className="ft-head" style={revealStyle(headShown, 0, 40)}>
          <div className="ft-head-left">
            <p className="ft-eyebrow text-sm font-bold uppercase text-[#22FF88]">
              <span className="ft-eyebrow-line" />
              WHY KSAM DEAL
            </p>
            <h2 className="text-4xl font-black text-white sm:text-5xl lg:text-6xl" style={{ lineHeight: 1.1 }}>
              Shopping discovery,
              <span className="ft-gradient-text"> reimagined.</span>
            </h2>
          </div>

          <div className="ft-head-right">
            <p className="text-base text-white/45" style={{ lineHeight: 1.8 }}>
              Search once, compare everywhere and get told the moment a price drops. Less tab-hopping, more saving.
            </p>
            <a href="#pricing" className="ft-link group/link">
              See membership plans
              <ArrowRight size={16} className="transition-transform duration-300 group-hover/link:translate-x-1.5" />
            </a>
          </div>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="ft-grid">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} shown={gridShown} />
          ))}
        </div>

        {/* CTA strip */}
        <div ref={ctaRef} className="ft-cta" style={revealStyle(ctaShown, 0, 36)}>
          <div className="ft-cta-text">
            <p className="text-xl font-bold text-white sm:text-2xl">Ready to find your next deal?</p>
            <p className="text-sm text-white/45">It takes one search. No account needed to start.</p>
          </div>
          <a href="#deals" className="ft-cta-btn group/cta">
            <span className="ft-shine" />
            <span className="relative">Explore deals</span>
            <ArrowRight size={17} className="relative transition-transform duration-300 group-hover/cta:translate-x-1.5" />
          </a>
        </div>
      </div>

      <style>{`
        @keyframes ftFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(40px,-30px,0) scale(1.08); } }
        @keyframes ftSpin { to { transform: rotate(360deg); } }
        @keyframes ftShift { to { background-position: 200% 0; } }
        @keyframes ftBlink { 50% { opacity: 0; } }
        @keyframes ftRing { 0%,60%,100% { transform: rotate(0); } 10% { transform: rotate(16deg); } 20% { transform: rotate(-14deg); } 30% { transform: rotate(10deg); } 40% { transform: rotate(-8deg); } 50% { transform: rotate(4deg); } }
        @keyframes ftToast { 0%,15% { opacity: 0; transform: translateX(-10px); } 25%,80% { opacity: 1; transform: translateX(0); } 95%,100% { opacity: 0; transform: translateX(6px); } }
        @keyframes ftPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,214,10,.4); } 50% { box-shadow: 0 0 0 9px rgba(255,214,10,0); } }
        @keyframes ftPop { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes ftGlow { 0%,100% { opacity: .55; } 50% { opacity: 1; } }

        .ft-float { animation: ftFloat 18s ease-in-out infinite; }
        .ft-blur { filter: blur(120px); }
        .ft-par { transform: translate3d(calc(var(--px,0px) * var(--k,1)), calc(var(--py,0px) * var(--k,1)), 0); transition: transform .6s ease-out; }
        .ft-dots {
          background-image: radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 28px 28px;
          -webkit-mask-image: radial-gradient(ellipse at 50% 40%, #000 25%, transparent 75%);
          mask-image: radial-gradient(ellipse at 50% 40%, #000 25%, transparent 75%);
        }
        .ft-gradient-text {
          background: linear-gradient(90deg, #38BDF8, #22FF88, #A855F7, #38BDF8);
          background-size: 200% 100%; -webkit-background-clip: text; background-clip: text;
          color: transparent; animation: ftShift 6s linear infinite;
        }

        /* ---- Layout & spacing (scoped + specific so global resets can't collapse it) ---- */
        .ft-section { padding: 7rem 0; }
        .ft-section .ft-wrap { max-width: 80rem; margin: 0 auto; padding: 0 1.25rem; }
        .ft-section .ft-head { display: flex; flex-direction: column; gap: 2rem; }
        .ft-section .ft-head-left { display: flex; flex-direction: column; gap: 1.5rem; max-width: 44rem; }
        .ft-section .ft-head-right { display: flex; flex-direction: column; align-items: flex-start; gap: 1.5rem; max-width: 26rem; }
        .ft-section .ft-eyebrow { display: flex; align-items: center; gap: .875rem; letter-spacing: .3em; }
        .ft-section .ft-eyebrow-line { display: block; width: 2rem; height: 1px; background: linear-gradient(90deg, transparent, #22FF88); }
        .ft-section .ft-link { display: inline-flex; align-items: center; gap: .625rem; padding: .75rem 1.25rem; border-radius: 999px; border: 1px solid rgba(255,255,255,.12); font-size: .875rem; font-weight: 700; color: #fff; transition: all .3s ease; }
        .ft-section .ft-link:hover { border-color: rgba(34,255,136,.5); color: #22FF88; background: rgba(34,255,136,.06); }

        .ft-section .ft-grid { margin-top: 4rem; display: grid; grid-template-columns: 1fr; gap: 1.5rem; }

        .ft-section .ft-card {
          --s: 1; position: relative; height: 100%; padding: 1px; border-radius: 28px; background: rgba(255,255,255,.1);
          transform: perspective(1100px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) scale(var(--s));
          transition: transform .35s cubic-bezier(.2,.8,.2,1), opacity .35s ease, filter .35s ease, box-shadow .35s ease;
          will-change: transform;
        }
        .ft-section .ft-card:hover { --s: 1.04; z-index: 5; box-shadow: 0 40px 80px -35px var(--accent); }
        .ft-section .ft-grid:has(.ft-card:hover) .ft-card:not(:hover) { --s: .97; opacity: .6; filter: saturate(.7); }
        .ft-section .ft-ring { position: absolute; inset: 0; border-radius: 28px; overflow: hidden; pointer-events: none; }
        .ft-section .ft-spin { position: absolute; inset: -100%; opacity: 0; transition: opacity .5s ease; animation: ftSpin 7s linear infinite;
          background: conic-gradient(from 0deg, var(--accent), #38BDF8, #A855F7, #FFD60A, var(--accent)); }
        .ft-section .ft-card:hover .ft-spin { opacity: .7; }

        .ft-section .ft-article { position: relative; display: flex; flex-direction: column; height: 100%; overflow: hidden; border-radius: 27px; background: #0a0a0a; padding: 2rem; }
        .ft-section .ft-spot { position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .5s ease;
          background: radial-gradient(360px circle at var(--mx,50%) var(--my,50%), var(--soft), transparent 65%); }
        .ft-section .ft-card:hover .ft-spot { opacity: 1; }

        .ft-section .ft-icon { position: relative; display: flex; align-items: center; justify-content: center; width: 3.5rem; height: 3.5rem; border-radius: 1rem;
          background: var(--soft); color: var(--accent); border: 1px solid var(--line); transition: all .5s cubic-bezier(.34,1.56,.64,1); }
        .ft-section .ft-card:hover .ft-icon { background: var(--accent); color: #050505; transform: rotate(-8deg) scale(1.12); box-shadow: 0 10px 30px -8px var(--accent); }
        .ft-section .ft-body { position: relative; display: flex; flex-direction: column; gap: .75rem; margin-top: 1.75rem; flex: 1; }
        .ft-section .ft-text { line-height: 1.75; }
        .ft-section .ft-vis { position: relative; margin-top: 1.75rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,.08); min-height: 4.5rem; display: flex; align-items: center; }

        /* mini visuals */
        .ft-section .ft-vis-search { display: flex; align-items: center; gap: .75rem; width: 100%; padding: .75rem 1rem; border-radius: .875rem; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.03); min-height: 2.75rem; }
        .ft-section .ft-caret { width: 2px; height: 1.1rem; background: #22FF88; animation: ftBlink 1s steps(2) infinite; }
        .ft-section .ft-vis-compare { display: flex; flex-direction: column; gap: .625rem; width: 100%; }
        .ft-section .ft-bar-row { display: grid; grid-template-columns: 3.5rem 1fr 3.5rem; align-items: center; gap: .75rem; font-size: .75rem; }
        .ft-section .ft-bar-label { color: rgba(255,255,255,.4); }
        .ft-section .ft-bar-track { height: .5rem; border-radius: 999px; background: rgba(255,255,255,.06); overflow: hidden; }
        .ft-section .ft-bar-fill { display: block; height: 100%; border-radius: 999px; transition: width 1.1s cubic-bezier(.2,.8,.2,1); }
        .ft-section .ft-bar-price { text-align: right; font-weight: 700; }
        .ft-section .ft-vis-savings { display: flex; align-items: center; justify-content: space-between; gap: 1rem; width: 100%; }
        .ft-section .ft-off { display: inline-flex; align-items: center; gap: .4rem; padding: .4rem .8rem; border-radius: 999px; background: rgba(255,214,10,.14); color: #FFD60A; font-size: .75rem; font-weight: 800; animation: ftPulse 2.4s ease-in-out infinite; }
        .ft-section .ft-vis-alerts { display: flex; align-items: center; gap: .875rem; width: 100%; }
        .ft-section .ft-bell { display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; border-radius: 999px; background: rgba(244,114,182,.14); color: #F472B6; transform-origin: 50% 15%; animation: ftRing 3.6s ease-in-out infinite; }
        .ft-section .ft-toast { padding: .5rem .875rem; border-radius: .75rem; border: 1px solid rgba(244,114,182,.3); background: rgba(244,114,182,.08); color: #fbcfe8; font-size: .75rem; font-weight: 600; animation: ftToast 3.6s ease-in-out infinite; }
        .ft-section .ft-vis-stores { display: flex; align-items: center; }
        .ft-section .ft-avatar { display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; border-radius: 999px; border: 2px solid #0a0a0a; color: #050505; font-size: .8rem; font-weight: 800; animation: ftPop 3s ease-in-out infinite; }
        .ft-section .ft-avatar + .ft-avatar { margin-left: -.65rem; }
        .ft-section .ft-avatar-more { background: rgba(255,255,255,.1); color: rgba(255,255,255,.75); animation: none; }
        .ft-section .ft-vis-smart { display: flex; flex-wrap: wrap; gap: .5rem; }
        .ft-section .ft-chip-smart { display: inline-flex; align-items: center; gap: .4rem; padding: .4rem .8rem; border-radius: 999px; border: 1px solid rgba(251,146,60,.3); background: rgba(251,146,60,.08); color: #fdba74; font-size: .75rem; font-weight: 600; animation: ftGlow 2.8s ease-in-out infinite; }

        /* CTA strip */
        .ft-section .ft-cta { margin-top: 4rem; display: flex; flex-direction: column; align-items: flex-start; gap: 1.5rem; padding: 1.75rem; border-radius: 24px; border: 1px solid rgba(255,255,255,.1);
          background: linear-gradient(120deg, rgba(34,255,136,.07), rgba(56,189,248,.05) 50%, rgba(168,85,247,.07)); }
        .ft-section .ft-cta-text { display: flex; flex-direction: column; gap: .5rem; }
        .ft-section .ft-cta-btn { position: relative; display: inline-flex; align-items: center; gap: .75rem; padding: 1rem 1.75rem; overflow: hidden; border-radius: 1rem; font-size: .875rem; font-weight: 900; color: #050505;
          background: linear-gradient(90deg, #22FF88, #38BDF8); transition: box-shadow .3s ease, transform .3s ease; }
        .ft-section .ft-cta-btn:hover { box-shadow: 0 0 40px rgba(34,255,136,.35); transform: translateY(-2px); }
        .ft-section .ft-shine { position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent); transition: transform .7s ease; }
        .ft-section .ft-cta-btn:hover .ft-shine { transform: translateX(100%); }

        @media (min-width: 640px) {
          .ft-section { padding: 9rem 0; }
          .ft-section .ft-wrap { padding: 0 2rem; }
          .ft-section .ft-grid { grid-template-columns: repeat(2, 1fr); }
          .ft-section .ft-cta { flex-direction: row; align-items: center; justify-content: space-between; padding: 2rem 2.5rem; }
        }
        @media (min-width: 1024px) {
          .ft-section .ft-head { flex-direction: row; align-items: flex-end; justify-content: space-between; gap: 4rem; }
          .ft-section .ft-grid { grid-template-columns: repeat(3, 1fr); gap: 1.75rem; margin-top: 5rem; }
          .ft-section .ft-article { padding: 2.25rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ft-section *, .ft-section *::before, .ft-section *::after {
            animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}

export default Features;
