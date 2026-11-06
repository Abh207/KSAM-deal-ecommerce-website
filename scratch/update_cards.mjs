import fs from 'fs';

let content = fs.readFileSync('src/react/headerFile/HorizontalProducts.css', 'utf8');

const sMarker = '/* =========================================================\r\n   PRODUCT CARD';
const sMarkerUnix = '/* =========================================================\n   PRODUCT CARD';
let sIdx = content.indexOf(sMarker);
if (sIdx === -1) sIdx = content.indexOf(sMarkerUnix);

const eMarker = '/* =========================================================\r\n   STATUS';
const eMarkerUnix = '/* =========================================================\n   STATUS';
let eIdx = content.indexOf(eMarker);
if (eIdx === -1) eIdx = content.indexOf(eMarkerUnix);

console.log('sIdx:', sIdx, 'eIdx:', eIdx);

const newBlock = `/* =========================================================
   PRODUCT CARD (IMAGE 5 FRESH LIME-GREEN THEME)
========================================================= */

:root {
    --card-green-1: #D9FBA8;
    --card-green-2: #B6F26B;
    --card-green-3: #8EE63C;
}

.horizontal-product-card {
    flex: 0 0 380px;
    min-width: 380px;
    position: relative;
    background: linear-gradient(160deg, var(--card-green-1, #D9FBA8) 0%, var(--card-green-2, #B6F26B) 55%, var(--card-green-3, #8EE63C) 100%);
    border: 1px solid rgba(11, 90, 18, 0.22);
    border-radius: 18px;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(7, 61, 14, 0.12);
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease,
        border-color 0.3s ease;
}

/* Subtle organic wave decoration using CSS/SVG pseudo-element at low opacity */
.horizontal-product-card::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 70px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 380 70' preserveAspectRatio='none'%3E%3Cpath d='M0,45 C90,15 190,65 290,30 C330,15 360,25 380,20 L380,70 L0,70 Z' fill='%236FD32F' fill-opacity='0.22'/%3E%3Cpath d='M0,55 C80,35 170,68 270,42 C330,28 365,48 380,38 L380,70 L0,70 Z' fill='%234EA81D' fill-opacity='0.16'/%3E%3C/svg%3E");
    background-size: cover;
    background-position: bottom;
    pointer-events: none;
    z-index: 1;
}

.horizontal-product-card:hover {
    transform: translateY(-8px);
    border-color: var(--hover-lightgreen, #A8F56B);
    box-shadow:
        0 0 0 1px rgba(var(--hover-lightgreen-rgb, 168, 245, 107), 0.55),
        0 18px 45px rgba(7, 61, 14, 0.25);
}

/* =========================================================
   IMAGE AREA (LIGHTER GREEN TINT OVER GRADIENT)
========================================================= */

.horizontal-product-image {
    height: 225px;
    background: rgba(255, 255, 255, 0.42);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-bottom: 1px solid rgba(11, 90, 18, 0.12);
}

.horizontal-product-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 22px;
    filter: drop-shadow(0 10px 18px rgba(7, 61, 14, 0.2));
    transition:
        transform 0.4s ease,
        opacity 0.3s ease;
}

.horizontal-product-card:hover .horizontal-product-image img {
    transform: scale(1.08);
}

/* =========================================================
   DISCOUNT CHIP & BADGE
========================================================= */

.horizontal-discount {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 2;
    padding: 6px 10px;
    border-radius: 6px;
    background: #0B5A12;
    color: #ffffff;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.02em;
    box-shadow: 0 2px 8px rgba(7, 61, 14, 0.3);
}

.horizontal-badge {
    position: absolute;
    top: 12px;
    right: 56px;
    z-index: 2;
    padding: 6px 9px;
    border-radius: 6px;
    background: #0B6A12;
    color: #ffffff;
    font-size: 10px;
    font-weight: 800;
    box-shadow: 0 2px 8px rgba(7, 61, 14, 0.25);
}

/* Wishlist Heart Button on Card */
.horizontal-card-wishlist-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 5;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #0B5A12;
    border: 1px solid rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #ffffff;
    font-size: 16px;
    line-height: 1;
    box-shadow: 0 4px 14px rgba(7, 61, 14, 0.3);
    transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
}

.horizontal-card-wishlist-btn:hover {
    background: var(--hover-lightgreen, #A8F56B);
    color: #073D0E;
    border-color: var(--hover-lightgreen, #A8F56B);
    transform: scale(1.1);
    box-shadow: 0 0 16px rgba(168, 245, 107, 0.45);
}

.horizontal-card-wishlist-btn.is-active {
    background: #0B6A12;
    color: #ff4757;
}

/* =========================================================
   INFORMATION
========================================================= */

.horizontal-product-info {
    padding: 18px;
    position: relative;
    z-index: 2;
}

.horizontal-category {
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #2E7D12;
}

.horizontal-product-info h3 {
    margin: 8px 0;
    color: #073D0E;
    font-size: 17px;
    font-weight: 800;
    line-height: 1.35;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* =========================================================
   RATING
========================================================= */

.horizontal-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #1A5412;
    font-weight: 700;
}

.horizontal-rating span {
    font-size: 14px;
    color: #f59e0b;
}

.horizontal-rating small {
    color: #2E7D12;
    font-weight: 600;
}

/* =========================================================
   PRICE
========================================================= */

.horizontal-price {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
}

.horizontal-price strong {
    font-size: 20px;
    font-weight: 900;
    color: #073D0E;
}

.horizontal-price del {
    font-size: 13px;
    color: #3D7A27;
    opacity: 0.85;
    font-weight: 600;
}

/* =========================================================
   CART BUTTON ("+ ADD TO CART")
========================================================= */

.horizontal-product-info button {
    width: 100%;
    margin-top: 14px;
    padding: 12px;
    border: none;
    border-radius: 9px;
    background: #0B5A12;
    color: #ffffff;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.06em;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(11, 90, 18, 0.28);
    transition: transform 0.22s ease, background-color 0.22s ease, box-shadow 0.22s ease, color 0.22s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    position: relative;
    z-index: 2;
}

.horizontal-product-info button:hover:not(:disabled) {
    background: var(--hover-lightgreen, #A8F56B);
    color: #073D0E;
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(11, 90, 18, 0.35);
}

.horizontal-product-info button:disabled {
    background: #4a6645;
    color: rgba(255, 255, 255, 0.6);
    cursor: not-allowed;
    box-shadow: none;
}

`;

if (sIdx !== -1 && eIdx !== -1) {
  content = content.substring(0, sIdx) + newBlock + content.substring(eIdx);
  fs.writeFileSync('src/react/headerFile/HorizontalProducts.css', content, 'utf8');
  console.log('Successfully updated HorizontalProducts.css!');
} else {
  console.error('Indices not found!', sIdx, eIdx);
}

