import { useEffect, useRef, useState } from "react";
import { BASE } from "./useHeroHead.js";

export const INLINE_PRODUCTS = [
  { id: "prod-iphone-blue", name: "iPhone 15 Pro Blue Titanium", category: "Flagship Mobile", image: "assets/products/iphone-blue.png", oldPrice: "$1,199", price: "$799", discount: "-33%", rating: "4.9", accent: "blue", row: 1 },
  { id: "prod-iphone-white", name: "iPhone 15 Pro White Titanium", category: "Flagship Mobile", image: "assets/products/iphone-white.png", oldPrice: "$1,199", price: "$799", discount: "-33%", rating: "4.9", accent: "green", row: 2 },
  { id: "prod-01", name: "AeroGlide Carbon Pro Mouse", category: "Gaming Gear", image: "assets/products/mouse-01.webp", oldPrice: "$89", price: "$49", discount: "-45%", rating: "4.9", accent: "green", row: 1 },
  { id: "prod-02", name: "SoundCore Pulse Active Earbuds", category: "Audio", image: "assets/products/earbuds-01.webp", oldPrice: "$129", price: "$69", discount: "-47%", rating: "4.8", accent: "blue", row: 1 },
  { id: "prod-03", name: "VaporLite 65W GaN Charger", category: "Mobile Power", image: "assets/products/charger-01.webp", oldPrice: "$59", price: "$29", discount: "-51%", rating: "4.9", accent: "yellow", row: 1 },
  { id: "prod-04", name: "NovaMech 75% Keyboard", category: "Desk Setup", image: "assets/products/keyboard-01.webp", oldPrice: "$159", price: "$89", discount: "-44%", rating: "4.9", accent: "green", row: 1 },
  { id: "prod-05", name: "ViewSonic 27\" 4K Studio Display", category: "Computing", image: "assets/products/display-01.webp", oldPrice: "$499", price: "$299", discount: "-40%", rating: "4.8", accent: "blue", row: 1 },
  { id: "prod-06", name: "Phantom X 4K Foldable Drone", category: "Drones", image: "assets/products/drone-01.webp", oldPrice: "$399", price: "$219", discount: "-45%", rating: "4.7", accent: "yellow", row: 1 },
  { id: "prod-07", name: "BionicFit Health Ring Gen 2", category: "Wearables", image: "assets/products/ring-01.webp", oldPrice: "$229", price: "$139", discount: "-39%", rating: "4.9", accent: "green", row: 1 },
  { id: "prod-08", name: "HyperDrive 1TB Rugged NVMe", category: "Storage", image: "assets/products/ssd-01.webp", oldPrice: "$149", price: "$79", discount: "-47%", rating: "4.9", accent: "blue", row: 1 },
  { id: "prod-09", name: "PrismLens 4K Mirrorless", category: "Cameras", image: "assets/products/camera-01.webp", oldPrice: "$649", price: "$419", discount: "-35%", rating: "4.8", accent: "yellow", row: 1 },
  { id: "prod-10", name: "PulseArc 10K Magnetic Power", category: "Mobile Power", image: "assets/products/powerbank-01.webp", oldPrice: "$69", price: "$34", discount: "-51%", rating: "4.9", accent: "green", row: 1 },
  { id: "prod-11", name: "Apex Elite Spatial Headset", category: "Gaming Gear", image: "assets/products/headset-01.webp", oldPrice: "$179", price: "$94", discount: "-47%", rating: "4.9", accent: "blue", row: 2 },
  { id: "prod-12", name: "Zenith Desktop Air Purifier", category: "Smart Home", image: "assets/products/air-01.webp", oldPrice: "$119", price: "$64", discount: "-46%", rating: "4.8", accent: "yellow", row: 2 },
  { id: "prod-13", name: "OmniPad Pro 12.9 with Stylus", category: "Tablets", image: "assets/products/tablet-01.webp", oldPrice: "$699", price: "$449", discount: "-36%", rating: "4.9", accent: "green", row: 2 },
  { id: "prod-14", name: "EchoSphere 360 Spatial Hi-Fi", category: "Audio", image: "assets/products/speaker-01.webp", oldPrice: "$189", price: "$99", discount: "-48%", rating: "4.8", accent: "blue", row: 2 },
  { id: "prod-15", name: "Lumina ScreenBar Pro Ambient", category: "Desk Setup", image: "assets/products/lightbar-01.webp", oldPrice: "$79", price: "$39", discount: "-51%", rating: "4.9", accent: "yellow", row: 2 },
  { id: "prod-16", name: "StreamCast 4K Ultra Wide", category: "Streaming", image: "assets/products/webcam-01.webp", oldPrice: "$139", price: "$69", discount: "-50%", rating: "4.8", accent: "green", row: 2 },
  { id: "prod-17", name: "TactileWave Haptic VR Grip", category: "Gaming Gear", image: "assets/products/vr-01.webp", oldPrice: "$109", price: "$59", discount: "-46%", rating: "4.7", accent: "blue", row: 2 },
  { id: "prod-18", name: "ThermalGuard MagSafe Cooler", category: "Mobile Power", image: "assets/products/cooler-01.webp", oldPrice: "$49", price: "$24", discount: "-51%", rating: "4.9", accent: "yellow", row: 2 },
  { id: "prod-19", name: "CoreShift Pro RGB Topo Mat", category: "Desk Setup", image: "assets/products/deskmat-01.webp", oldPrice: "$45", price: "$22", discount: "-51%", rating: "4.8", accent: "green", row: 2 },
  { id: "prod-20", name: "VibeTune XLR/USB Studio Mic", category: "Audio", image: "assets/products/mic-01.webp", oldPrice: "$169", price: "$89", discount: "-47%", rating: "4.9", accent: "blue", row: 2 }
];

