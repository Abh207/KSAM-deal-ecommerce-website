const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const sampleWishlist = [
  {
    id: 1,
    name: "Rolex Submariner Date",
    category: "Sport Watches",
    price: 14500,
    oldPrice: 16500,
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
    rating: 4.9
  },
  {
    id: 2,
    name: "Omega Speedmaster Moonwatch",
    category: "Sport Watches",
    price: 7600,
    oldPrice: 8900,
    image: "https://images.unsplash.com/photo-1547996160-71dfabb1a7b1?auto=format&fit=crop&w=600&q=80",
    rating: 4.8
  },
  {
    id: 3,
    name: "Patek Philippe Calatrava",
    category: "Men's Watches",
    price: 28000,
    oldPrice: 32000,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80",
    rating: 5.0
  },
  {
    id: 4,
    name: "AirPods Max Space Gray",
    category: "Gadgets",
    price: 549,
    oldPrice: 599,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
    rating: 4.7
  },
  {
    id: 5,
    name: "Seiko Prospex Diver",
    category: "Watches",
    price: 450,
    oldPrice: 550,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80",
    rating: 4.6
  }
];

async function runTests() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const outDir = path.resolve(__dirname, 'test_screens');
  fs.mkdirSync(outDir, { recursive: true });

  const page = await browser.newPage();

  // Listen to console errors and network failures
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console error: ${msg.text()}`);
    }
  });
  page.on('requestfailed', req => {
    errors.push(`Request failed: ${req.url()} (${req.failure().errorText})`);
  });

  // 1. Setup wishlist in localStorage
  await page.goto('http://localhost:5175/KSAM-deal-ecommerce-website/watchwishlist.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate((items) => {
    localStorage.setItem('ksam_wishlist', JSON.stringify(items));
  }, sampleWishlist);

  // Reload to pick up seeded wishlist
  await page.goto('http://localhost:5175/KSAM-deal-ecommerce-website/watchwishlist.html', { waitUntil: 'networkidle0' });

  // 2. Desktop Screenshot (1440px)
  await page.setViewport({ width: 1440, height: 900 });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'wishlist_desktop_1440.png'), fullPage: false });
  console.log('Saved wishlist_desktop_1440.png');

  // Check header text & filter chips
  const headerInfo = await page.evaluate(() => {
    const title = document.querySelector('.ksam-wishlist-banner-title')?.innerText;
    const sub = document.querySelector('.ksam-wishlist-banner-subtitle')?.innerText;
    const chips = Array.from(document.querySelectorAll('.ksam-wishlist-chip')).map(c => c.innerText.replace(/\n/g, ' '));
    const clearBtn = document.querySelector('.ksam-wishlist-clear-btn')?.innerText;
    const cardCount = document.querySelectorAll('.ksam-wishlist-card').length;
    return { title, sub, chips, clearBtn, cardCount };
  });
  console.log('Header Info:', headerInfo);

  // 3. Mobile Screenshot (375px)
  await page.setViewport({ width: 375, height: 812, isMobile: true });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'wishlist_mobile_375.png'), fullPage: false });
  console.log('Saved wishlist_mobile_375.png');

  // 4. Test 4 Different Products details pages
  await page.setViewport({ width: 1440, height: 900 });
  const testIds = [
    { id: '1', category: 'Sport Watches' },
    { id: '4', category: 'Gadgets' },
    { id: '3', category: "Men's Watches" },
    { id: '5', category: 'Watches' }
  ];

  const productDataExtracted = [];
  for (let i = 0; i < testIds.length; i++) {
    const { id, category } = testIds[i];
    const url = `http://localhost:5175/KSAM-deal-ecommerce-website/product.html?id=${id}&category=${encodeURIComponent(category)}`;
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    const pInfo = await page.evaluate(() => {
      const title = document.querySelector('.product-detail-title')?.innerText;
      const price = document.querySelector('.product-detail-current-price')?.innerText;
      const desc = document.querySelector('.product-detail-desc')?.innerText;
      const features = Array.from(document.querySelectorAll('.product-detail-features-list li')).map(li => li.innerText);
      const specs = Array.from(document.querySelectorAll('.product-detail-spec-row')).map(r => r.innerText.replace(/\n/g, ': '));
      const relatedCount = document.querySelectorAll('.product-detail-related-card').length;
      return { title, price, desc, features, specs, relatedCount };
    });

    productDataExtracted.push(pInfo);
    await page.screenshot({ path: path.join(outDir, `product_${id}_detail.png`), fullPage: false });
    console.log(`Saved product_${id}_detail.png - Title: "${pInfo.title}" Price: ${pInfo.price}`);
  }

  // 5. Test Invalid ID
  await page.goto('http://localhost:5175/KSAM-deal-ecommerce-website/product.html?id=999999', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, 'product_invalid_id.png') });
  console.log('Saved product_invalid_id.png');

  // 6. Test Mobile Product details
  await page.setViewport({ width: 375, height: 812, isMobile: true });
  await page.goto(`http://localhost:5175/KSAM-deal-ecommerce-website/product.html?id=1&category=Sport%20Watches`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, 'product_mobile_detail.png'), fullPage: false });
  console.log('Saved product_mobile_detail.png');

  console.log('\n--- VERIFICATION REPORT ---');
  console.log('Errors caught:', errors);
  console.log('Products unique descriptions:');
  productDataExtracted.forEach((p, idx) => {
    console.log(`\nProduct ${idx + 1}: ${p.title}`);
    console.log(`Description: ${p.desc}`);
    console.log(`Features count: ${p.features.length}`);
    console.log(`Specs count: ${p.specs.length}`);
    console.log(`Related products count: ${p.relatedCount}`);
  });

  await browser.close();
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
