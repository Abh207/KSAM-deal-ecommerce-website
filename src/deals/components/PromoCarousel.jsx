import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import data from "../../api/dealAutoScroll.json";
import "./PromoCarousel.css";

/* ---------- Generated product art (SVG, used when image.src is blank) ---------- */

const Earbuds = () => (
  <svg viewBox="0 0 300 150" className="art">
    <defs>
      <linearGradient id="eb-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#eef0f3" /><stop offset="1" stopColor="#9aa0a8" /></linearGradient>
      <linearGradient id="eb-brown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b3430" /><stop offset="1" stopColor="#1d1a18" /></linearGradient>
      <linearGradient id="eb-blue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8ea7ff" /><stop offset="1" stopColor="#4a63d6" /></linearGradient>
    </defs>
    <ellipse cx="150" cy="140" rx="140" ry="8" fill="#0003" />
    <rect x="6" y="70" width="92" height="66" rx="14" fill="url(#eb-silver)" />
    <rect x="12" y="76" width="80" height="22" rx="8" fill="#f08a24" />
    <ellipse cx="38" cy="86" rx="11" ry="9" fill="#fff" /><ellipse cx="66" cy="84" rx="11" ry="9" fill="#fff" />
    <rect x="60" y="40" width="12" height="40" rx="6" fill="#fff" />
    <circle cx="52" cy="124" r="3" fill="#4ade80" />
    <path d="M110 136V76q0-24 30-28v-6h20v6q30 4 30 28v60q0 6-6 6h-68q-6 0-6-6z" fill="url(#eb-brown)" />
    <rect x="122" y="56" width="18" height="40" rx="9" fill="#d9b99b" /><rect x="160" y="56" width="18" height="40" rx="9" fill="#d9b99b" />
    <rect x="140" y="112" width="22" height="4" rx="2" fill="#4ade80" />
    <rect x="200" y="80" width="94" height="56" rx="26" fill="url(#eb-blue)" />
    <ellipse cx="228" cy="88" rx="14" ry="12" fill="#6f87f0" /><ellipse cx="266" cy="88" rx="14" ry="12" fill="#6f87f0" />
    <text x="247" y="124" fontSize="8" fontWeight="700" fill="#fff" textAnchor="middle">ONEPLUS</text>
  </svg>
);

const Kurta = () => (
  <svg viewBox="0 0 300 190" className="art">
    <path d="M0 40 Q40 10 70 60 Q60 130 20 190 H0z" fill="#e58aa0" opacity=".85" />
    <path d="M60 30 l40 -14 q20 14 40 0 l40 14 -8 130 H68z" fill="#c9a28f" transform="rotate(-6 150 100)" />
    <path d="M110 20 q20 22 40 0" fill="none" stroke="#a8826f" strokeWidth="3" transform="rotate(-6 150 100)" />
    <g stroke="#f6e7da" strokeWidth="2" fill="none" transform="rotate(-6 150 100)">
      <path d="M130 36 v110" strokeDasharray="3 5" /><path d="M120 50 q10 14 0 28 q-10 14 0 28" /><path d="M140 50 q-10 14 0 28 q10 14 0 28" />
    </g>
    <path d="M170 90 l40 -12 q18 12 36 0 l34 12 -8 100 H178z" fill="#d97790" />
    <g stroke="#ffd9e0" strokeWidth="1.6" fill="none" opacity=".9">
      <path d="M190 120 l20 20 20 -20 20 20 20 -20" /><path d="M190 150 l20 20 20 -20 20 20 20 -20" />
    </g>
  </svg>
);

const Laptop = () => (
  <svg viewBox="0 0 300 170" className="art">
    <ellipse cx="150" cy="150" rx="140" ry="14" fill="#c2410c" />
    <rect x="30" y="140" width="240" height="10" rx="4" fill="#7c2d12" />
    <path d="M60 24h180l8 98H52z" fill="#10182f" />
    <rect x="68" y="30" width="164" height="86" rx="3" fill="#cfd6e4" />
    <rect x="68" y="30" width="164" height="86" rx="3" fill="url(#lp-screen)" />
    <defs><linearGradient id="lp-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2d6b3" /><stop offset="1" stopColor="#6f8aa8" /></linearGradient></defs>
    <circle cx="120" cy="62" r="13" fill="#3b2a24" /><path d="M100 100q20-34 40 0z" fill="#fff" />
    <rect x="68" y="92" width="164" height="24" fill="#fff" /><text x="100" y="106" fontSize="8" fontWeight="800" fill="#111">As Light as 0.98 kg</text>
    <text x="185" y="106" fontSize="8" fontWeight="800" fill="#111">33hrs</text>
    <path d="M48 122h204l14 18H34z" fill="#1f2a4a" /><rect x="78" y="128" width="144" height="6" rx="3" fill="#3a4a7a" />
  </svg>
);

