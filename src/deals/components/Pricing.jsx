import { useEffect, useRef, useState } from "react";

/* ============================================================
   DATA
============================================================ */
const plans = [
  {
    name: "Explorer",
    amount: 0,
    description: "For discovering deals.",
    icon: "compass",
    accent: "#38BDF8",
    features: ["Deal discovery", "Product search", "Category filters", "External store links"],
  },
  {
    name: "Deal Hunter",
    amount: 99,
    description: "For frequent deal hunters.",
    icon: "flame",
    accent: "#22FF88",
    features: ["Everything in Explorer", "Deal alerts", "Saved products", "Price tracking"],
    popular: true,
  },
  {
    name: "Pro",
    amount: 199,
    description: "For advanced shoppers.",
    icon: "crown",
    accent: "#A855F7",
    features: ["Everything in Deal Hunter", "Advanced tracking", "Personalized recommendations", "AI-powered discovery"],
  },
];

const YEARLY_DISCOUNT = 0.2;

/* ============================================================
   ICONS
============================================================ */
function Icon({ name, size = 22 }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round",
  };
  const paths = {
    compass: (<><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>),
    flame: (<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" />),
    crown: (<><path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5z" /></>),
    arrow: (<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>),
    check: (<path d="m5 12 4 4L19 6" />),
    spark: (<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />),
  };
  return <svg {...common}>{paths[name]}</svg>;
}

/* ============================================================
   HOOKS
============================================================ */
function useReveal(threshold = 0.2) {
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

/* Smoothly tweens a number whenever its target changes */
function useTween(target, duration = 650) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    let raf, start;
    const begin = from.current;
    const tick = (t) => {
      start = start ?? t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      const v = Math.round(begin + (target - begin) * eased);
      setValue(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/* ============================================================
   PIECES
============================================================ */
function Price({ amount, accent, yearly }) {
  const shown = yearly ? Math.round(amount * (1 - YEARLY_DISCOUNT)) : amount;
  const n = useTween(shown);

  if (amount === 0) {
    return (
      <div className="flex items-end gap-2">
        <span className="text-5xl font-black leading-none" style={{ color: accent }}>Free</span>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-1.5">
      <span className="pr-sub text-2xl font-bold text-white/60">₹</span>
      <span className="text-5xl font-black leading-none tabular-nums" style={{ color: accent }}>{n}</span>
      <span className="pr-sub text-sm text-white/40">/month</span>
    </div>
  );
}

function Billing({ yearly, setYearly }) {
  return (
    <div className="pr-bill inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] backdrop-blur">
      <div className="relative grid grid-cols-2">
        <span
          className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-[#22FF88] to-[#38BDF8] shadow-[0_0_25px_rgba(34,255,136,.3)] transition-transform duration-500"
          style={{ transform: yearly ? "translateX(100%)" : "translateX(0)", transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }}
        />
        {[["Monthly", false], ["Yearly", true]].map(([label, val]) => (
          <button key={label} type="button" onClick={() => setYearly(val)} aria-pressed={yearly === val}
            className={`pr-bill-btn relative z-10 rounded-full text-sm font-bold transition-colors duration-300 ${yearly === val ? "text-black" : "text-white/55 hover:text-white"}`}>
            {label}
          </button>
        ))}
      </div>
      <span className="pr-badge-pulse pr-save hidden rounded-full bg-[#FFD60A]/15 text-xs font-bold text-[#FFD60A] sm:inline-block">
        Save 20%
      </span>
    </div>
  );
}

function PlanCard({ plan, index, shown, selected, onSelect, yearly }) {
  const { name, amount, description, icon, accent, features, popular } = plan;

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
    const s = e.currentTarget.style;
    s.setProperty("--rx", "0deg");
    s.setProperty("--ry", "0deg");
  };

  const yearlyTotal = Math.round(amount * (1 - YEARLY_DISCOUNT) * 12);
  const isSelected = selected === name;

  return (
    <div
      className={`transition-all duration-[900ms] ease-out ${shown ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}
      style={{ transitionDelay: shown ? `${index * 160}ms` : "0ms" }}
    >
      <div
        onMouseMove={move}
        onMouseLeave={leave}
        className={`pr-card group relative h-full bg-white/10 ${popular ? "pr-popular" : ""}`}
        style={{ "--accent": accent }}
      >
        {/* Animated gradient border */}
        <div className="pr-clip pointer-events-none absolute inset-0 overflow-hidden">
          <div className={`pr-spin absolute transition-opacity duration-500 ${popular ? "opacity-90" : "opacity-0 group-hover:opacity-60"}`} />
        </div>

        <article className="pr-article relative flex h-full flex-col overflow-hidden bg-[#0a0a0a]">
          {/* Cursor spotlight */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: `radial-gradient(380px circle at var(--mx,50%) var(--my,50%), ${accent}22, transparent 60%)` }} />
          {popular && <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#22FF88]/10 blur-3xl" />}

          {/* Top row: icon + badge */}
          <div className="relative flex items-start justify-between gap-3">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110"
              style={{ color: accent, borderColor: `${accent}40`, background: `${accent}14`, boxShadow: `0 0 0 0 ${accent}00` }}
            >
              <Icon name={icon} size={24} />
            </div>

            {popular && (
              <span className="pr-shimmer inline-flex items-center gap-1.5 rounded-full bg-[#FFD60A] pr-pill text-xs font-black text-black">
                <Icon name="spark" size={13} />
                MOST POPULAR
              </span>
            )}
          </div>

          <h3 className="pr-name relative text-2xl font-black text-white">{name}</h3>
          <p className="pr-desc relative text-sm text-white/45">{description}</p>

          {/* Price */}
          <div className="pr-price relative">
            <Price amount={amount} accent={accent} yearly={yearly} />
            <p className="pr-note text-xs text-white/35">
              {amount === 0
                ? "No card required"
                : yearly
                  ? `₹${yearlyTotal} billed yearly`
                  : "Billed monthly · cancel anytime"}
            </p>
          </div>

          <div className="pr-sep relative h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {/* Features */}
          <ul className="pr-list relative flex flex-1 flex-col">
            {features.map((f, i) => (
              <li key={f}
                className={`flex items-start gap-3 text-[15px] text-white/60 transition-all duration-700 group-hover:text-white/85 ${shown ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                style={{ transitionDelay: shown ? `${index * 160 + 350 + i * 90}ms` : "0ms" }}>
                <span className="pr-tick flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${accent}1f`, color: accent }}>
                  <Icon name="check" size={12} />
                </span>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            type="button"
            onClick={() => onSelect(isSelected ? null : name)}
            aria-pressed={isSelected}
            className={`pr-cta group/btn relative flex w-full items-center justify-center overflow-hidden rounded-2xl border text-sm font-black transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22FF88] active:scale-[0.97] ${
              popular || isSelected
                ? "border-transparent bg-gradient-to-r from-[#22FF88] to-[#38BDF8] text-black hover:shadow-[0_0_40px_rgba(34,255,136,.35)]"
                : "border-white/15 text-white hover:border-transparent hover:bg-white hover:text-black"
            }`}
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
            <span className="relative">{isSelected ? "Selected" : "Get Started"}</span>
            <span className="relative transition-transform duration-300 group-hover/btn:translate-x-1.5">
              <Icon name={isSelected ? "check" : "arrow"} size={17} />
            </span>
          </button>
        </article>
      </div>
    </div>
  );
}

/* ============================================================
   PRICING
============================================================ */
function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [selected, setSelected] = useState(null);

  const [headRef, headShown] = useReveal(0.3);
  const [gridRef, gridShown] = useReveal(0.12);
  const [noteRef, noteShown] = useReveal(0.5);

  const parallax = (e) => {
    const s = e.currentTarget.style;
    s.setProperty("--px", `${(e.clientX / window.innerWidth - 0.5) * 60}px`);
    s.setProperty("--py", `${(e.clientY / window.innerHeight - 0.5) * 40}px`);
  };

  return (
    <section id="pricing" onMouseMove={parallax} className="pr-section relative overflow-hidden bg-[#050505]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="pr-grid-bg absolute inset-0" />
        <div className="pr-par absolute" style={{ "--k": 1, left: "8%", top: "6rem" }}>
          <div className="pr-float h-80 w-80 pr-b110 rounded-full bg-[#38BDF8]/[0.07]" />
        </div>
        <div className="pr-par absolute" style={{ "--k": -1.3, bottom: "2.5rem", right: "6%" }}>
          <div className="pr-float h-96 w-96 pr-b120 rounded-full bg-[#22FF88]/[0.07]" style={{ animationDelay: "-6s" }} />
        </div>
        <div className="pr-par absolute left-1/2 top-1/2" style={{ "--k": 0.6 }}>
          <div className="pr-float h-72 w-72 pr-b110 rounded-full bg-[#A855F7]/[0.06]" style={{ animationDelay: "-11s" }} />
        </div>
      </div>

      <div className="pr-wrap relative z-10">
        {/* Heading */}
        <div ref={headRef} className={`pr-head text-center transition-all duration-1000 ease-out ${headShown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
          <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[.3em] text-[#38BDF8]">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#38BDF8]" />
            MEMBERSHIP
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#38BDF8]" />
          </p>

          <h2 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Choose your
            <span className="pr-gradient-text"> deal mode.</span>
          </h2>

          <p className="mx-auto max-w-xl text-base leading-8 text-white/45">
            Start free and upgrade when you want alerts, tracking and smarter picks. Switch or cancel any time.
          </p>

          <div>
            <Billing yearly={yearly} setYearly={setYearly} />
          </div>
        </div>

        {/* Plans */}
        <div ref={gridRef} className="pr-grid grid items-stretch">
          {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} shown={gridShown}
              selected={selected} onSelect={setSelected} yearly={yearly} />
          ))}
        </div>

        {/* Reassurance row */}
        <div ref={noteRef}
          className={`pr-notes flex flex-wrap items-center justify-center text-sm text-white/40 transition-all duration-1000 ${noteShown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
          {["No hidden charges", "Cancel anytime", "Secure checkout"].map((t) => (
            <span key={t} className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#22FF88]/10 text-[#22FF88]">
                <Icon name="check" size={12} />
              </span>
              {t}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes prFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(40px,-30px,0) scale(1.08); } }
        @keyframes prSpin { to { transform: rotate(360deg); } }
        @keyframes prShift { to { background-position: 200% 0; } }
        @keyframes prShimmer { 0% { background-position: 200% 0; } 100% { background-position: -100% 0; } }
        @keyframes prPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,214,10,.35); } 50% { box-shadow: 0 0 0 8px rgba(255,214,10,0); } }

        .pr-float { animation: prFloat 18s ease-in-out infinite; }
        .pr-par { transform: translate3d(calc(var(--px,0px) * var(--k,1)), calc(var(--py,0px) * var(--k,1)), 0); transition: transform .6s ease-out; }
        .pr-grid-bg {
          background-image: radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 28px 28px;
          -webkit-mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
          mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
        }
        .pr-gradient-text {
          background: linear-gradient(90deg, #22FF88, #38BDF8, #A855F7, #22FF88);
          background-size: 200% 100%; -webkit-background-clip: text; background-clip: text;
          color: transparent; animation: prShift 6s linear infinite;
        }
        .pr-spin {
          background: conic-gradient(from 0deg, var(--accent), #38BDF8, #A855F7, #FFD60A, var(--accent));
          animation: prSpin 7s linear infinite;
        }
        .pr-shimmer {
          background-image: linear-gradient(110deg, #FFD60A 35%, #fff6b8 50%, #FFD60A 65%);
          background-size: 250% 100%; animation: prShimmer 3.2s ease-in-out infinite;
        }
        .pr-badge-pulse { animation: prPulse 2.4s ease-in-out infinite; }


        /* ---- Layout & spacing (scoped + specific so global resets can't collapse it) ---- */
        .pr-section { padding: 7rem 0; }
        .pr-section .pr-wrap { max-width: 72rem; margin: 0 auto; padding: 0 1.25rem; }
        .pr-section .pr-head { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        .pr-section .pr-head > :last-child { margin-top: 1rem; }
        .pr-section .pr-bill { gap: 1rem; padding: .375rem; }
        .pr-section .pr-bill-btn { padding: .75rem 1.75rem; }
        .pr-section .pr-save { margin-right: .5rem; padding: .3rem .8rem; }
        .pr-section .pr-grid { margin-top: 4rem; gap: 2rem; grid-template-columns: 1fr; }
        .pr-section .pr-card { padding: 1px; border-radius: 28px; }
        .pr-section .pr-clip { border-radius: 28px; }
        .pr-section .pr-spin { position: absolute; inset: -100%; }
        .pr-section .pr-article { border-radius: 27px; padding: 2rem; }
        .pr-section .pr-pill { padding: .375rem .875rem; }
        .pr-section .pr-name { margin-top: 1.75rem; }
        .pr-section .pr-desc { margin-top: .5rem; }
        .pr-section .pr-price { margin-top: 2rem; }
        .pr-section .pr-note { margin-top: .75rem; min-height: 1.25rem; }
        .pr-section .pr-sep { margin: 2rem 0; }
        .pr-section .pr-list { gap: 1rem; list-style: none; margin: 0; padding: 0; }
        .pr-section .pr-tick { margin-top: .2rem; }
        .pr-section .pr-cta { margin-top: 2.5rem; padding: 1rem 1.5rem; gap: .625rem; }
        .pr-section .pr-sub { padding-bottom: .375rem; }
        .pr-section .pr-notes { margin-top: 4rem; gap: 1rem 2.5rem; }
        .pr-b110 { filter: blur(110px); }
        .pr-b120 { filter: blur(120px); }
        @media (min-width: 640px) {
          .pr-section { padding: 9rem 0; }
          .pr-section .pr-wrap { padding: 0 2rem; }
          .pr-section .pr-article { padding: 2.25rem; }
        }
        @media (min-width: 768px) {
          .pr-section .pr-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1024px) {
          .pr-section .pr-grid { margin-top: 5rem; gap: 2.5rem; }
        }

        /* Card: tilt + scale on hover, siblings step back */
        .pr-card {
          --s: 1;
          transform: perspective(1100px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) scale(var(--s));
          transition: transform .35s cubic-bezier(.2,.8,.2,1), opacity .35s ease, filter .35s ease, box-shadow .35s ease;
          will-change: transform;
        }
        .pr-card:hover { --s: 1.05; z-index: 5; box-shadow: 0 40px 80px -30px var(--accent); }
        @media (min-width: 768px) { .pr-popular { --s: 1.04; } .pr-popular:hover { --s: 1.08; } }
        .pr-grid:has(.pr-card:hover) .pr-card:not(:hover) { --s: .96; opacity: .65; filter: saturate(.7); }

        @media (prefers-reduced-motion: reduce) {
          .pr-section *, .pr-section *::before, .pr-section *::after {
            animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}

export default Pricing;
