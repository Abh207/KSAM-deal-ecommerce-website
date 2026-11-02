import fs from "fs";

// 1. deals/components/dealCardV2.css
let f = "src/deals/components/dealCardV2.css";
let c = fs.readFileSync(f, "utf8");
c = c.replace(/\.deal-view-btn:hover\s*\{\s*background:\s*#8cff00;\s*color:\s*#ffffff;/g, ".deal-view-btn:hover {\n  background: #8cff00;\n  color: #050a02;");
fs.writeFileSync(f, c);

// 2. react/ProductCard.css
f = "src/react/ProductCard.css";
c = fs.readFileSync(f, "utf8");
c = c.replace(/\.beauty-view-product-btn:hover\s*\{\s*background:\s*#8cff00;\s*color:\s*#ffffff;/g, ".beauty-view-product-btn:hover {\n    background: #8cff00;\n    color: #050a02;");
fs.writeFileSync(f, c);

// 3. react/productDetail.css
f = "src/react/productDetail.css";
c = fs.readFileSync(f, "utf8");
c = c.replace(/(\.product-detail-discount-badge\s*\{[^}]+)color:\s*#ffffff;/g, "$1color: #050a02;");
c = c.replace(/(\.product-detail-save-badge\s*\{[^}]+)color:\s*#ffffff;/g, "$1color: #050a02;");
c = c.replace(/(\.related-discount-badge\s*\{[^}]+)color:\s*#ffffff;/g, "$1color: #050a02;");
c = c.replace(/(\.product-detail-add-btn\s*\{[^}]+)color:\s*#ffffff;/g, "$1color: #050a02;");
c = c.replace(/(\.mobile-sticky-btn\s*\{[^}]+)color:\s*#ffffff;/g, "$1color: #050a02;");
c = c.replace(/(\.product-detail-notfound-btn\s*\{[^}]+)color:\s*#ffffff;/g, "$1color: #050a02;");
c = c.replace(/\.product-detail-compare-buy-btn:hover\s*\{\s*background:\s*#8cff00;\s*color:\s*#ffffff;/g, ".product-detail-compare-buy-btn:hover {\n  background: #8cff00;\n  color: #050a02;");
c = c.replace(/\.related-view-btn:hover\s*\{\s*background:\s*#8cff00;\s*color:\s*#ffffff;/g, ".related-view-btn:hover {\n  background: #8cff00;\n  color: #050a02;");
c = c.replace(/(\.hero-cat-chip\.is-active\s*\{[^}]+)color:\s*#ffffff;/g, "$1color: #050a02;");
fs.writeFileSync(f, c);

// 4. react-shop/watchwishlist.css
f = "src/react-shop/watchwishlist.css";
c = fs.readFileSync(f, "utf8");
c = c.replace(/(\.ksam-wishlist-discount-pill\s*\{[^}]+)color:\s*#ffffff;/g, "$1color: #050a02;");
fs.writeFileSync(f, c);

// 5. HTML files
["audio.html", "index.html", "product.html", "shop.html"].forEach(html => {
  let hc = fs.readFileSync(html, "utf8");
  hc = hc.replace(/background:#8cff00;color:#fff;/g, "background:#8cff00;color:#050a02;");
  fs.writeFileSync(html, hc);
});

console.log("Contrast updates successfully executed!");

