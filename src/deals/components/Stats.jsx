import { Store, Percent, Users, Zap, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ============================================================
   STATS DATA
============================================================ */
const stats = [
  {
    value: 12000, suffix: "+", label: "Deals tracked",
    description: "Updated across multiple stores",
    icon: Zap, color: "#22FF88", glow: "rgba(34,255,136,.18)", progress: 92,
    spark: "M0 50 C20 46 30 54 50 42 S80 32 100 36 S140 16 160 20 S190 8 200 4",
  },
  {
    value: 250, suffix: "+", label: "Stores",
    description: "Shopping platforms monitored",
    icon: Store, color: "#38BDF8", glow: "rgba(56,189,248,.18)", progress: 78,
    spark: "M0 44 C25 50 35 36 60 38 S90 46 115 30 S150 24 170 14 S190 12 200 8",
  },
  {
    value: 89, suffix: "%", label: "Average savings",
    description: "Potential savings discovered",
    icon: Percent, color: "#FFD60A", glow: "rgba(255,214,10,.18)", progress: 89,
    spark: "M0 38 C20 30 35 44 55 34 S85 20 110 26 S145 12 165 16 S190 6 200 6",
  },
  {
    value: 50, suffix: "K+", label: "Deal hunters",
    description: "People looking for better prices",
    icon: Users, color: "#A855F7", glow: "rgba(168,85,247,.18)", progress: 86,
    spark: "M0 52 C22 48 38 40 58 44 S92 28 118 24 S152 22 172 12 S192 10 200 4",
  },
];

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

const revealStyle = (shown, delay = 0, distance = 40) => ({
  opacity: shown ? 1 : 0,
  transform: shown ? "translateY(0)" : `translateY(${distance}px)`,
  transition: "opacity .9s ease, transform .9s cubic-bezier(.2,.8,.2,1)",
  transitionDelay: shown ? `${delay}ms` : "0ms",
});

/* ============================================================
   NUMBER COUNTER
============================================================ */
function Counter({ target, suffix, active, delay = 0 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) { setCount(0); return; }
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setCount(target); return; }

    let raf, start = null, timer;
    const duration = 2000;
    const animate = (time) => {
      if (start === null) start = time;
      const p = Math.min((time - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 4)) * target)); // ease-out
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    timer = setTimeout(() => { raf = requestAnimationFrame(animate); }, delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [target, active, delay]);

  return (<>{count.toLocaleString("en-IN")}<span className="st-suffix">{suffix}</span></>);
}

