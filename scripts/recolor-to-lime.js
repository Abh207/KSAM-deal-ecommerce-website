import fs from "fs";
import path from "path";

const DESIGN_TOKENS = `
:root {
  --accent: #8cff00;
  --accent-strong: #9dff1a;
  --accent-soft: rgba(140, 255, 0, 0.14);
  --accent-glow: rgba(140, 255, 0, 0.40);
  --accent-on-light: #448000;
  --on-accent: #050a02;
}
`;

// Replacements map
const REPLACEMENTS = [
  // Exact hex replacements
  { regex: /#16a34a/gi, replace: "#448000" }, // dark green -> dark lime for light bg readability
  { regex: /#15803d/gi, replace: "#3f7800" }, // darker green -> dark lime
  { regex: /#22c55e/gi, replace: "#8cff00" }, // vibrant green -> neon lime
  { regex: /#22ff88/gi, replace: "#8cff00" }, // bright cyan-green -> neon lime
  { regex: /#4ade80/gi, replace: "#8cff00" }, // light green -> neon lime
  { regex: /#86efac/gi, replace: "#a8ff3e" }, // pastel green -> pastel lime
  { regex: /#dcfce7/gi, replace: "rgba(140, 255, 0, 0.14)" }, // light green fill -> soft lime
  { regex: /#bbf7d0/gi, replace: "rgba(140, 255, 0, 0.35)" }, // light green border -> soft lime border
  { regex: /#4dffa3/gi, replace: "#b5ff4d" }, // speed line green -> lime
  { regex: /#16c86b/gi, replace: "#70d900" }, // logo mid green -> lime
  { regex: /#0e9f55/gi, replace: "#448000" }, // logo dark green -> dark lime

  // RGBA replacements
  { regex: /rgba\(\s*34\s*,\s*197\s*,\s*94\s*,\s*([0-9.]+)\s*\)/gi, replace: "rgba(140, 255, 0, $1)" },
  { regex: /rgba\(\s*22\s*,\s*163\s*,\s*74\s*,\s*([0-9.]+)\s*\)/gi, replace: "rgba(140, 255, 0, $1)" },
  { regex: /rgba\(\s*34\s*,\s*255\s*,\s*136\s*,\s*([0-9.]+)\s*\)/gi, replace: "rgba(140, 255, 0, $1)" },
  { regex: /rgba\(\s*74\s*,\s*222\s*,\s*128\s*,\s*([0-9.]+)\s*\)/gi, replace: "rgba(140, 255, 0, $1)" },
  { regex: /rgba\(\s*77\s*,\s*255\s*,\s*163\s*,\s*([0-9.]+)\s*\)/gi, replace: "rgba(181, 255, 77, $1)" },
  { regex: /rgba\(\s*220\s*,\s*252\s*,\s*231\s*,\s*([0-9.]+)\s*\)/gi, replace: "rgba(140, 255, 0, 0.14)" },
  { regex: /rgba\(\s*187\s*,\s*247\s*,\s*208\s*,\s*([0-9.]+)\s*\)/gi, replace: "rgba(140, 255, 0, 0.35)" }
];

const TARGET_FILES = [
  "src/style.css",
  "src/deals/components/Navbar.css",
  "src/deals/components/Navbar.jsx",
  "src/deals/components/dealCardV2.css",
  "src/deals/components/ProductCard.jsx",
  "src/deals/deals.css",
  "src/deals/components/featuredDeals.css",
  "src/deals/components/HeroHead/heroHead.css",
  "src/deals/components/KsamPreloader.css",
  "src/deals/responsive-cards.css",
  "src/react/ProductCard.css",
  "src/react/productDetail.css",
  "src/react/ProductListVideoHeader.jsx",
  "src/react/TrendingDealsCarousel.jsx",
  "src/react/headerFile/homeProducts.css",
  "src/react/headerFile/PocketFriendlyStores.css",
  "src/react/headerFile/ProductsHeroVideo.css",
  "src/react/headerFile/Testimonials.css",
  "src/react-shop/ShopProductCard.css",
  "src/react-shop/watch-components/ProductCard.css",
  "src/react-shop/watchshopApp.css",
  "src/react-shop/watchwishlist.css",
  "src/profile/kx-spotlight.css",
  "src/profile/profile.css",
  "src/styles/kx-faq.css",
  "src/styles/kx-pages.css",
  "product.html",
  "deals.html",
  "shop.html",
  "index.html",
  "login.html",
  "signUp.html"
];

let changedCount = 0;

for (const relPath of TARGET_FILES) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, "utf8");
  let modified = false;

  for (const { regex, replace } of REPLACEMENTS) {
    if (regex.test(content)) {
      content = content.replace(regex, replace);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`Updated: ${relPath}`);
    changedCount++;
  }
}

console.log(`Successfully updated ${changedCount} files with new neon lime tokens!`);

