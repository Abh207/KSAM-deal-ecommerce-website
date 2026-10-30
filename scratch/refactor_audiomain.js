import fs from 'fs';

let content = fs.readFileSync('src/react/react-audio/AudioMain.jsx', 'utf8').replace(/\r\n/g, '\n');

// Replace the inline offer section
const o1 = content.indexOf('id="audio-offers"');
if (o1 !== -1) {
  const oStart = content.lastIndexOf('{currentOffer && (', o1);
  const oEnd = content.indexOf('{/* =================================================\n                SPOTLIGHT', o1);
  if (oStart !== -1 && oEnd !== -1) {
    const newOffer = `{currentOffer && (
                <AudioOfferSection
                    currentOffer={currentOffer}
                    products={products}
                    scrollToProducts={scrollToProducts}
                    getImagePath={getImagePath}
                />
            )}\n\n            `;
    content = content.substring(0, oStart) + newOffer + content.substring(oEnd);
    console.log('Successfully replaced inline offer section with AudioOfferSection');
  }
}

// Replace the inline spotlight section
const s1 = content.indexOf('className="audio-spotlight"');
if (s1 !== -1) {
  const sStart = content.lastIndexOf('{spotlightProduct && (', s1);
  const sEnd = content.indexOf('{/* =================================================\n                FEATURES', s1);
  if (sStart !== -1 && sEnd !== -1) {
    const newSpotlight = `{spotlightProduct && (
                <AudioSpotlight
                    spotlightProduct={spotlightProduct}
                    getImagePath={getImagePath}
                    addToCart={addToCart}
                    toggleWishlist={toggleWishlist}
                />
            )}\n\n            `;
    content = content.substring(0, sStart) + newSpotlight + content.substring(sEnd);
    console.log('Successfully replaced inline spotlight section with AudioSpotlight');
  }
}

// Replace the inline features section
const f1 = content.indexOf('className="audio-features"');
if (f1 !== -1) {
  const fStart = content.lastIndexOf('<section className="audio-features">', f1);
  const fEnd = content.indexOf('{/* =================================================\n                PRODUCTS', f1);
  if (fStart !== -1 && fEnd !== -1) {
    const newFeatures = `<AudioFeatures features={features} />\n\n            `;
    content = content.substring(0, fStart) + newFeatures + content.substring(fEnd);
    console.log('Successfully replaced inline features section with AudioFeatures');
  }
}

fs.writeFileSync('src/react/react-audio/AudioMain.jsx', content, 'utf8');
console.log('Saved refactored AudioMain.jsx');