const Blender = () => (
  <svg viewBox="0 0 300 170" className="art">
    <rect x="0" y="122" width="300" height="48" fill="#e9dcc9" />
    <ellipse cx="60" cy="136" rx="36" ry="9" fill="#d36a2a" /><path d="M26 130q34 -26 68 0" fill="#f59e3b" />
    <rect x="46" y="76" width="30" height="40" rx="4" fill="#fff8" stroke="#fff" /><rect x="50" y="90" width="22" height="24" fill="#c2884a" />
    <rect x="120" y="108" width="62" height="56" rx="8" fill="#1c1c1f" /><rect x="116" y="30" width="70" height="80" rx="10" fill="#ffffff66" stroke="#fff" />
    <circle cx="136" cy="56" r="9" fill="#f43f5e" /><circle cx="160" cy="48" r="9" fill="#fbbf24" /><circle cx="148" cy="80" r="10" fill="#fb7185" /><circle cx="168" cy="84" r="8" fill="#a3e635" />
    <rect x="126" y="22" width="50" height="10" rx="4" fill="#26262a" />
    <rect x="200" y="62" width="34" height="68" rx="8" fill="#ffffff66" stroke="#fff" /><rect x="204" y="96" width="26" height="30" rx="4" fill="#facc15" /><rect x="204" y="70" width="26" height="26" fill="#4ade80" />
    <rect x="248" y="96" width="38" height="34" rx="5" fill="#d9f99d" stroke="#fff" /><circle cx="226" cy="140" r="12" fill="#fb923c" />
  </svg>
);

const Mop = () => (
  <svg viewBox="0 0 300 170" className="art">
    <rect x="0" y="120" width="300" height="50" fill="#e8e2d6" />
    <ellipse cx="120" cy="108" rx="62" ry="14" fill="#16a34a" /><path d="M58 108v36q0 14 62 14t62 -14v-36z" fill="#22c55e" />
    <ellipse cx="120" cy="108" rx="52" ry="9" fill="#15803d" />
    <path d="M214 12L120 118" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
    <ellipse cx="86" cy="138" rx="40" ry="12" fill="#f8fafc" /><circle cx="86" cy="134" r="10" fill="#4ade80" />
    <path d="M40 60l8-30 14 4-4 30z" fill="#f472b6" /><path d="M54 60l14-28 14 8-8 26z" fill="#ec4899" />
    <rect x="186" y="62" width="14" height="50" rx="4" fill="#7dd3c0" /><rect x="188" y="52" width="10" height="12" fill="#0ea5a5" />
    <path d="M214 96h54l-6 52h-42z" fill="#9ca3af" />
    <rect x="236" y="112" width="40" height="12" rx="3" fill="#f43f5e" transform="rotate(-8 256 118)" /><rect x="238" y="126" width="40" height="12" rx="3" fill="#38bdf8" transform="rotate(-8 258 132)" /><rect x="240" y="140" width="40" height="12" rx="3" fill="#facc15" transform="rotate(-8 260 146)" />
  </svg>
);

const Workspace = () => (
  <svg viewBox="0 0 300 190" className="art">
    <defs><linearGradient id="ws-neon" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#22d3ee" /><stop offset=".5" stopColor="#a3e635" /><stop offset="1" stopColor="#f472b6" /></linearGradient></defs>
    <ellipse cx="90" cy="100" rx="60" ry="14" fill="#c2410c" />
    <path d="M52 76q-4 -60 54 -62t58 62" fill="none" stroke="url(#ws-neon)" strokeWidth="9" strokeLinecap="round" />
    <rect x="42" y="64" width="28" height="44" rx="12" fill="#14213d" stroke="#22d3ee" strokeWidth="3" /><rect x="136" y="64" width="28" height="44" rx="12" fill="#14213d" stroke="#f472b6" strokeWidth="3" />
    <path d="M52 108q4 22 28 24" fill="none" stroke="#111" strokeWidth="3" />
    <rect x="96" y="100" width="46" height="34" rx="6" fill="#1b2437" transform="rotate(8 96 100)" /><text x="108" y="124" fontSize="15" fontWeight="800" fill="#7dd3fc" transform="rotate(8 96 100)">10:35</text>
    <path d="M50 160l24 -36h170l8 36z" fill="#1f2937" />
    <g fill="#9ca3af">{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <rect key={i} x={94 + i * 14} y={134} width="10" height="8" rx="2" />)}{[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => <rect key={i} x={86 + i * 15} y={148} width="11" height="8" rx="2" />)}</g>
    <ellipse cx="248" cy="150" rx="34" ry="12" fill="#c2410c" /><path d="M218 140q4 -22 30 -22t30 22z" fill="#111827" /><path d="M248 118v14" stroke="#374151" strokeWidth="2" />
  </svg>
);

const ART = { earbuds: Earbuds, kurta: Kurta, laptop: Laptop, blender: Blender, mop: Mop, workspace: Workspace };

/* ---------- Card ---------- */