export function useMarquee() {
  const [products, setProducts] = useState(INLINE_PRODUCTS);
  const track1Ref = useRef(null);
  const track2Ref = useRef(null);

  const isHoveringRow1Ref = useRef(false);
  const isHoveringRow2Ref = useRef(false);

  useEffect(() => {
    let active = true;
    const viteBase = typeof import.meta !== "undefined" && import.meta.env?.BASE_URL && import.meta.env.BASE_URL !== "/"
      ? import.meta.env.BASE_URL.replace(/\/+$/, "")
      : "";
    const fetchUrl = `${viteBase}${BASE}data/products.json`.replace(/\/+/g, "/");

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (active && data && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {
        // Fallback already in initial state
      });

    return () => {
      active = false;
    };
  }, []);

  // Split into Row 1 and Row 2
  const row1Items = products.filter((p, i) => (p.row ? p.row === 1 : i % 2 === 0));
  const row2Items = products.filter((p, i) => (p.row ? p.row === 2 : i % 2 !== 0));

  // Quadruple items to make infinite marquee loop seamless
  const repeatedRow1 = [...row1Items, ...row1Items, ...row1Items, ...row1Items];
  const repeatedRow2 = [...row2Items, ...row2Items, ...row2Items, ...row2Items];

  useEffect(() => {
    let marqueePos1 = 0;
    let marqueePos2 = 0;
    let halfWidth1 = 0;
    let halfWidth2 = 0;
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;
    let scrollTimeout = null;
    let animId = null;

    function recalculateWidths() {
      if (track1Ref.current) {
        halfWidth1 = track1Ref.current.scrollWidth / 2;
        if (marqueePos1 === 0 && halfWidth1 > 0) marqueePos1 = -halfWidth1;
        else if (halfWidth1 > 0 && Math.abs(marqueePos1) > halfWidth1) {
          marqueePos1 = -(Math.abs(marqueePos1) % halfWidth1);
        }
      }
      if (track2Ref.current) {
        halfWidth2 = track2Ref.current.scrollWidth / 2;
        if (halfWidth2 > 0 && Math.abs(marqueePos2) > halfWidth2) {
          marqueePos2 = -(Math.abs(marqueePos2) % halfWidth2);
        }
      }
    }

    recalculateWidths();
    window.addEventListener("resize", recalculateWidths);
    window.addEventListener("load", recalculateWidths);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(recalculateWidths);
    }

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      scrollVelocity = Math.abs(currentScrollY - lastScrollY);
      lastScrollY = currentScrollY;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollVelocity = 0;
      }, 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    function marqueeLoop() {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) {
        animId = requestAnimationFrame(marqueeLoop);
        return;
      }

      let speed1 = isHoveringRow1Ref.current ? 0.35 : 1.1;
      let speed2 = isHoveringRow2Ref.current ? 0.35 : 1.1;

      if (scrollVelocity > 0) {
        const boost = Math.min(scrollVelocity * 0.12, 5.0);
        speed1 += boost;
        speed2 += boost;
      }

      if (track1Ref.current && halfWidth1 > 0) {
        marqueePos1 += speed1;
        if (marqueePos1 >= 0) marqueePos1 = -halfWidth1;
        track1Ref.current.style.transform = `translate3d(${marqueePos1}px, 0, 0)`;
      }

      if (track2Ref.current && halfWidth2 > 0) {
        marqueePos2 -= speed2;
        if (Math.abs(marqueePos2) >= halfWidth2) marqueePos2 = 0;
        track2Ref.current.style.transform = `translate3d(${marqueePos2}px, 0, 0)`;
      }

      animId = requestAnimationFrame(marqueeLoop);
    }

    animId = requestAnimationFrame(marqueeLoop);

    return () => {
      window.removeEventListener("resize", recalculateWidths);
      window.removeEventListener("load", recalculateWidths);
      window.removeEventListener("scroll", onScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [products]);

  return {
    track1Ref,
    track2Ref,
    repeatedRow1,
    repeatedRow2,
    isHoveringRow1Ref,
    isHoveringRow2Ref
  };
}
