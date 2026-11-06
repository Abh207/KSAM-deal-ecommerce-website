import fs from 'fs';

let content = fs.readFileSync('src/react/headerFile/FlashDeals.css', 'utf8');

const sMarker = '/* =========================================================\r\n   CARD\r\n========================================================= */';
const sMarkerUnix = '/* =========================================================\n   CARD\n========================================================= */';
let sIdx = content.indexOf(sMarker);
if (sIdx === -1) sIdx = content.indexOf(sMarkerUnix);

const eMarker = '/* =========================================================\r\n   FOOTER\r\n========================================================= */';
const eMarkerUnix = '/* =========================================================\n   FOOTER\n========================================================= */';
let eIdx = content.indexOf(eMarker);
if (eIdx === -1) eIdx = content.indexOf(eMarkerUnix);

console.log('FlashDeals sIdx:', sIdx, 'eIdx:', eIdx);

const newBlock = `/* =========================================================
   CARD (IMAGE 5 FRESH LIME-GREEN THEME)
========================================================= */

.flash-deal-card {
    background: linear-gradient(160deg, var(--card-green-1, #D9FBA8) 0%, var(--card-green-2, #B6F26B) 55%, var(--card-green-3, #8EE63C) 100%);
    color: #073D0E;
    border: 1px solid rgba(11, 90, 18, 0.22);
    border-radius: 18px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    box-shadow: 0 8px 24px rgba(7, 61, 14, 0.12);
    transform: translateY(25px);
    opacity: 0;
    animation: flashCardIn 0.6s ease forwards;
    animation-delay: calc(var(--flash-index) * 0.08s);
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

/* Subtle organic wave decoration */
.flash-deal-card::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 380 60' preserveAspectRatio='none'%3E%3Cpath d='M0,35 C90,15 190,55 290,25 C330,12 360,22 380,18 L380,60 L0,60 Z' fill='%236FD32F' fill-opacity='0.2'/%3E%3Cpath d='M0,45 C80,28 170,58 270,35 C330,22 365,40 380,30 L380,60 L0,60 Z' fill='%234EA81D' fill-opacity='0.14'/%3E%3C/svg%3E");
    background-size: cover;
    background-position: bottom;
    pointer-events: none;
    z-index: 1;
}

.flash-deal-card:hover {
    transform: translateY(-8px);
    border-color: var(--hover-lightgreen, #A8F56B);
    box-shadow:
        0 0 0 1px rgba(var(--hover-lightgreen-rgb, 168, 245, 107), 0.55),
        0 18px 40px rgba(7, 61, 14, 0.25);
}

/* =========================================================
   CARD IMAGE (LIGHTER GREEN TINT OVER GRADIENT)
========================================================= */

.flash-deal-image {
    height: 210px;
    background: rgba(255, 255, 255, 0.42);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    border-bottom: 1px solid rgba(11, 90, 18, 0.12);
}

.flash-deal-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 20px;
    filter: drop-shadow(0 10px 18px rgba(7, 61, 14, 0.2));
    transition: transform 0.4s ease;
}

.flash-deal-card:hover .flash-deal-image img {
    transform: scale(1.08);
}

/* =========================================================
   DEAL TAG & DISCOUNT
========================================================= */

.flash-deal-tag {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 2;
    background: #0B5A12;
    color: #ffffff;
    padding: 6px 9px;
    border-radius: 6px;
    font-size: 9px;
    font-weight: 900;
    box-shadow: 0 2px 8px rgba(7, 61, 14, 0.25);
}

.flash-deal-discount {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 2;
    background: #0B5A12;
    color: #ffffff;
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 900;
    box-shadow: 0 2px 8px rgba(7, 61, 14, 0.3);
}

/* =========================================================
   INFO
========================================================= */

.flash-deal-info {
    padding: 17px;
    position: relative;
    z-index: 2;
}

.flash-deal-category {
    font-size: 9px;
    text-transform: uppercase;
    font-weight: 900;
    letter-spacing: 1.2px;
    color: #2E7D12;
}

.flash-deal-info h3 {
    margin: 7px 0;
    font-size: 15px;
    font-weight: 800;
    color: #073D0E;
    line-height: 1.35;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* =========================================================
   RATING
========================================================= */

.flash-deal-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #1A5412;
    font-weight: 700;
}

.flash-deal-rating span {
    color: #f59e0b;
    font-size: 13px;
}

.flash-deal-rating small {
    color: #2E7D12;
    font-weight: 600;
}

/* =========================================================
   PRICE
========================================================= */

.flash-deal-price {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
}

.flash-deal-price strong {
    font-size: 19px;
    font-weight: 900;
    color: #073D0E;
}

.flash-deal-price del {
    font-size: 11px;
    color: #3D7A27;
    opacity: 0.85;
    font-weight: 600;
}

/* =========================================================
   BOTTOM & ACTION BUTTON
========================================================= */

.flash-deal-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 13px;
}

.flash-stock {
    font-size: 9px;
    font-weight: 800;
    color: #14631C;
}

.flash-deal-bottom button {
    border: none;
    background: #0B5A12;
    color: #ffffff;
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.05em;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(11, 90, 18, 0.28);
    transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
}

.flash-deal-bottom button:hover {
    background: var(--hover-lightgreen, #A8F56B);
    color: #073D0E;
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(11, 90, 18, 0.35);
}

`;

if (sIdx !== -1 && eIdx !== -1) {
  content = content.substring(0, sIdx) + newBlock + content.substring(eIdx);
  fs.writeFileSync('src/react/headerFile/FlashDeals.css', content, 'utf8');
  console.log('Successfully updated FlashDeals.css!');
} else {
  console.error('Could not find FlashDeals indices!', sIdx, eIdx);
}