function PromoCard({ card, festival, bank }) {
  const Art = card.art ? ART[card.art] : null;
  const lines = (t) => (t || "").split("\n").map((l, k) => <span key={k}>{l}<br /></span>);

  return (
    <a
      className={`pc pc--${card.theme}`}
      href={card.href || "#"}
      aria-label={`${card.title} ${card.subtitle || ""}`.trim()}
      draggable="false"
    >
      <i className="pc__spark pc__spark--a" />
      <i className="pc__spark pc__spark--b" />

      <div className="pc__head">
        {card.eyebrow && <p className="pc__eyebrow">{card.eyebrow}</p>}
        <h3 className="pc__title">{card.title}</h3>
        {card.subtitle && <p className="pc__sub">{lines(card.subtitle)}</p>}
        {card.brands?.length > 0 && (
          <div className="pc__brands">
            {card.brands.map((b) => <span key={b} className={`pc__brand pc__brand--${b.toLowerCase().replace(/[^a-z]/g, "")}`}>{b}</span>)}
          </div>
        )}
      </div>

      <div className={`pc__visual ${card.frame ? "pc__visual--frame" : ""}`}>
        <div className="pc__float">
          {card.image?.src
            ? <img src={card.image.src} alt={card.image.alt || ""} loading="lazy" draggable="false" />
            : Art && <Art />}
        </div>
      </div>

      <div className="pc__cta">
        <span className="pc__pill">{card.festivalStartsFirst ? festival.startsLabel : festival.prefix}</span>
        <div className="pc__gold">
          <strong>{festival.name}</strong>
          {!card.festivalStartsFirst && <small>{festival.startsLabel}</small>}
        </div>
      </div>

      <div className="pc__bank">
        <span className="pc__sbi">{bank.logos.map((l) => <b key={l}>{l}</b>)}</span>
        <span className="pc__offer"><strong>{bank.headline}</strong><small>{bank.details}</small></span>
      </div>

      <div className="pc__foot">
        <span>{lines(card.footnote)}</span>
        {card.sponsored && <em className="pc__spons">Sponsored ⓘ</em>}
      </div>
    </a>
  );
}

/* ---------- Carousel (one card at a time, neighbours peek) ---------- */

export default function PromoCarousel() {
  const { section, festival, bankOffer, cards } = data;
  const N = cards.length;
  const list = [...cards, ...cards, ...cards]; // 3 copies -> seamless both directions
  const ms = section.intervalMs || 2000;

  const [i, setI] = useState(N);          // start on the middle copy
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const track = useRef(null);
  const win = useRef(null);
  const touchX = useRef(null);

  useLayoutEffect(() => {
    const measure = () => {
      const k = track.current?.children;
      if (!k || k.length < 2 || !win.current) return;
      const step = k[1].offsetLeft - k[0].offsetLeft;
      const center = (win.current.clientWidth - k[0].offsetWidth) / 2;
      setOffset(center - i * step);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [i]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((p) => p + 1), ms);
    return () => clearInterval(t);
  }, [paused, ms]);

  // silently jump back into the middle copy after reaching an edge copy
  const onEnd = (e) => {
    if (e.target !== track.current) return;
    if (i >= 2 * N || i < N) { setAnimate(false); setI(i >= 2 * N ? i - N : i + N); }
  };
  useEffect(() => {
    if (animate) return;
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(r);
  }, [animate]);

  const go = (d) => setI((p) => p + d);
  const active = i % N;

  return (
    <section
      className="promo"
      data-theme={cards[active].theme}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { setPaused(true); touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        setPaused(false);
      }}
    >
      <div className="promo__glow" />
      <div className="promo__bar">
        <h2>{section.title}</h2>
        <span className="promo__count">{String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}</span>
      </div>

      <div className="promo__stage">
        <button className="promo__arrow promo__arrow--l" onClick={() => go(-1)} aria-label="Previous deal">‹</button>
        <div ref={win} className="promo__window">
          <div
            ref={track}
            className="promo__track"
            style={{ transform: `translateX(${offset}px)`, transition: animate ? undefined : "none" }}
            onTransitionEnd={onEnd}
          >
            {list.map((c, k) => (
              <div key={`${c.id}-${k}`} className={`promo__slide ${k === i ? "is-active" : ""}`} onClick={() => k !== i && setI(k)}>
                <PromoCard card={c} festival={festival} bank={bankOffer} />
              </div>
            ))}
          </div>
        </div>
        <button className="promo__arrow promo__arrow--r" onClick={() => go(1)} aria-label="Next deal">›</button>
      </div>

      <div className="promo__dots" role="tablist">
        {cards.map((c, k) => (
          <button
            key={c.id}
            role="tab"
            aria-label={`Go to ${c.id}`}
            aria-selected={active === k}
            className={active === k ? "on" : ""}
            onClick={() => setI(N + k)}
          >
            {active === k && !paused && <span key={i} style={{ animationDuration: `${ms}ms` }} />}
          </button>
        ))}
      </div>
    </section>
  );
}