/* ============================================================
   SINGLE STAT CARD
============================================================ */
function StatCard({ stat, index, active }) {
  const Icon = stat.icon;
  const delay = index * 140;
  const gid = `spark-${index}`;

  /* Pointer tracking through CSS variables (no re-render per mouse move) */
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    const s = e.currentTarget.style;
    s.setProperty("--mx", `${x}%`);
    s.setProperty("--my", `${y}%`);
    s.setProperty("--rx", `${((50 - y) / 50) * 6}deg`);
    s.setProperty("--ry", `${((x - 50) / 50) * 7}deg`);
  };
  const leave = (e) => {
    const s = e.currentTarget.style;
    s.setProperty("--mx", "50%");
    s.setProperty("--my", "50%");
    s.setProperty("--rx", "0deg");
    s.setProperty("--ry", "0deg");
  };

  return (
    <div style={revealStyle(active, delay, 56)}>
      <article
        className="st-card group"
        onMouseMove={move}
        onMouseLeave={leave}
        style={{ "--accent": stat.color, "--glow": stat.glow, "--soft": `${stat.color}14`, "--line": `${stat.color}45` }}
      >
        {/* Gradient border (always faint, full + spinning on hover) */}
        <div className="st-ring"><div className="st-spin" /></div>

        <div className="st-inner">
          {/* Cursor spotlight */}
          <div className="st-spot" />

          {/* Faint trend line drawing in the background */}
          <svg className="st-spark" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stat.color} stopOpacity=".28" />
                <stop offset="100%" stopColor={stat.color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${stat.spark} L200 60 L0 60 Z`} fill={`url(#${gid})`}
              style={{ opacity: active ? 1 : 0, transition: "opacity 1.6s ease", transitionDelay: `${delay + 900}ms` }} />
            <path d={stat.spark} pathLength="1" fill="none" stroke={stat.color} strokeWidth="1.5"
              strokeLinecap="round" vectorEffect="non-scaling-stroke"
              style={{
                strokeDasharray: 1, strokeDashoffset: active ? 0 : 1,
                transition: "stroke-dashoffset 2.2s cubic-bezier(.2,.8,.2,1)", transitionDelay: `${delay + 500}ms`,
              }} />
          </svg>

          {/* Top row */}
          <div className="st-top">
            <span className="st-live">
              <span className="st-dot">
                <span className="st-dot-ping" style={{ background: stat.color }} />
                <span className="st-dot-core" style={{ background: stat.color }} />
              </span>
              Live
            </span>
            <TrendingUp size={15} className="st-trend" style={{ color: stat.color }} />
          </div>

          {/* Icon */}
          <div className="st-icon">
            <div className="st-icon-glow" />
            <Icon size={28} strokeWidth={1.8} className="relative" />
          </div>

          {/* Number */}
          <div className="st-num text-4xl font-black text-white sm:text-5xl">
            <Counter target={stat.value} suffix={stat.suffix} active={active} delay={delay + 250} />
          </div>

          <h3 className="text-sm font-bold text-white/75">{stat.label}</h3>
          <p className="st-desc text-white/35">{stat.description}</p>

          {/* Progress */}
          <div className="st-track">
            <div className="st-fill"
              style={{
                width: active ? `${stat.progress}%` : "0%",
                background: stat.color,
                boxShadow: `0 0 12px ${stat.color}`,
                transitionDelay: `${delay + 500}ms`,
              }} />
          </div>

          <div className="st-hover" style={{ color: stat.color }}>Updated in real time</div>
        </div>
      </article>
    </div>
  );
}

