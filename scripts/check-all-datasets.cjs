const fs = require('fs');
const path = require('path');

const files = [
  'watch-products.json',
  'shoes-products.json',
  'featured-shoes.json',
  'clothesproducts.json',
  'audio-products.json',
  'moreChairProdjn.json',
  'beautyProducts.json',
  'products.json',
  'headerproducts.json'
];

files.forEach(f => {
  const p = path.join(__dirname, '../src/api', f);
  if (fs.existsSync(p)) {
    try {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      const count = Array.isArray(data) ? data.length : (data.products?.length || 'obj');
      const sample = Array.isArray(data) ? data[0] : (data.products ? data.products[0] : null);
      console.log(`${f}: ${count} items. Sample keys:`, sample ? Object.keys(sample).slice(0, 6) : 'none');
      if (sample) {
        console.log(`   Sample name: ${sample.name || sample.title || sample.productName}, img: ${sample.image || sample.imageUrl || sample.img}`);
      }
    } catch(e) {
      console.log(`${f}: error reading - ${e.message}`);
    }
  } else {
    console.log(`${f}: NOT FOUND`);
  }
});