/* ============================================================
   MAIN STATS SECTION
============================================================ */
function Stats() {
  const [sectionRef, active] = useReveal(0.2);

  const parallax = (e) => {
    const s = e.currentTarget.style;
    s.setProperty("--px", `${(e.clientX / window.innerWidth - 0.5) * 60}px`);
    s.setProperty("--py", `${(e.clientY / window.innerHeight - 0.5) * 40}px`);
  };

  return (
    <section ref={sectionRef} onMouseMove={parallax} className="st-section relative overflow-hidden bg-black">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="st-grid-bg absolute inset-0" />
        <div className="st-par absolute" style={{ "--k": 1, left: "6%", top: "10%" }}>
          <div className="st-float st-blur h-80 w-80 rounded-full bg-[#22FF88]/[0.07]" />
        </div>
        <div className="st-par absolute" style={{ "--k": -1.4, right: "6%", bottom: "6%" }}>
          <div className="st-float st-blur h-80 w-80 rounded-full bg-[#A855F7]/[0.07]" style={{ animationDelay: "-7s" }} />
        </div>
        <div className="st-par absolute" style={{ "--k": 0.7, left: "42%", top: "40%" }}>
          <div className="st-float st-blur h-64 w-64 rounded-full bg-[#38BDF8]/[0.06]" style={{ animationDelay: "-12s" }} />
        </div>
      </div>

      <div className="st-wrap relative z-10">
        {/* Header */}
        <div className="st-head">
          <div className="st-badge" style={revealStyle(active, 0, 24)}>
            <span className="st-badge-dot" />
            KSAM Deal Network
          </div>

          <h2 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl" style={{ ...revealStyle(active, 120, 32), lineHeight: 1.12 }}>
            Deals that <span className="st-gradient-text">move fast.</span>
          </h2>

          <p className="st-sub text-sm text-white/40 sm:text-base" style={revealStyle(active, 240, 28)}>
            Real-time deal discovery across stores, categories and shoppers.
          </p>
        </div>

        {/* Cards */}
        <div className="st-grid">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} active={active} />
          ))}
        </div>

        {/* Bottom status */}
        <div className="st-status" style={{ opacity: active ? 1 : 0, transition: "opacity 1s ease", transitionDelay: "1100ms" }}>
          <span className="st-status-dot" />
          Live deal intelligence
          <span className="text-white/10">•</span>
          Updating continuously
        </div>
      </div>

      <style>{`
        @keyframes stFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(40px,-28px,0) scale(1.08); } }
        @keyframes stSpin { to { transform: rotate(360deg); } }
        @keyframes stShift { to { background-position: 200% 0; } }
        @keyframes stBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes stPing { 75%,100% { transform: scale(2.4); opacity: 0; } }
        @keyframes stPulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }

        .st-float { animation: stFloat 18s ease-in-out infinite; }
        .st-blur { filter: blur(120px); }
        .st-par { transform: translate3d(calc(var(--px,0px) * var(--k,1)), calc(var(--py,0px) * var(--k,1)), 0); transition: transform .6s ease-out; }
        .st-grid-bg {
          background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
          background-size: 80px 80px;
          -webkit-mask-image: radial-gradient(ellipse at center, #000 15%, transparent 70%);
          mask-image: radial-gradient(ellipse at center, #000 15%, transparent 70%);
        }
        .st-gradient-text {
          background: linear-gradient(90deg, #22FF88, #38BDF8, #A855F7, #22FF88);
          background-size: 200% 100%; -webkit-background-clip: text; background-clip: text;
          color: transparent; animation: stShift 6s linear infinite;
        }

        /* ---- Layout & spacing (scoped + specific so global resets can't collapse it) ---- */
        .st-section { padding: 5rem 0; }
        .st-section .st-wrap { max-width: 80rem; margin: 0 auto; padding: 0 1.25rem; display: flex; flex-direction: column; align-items: center; gap: 3.5rem; }
        .st-section .st-head { display: flex; flex-direction: column; align-items: center; gap: 1.25rem; max-width: 46rem; text-align: center; }
        .st-section .st-badge { display: inline-flex; align-items: center; gap: .6rem; padding: .55rem 1.1rem; border-radius: 999px; border: 1px solid rgba(34,255,136,.28);
          background: rgba(34,255,136,.06); color: #22FF88; font-size: .68rem; font-weight: 900; letter-spacing: .2em; text-transform: uppercase; }
        .st-section .st-badge-dot { width: .4rem; height: .4rem; border-radius: 999px; background: #22FF88; animation: stPulse 1.8s ease-in-out infinite; }
        .st-section .st-sub { max-width: 34rem; line-height: 1.8; }
        .st-section .st-grid { width: 100%; display: grid; grid-template-columns: 1fr; gap: 1.5rem; }

        .st-section .st-card {
          --s: 1; position: relative; height: 100%; padding: 1px; border-radius: 26px;
          background: linear-gradient(135deg, var(--line), rgba(255,255,255,.06) 40%, rgba(255,255,255,.06) 60%, var(--line));
          transform: perspective(1000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) scale(var(--s));
          transition: transform .35s cubic-bezier(.2,.8,.2,1), opacity .35s ease, filter .35s ease, box-shadow .35s ease;
          will-change: transform;
        }
        .st-section .st-card:hover { --s: 1.05; z-index: 5; box-shadow: 0 40px 70px -32px var(--accent); }
        .st-section .st-grid:has(.st-card:hover) .st-card:not(:hover) { --s: .96; opacity: .6; filter: saturate(.7); }
        .st-section .st-ring { position: absolute; inset: 0; border-radius: 26px; overflow: hidden; pointer-events: none; }
        .st-section .st-spin { position: absolute; inset: -100%; opacity: 0; transition: opacity .5s ease; animation: stSpin 7s linear infinite;
          background: conic-gradient(from 0deg, var(--accent), #38BDF8, #A855F7, #FFD60A, var(--accent)); }
        .st-section .st-card:hover .st-spin { opacity: .8; }

        .st-section .st-inner { position: relative; display: flex; flex-direction: column; align-items: center; height: 100%; min-height: 290px;
          padding: 2rem 1.5rem 2.25rem; overflow: hidden; border-radius: 25px; background: #080808; text-align: center; }
        .st-section .st-spot { position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .5s ease;
          background: radial-gradient(300px circle at var(--mx,50%) var(--my,50%), var(--glow), transparent 65%); }
        .st-section .st-card:hover .st-spot { opacity: 1; }
        .st-section .st-spark { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 5.5rem; opacity: .55; pointer-events: none; transition: opacity .4s ease; }
        .st-section .st-card:hover .st-spark { opacity: 1; }

        .st-section .st-top { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; width: 100%; }
        .st-section .st-live { display: inline-flex; align-items: center; gap: .4rem; padding: .25rem .65rem; border-radius: 999px; border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.025); color: rgba(255,255,255,.4); font-size: .6rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; }
        .st-section .st-dot { position: relative; display: flex; width: .4rem; height: .4rem; }
        .st-section .st-dot-ping { position: absolute; inset: 0; border-radius: 999px; opacity: .6; animation: stPing 1.8s cubic-bezier(0,0,.2,1) infinite; }
        .st-section .st-dot-core { position: relative; width: .4rem; height: .4rem; border-radius: 999px; }
        .st-section .st-trend { opacity: .25; transition: all .3s ease; }
        .st-section .st-card:hover .st-trend { opacity: .9; transform: translate(4px,-4px); }

        .st-section .st-icon { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; width: 4rem; height: 4rem; margin: 1.75rem 0 1.5rem;
          border-radius: 1rem; border: 1px solid var(--line); background: var(--soft); color: var(--accent); transition: all .5s cubic-bezier(.34,1.56,.64,1); }
        .st-section .st-icon-glow { position: absolute; inset: 0; border-radius: 1rem; background: var(--accent); filter: blur(18px); opacity: .25; transition: opacity .5s ease; }
        .st-section .st-card:hover .st-icon { transform: rotate(-6deg) scale(1.12); background: var(--accent); color: #050505; }
        .st-section .st-card:hover .st-icon-glow { opacity: .7; }
        .st-section .st-num { position: relative; z-index: 1; line-height: 1.1; letter-spacing: -.02em; font-variant-numeric: tabular-nums; transition: color .3s ease; }
        .st-section .st-card:hover .st-num { color: var(--accent); }
        .st-section .st-suffix { color: var(--accent); }
        .st-section h3 { position: relative; z-index: 1; margin-top: .6rem; }
        .st-section .st-desc { position: relative; z-index: 1; margin-top: .5rem; max-width: 12.5rem; font-size: .75rem; line-height: 1.6; }
        .st-section .st-track { position: relative; z-index: 1; width: 7rem; height: 4px; margin-top: 1.5rem; border-radius: 999px; background: rgba(255,255,255,.07); overflow: hidden; }
        .st-section .st-fill { height: 100%; border-radius: 999px; transition: width 1.8s cubic-bezier(.2,.8,.2,1); }
        .st-section .st-hover { position: relative; z-index: 1; margin-top: 1.1rem; font-size: .6rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
          opacity: 0; transform: translateY(8px); transition: all .3s ease; }
        .st-section .st-card:hover .st-hover { opacity: 1; transform: translateY(0); }

        .st-section .st-status { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: .6rem; color: rgba(255,255,255,.28);
          font-size: .62rem; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; text-align: center; }
        .st-section .st-status-dot { width: .4rem; height: .4rem; border-radius: 999px; background: #22FF88; box-shadow: 0 0 10px #22FF88; animation: stPulse 1.8s ease-in-out infinite; }

        @media (min-width: 640px) {
          .st-section { padding: 6rem 0; }
          .st-section .st-wrap { padding: 0 2rem; gap: 4rem; }
          .st-section .st-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .st-section { padding: 7rem 0; }
          .st-section .st-wrap { padding: 0 2.5rem; }
          .st-section .st-grid { grid-template-columns: repeat(4, 1fr); gap: 1.75rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .st-section *, .st-section *::before, .st-section *::after {
            animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}

export default Stats;
