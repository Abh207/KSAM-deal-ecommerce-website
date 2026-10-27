const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Pre-seed localStorage with diverse items so we see cards in all states
  await page.goto('http://localhost:5175/KSAM-deal-ecommerce-website/watchwishlist.html', {
    waitUntil: 'networkidle2'
  });

  await page.evaluate(() => {
    const sampleItems = [
      {
        id: 'watch-1',
        name: 'Classic Leather Watch',
        category: 'Watches',
        price: 3499,
        originalPrice: 4499,
        image: 'products/watch1.png',
        rating: 4.8,
        colors: [
          { hex: '#15803d' },
          { hex: '#111111' },
          { hex: '#a3a3a3' }
        ]
      },
      {
        id: 'watch-2',
        name: 'Rolex Submariner Date 41mm Oystersteel',
        category: 'Watches',
        price: 14200,
        originalPrice: 18200,
        image: 'products/watch2.png',
        rating: 4.8,
        colors: [
          { hex: '#15803d' },
          { hex: '#111111' },
          { hex: '#a3a3a3' }
        ]
      },
      {
        id: 'watch-3',
        name: 'Audemars Piguet Royal Oak Chronograph Steel',
        category: 'Watches',
        price: 32500,
        originalPrice: 38000,
        image: 'products/watch3.png',
        rating: 4.9,
        colors: [
          { hex: '#15803d' },
          { hex: '#111111' },
          { hex: '#a3a3a3' }
        ]
      },
      {
        id: 'watch-4',
        name: 'Omega Speedmaster Professional Moonwatch',
        category: 'Watches',
        price: 7600,
        originalPrice: 9200,
        image: 'products/watch4.png',
        rating: 4.7,
        colors: [
          { hex: '#15803d' },
          { hex: '#111111' },
          { hex: '#a3a3a3' }
        ]
      }
    ];

    localStorage.setItem('ksam_wishlist', JSON.stringify(sampleItems));
    window.dispatchEvent(new Event('storage'));
  });

  // Reload to reflect seeded wishlist
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // 1. Desktop screenshot
  await page.setViewport({ width: 1440, height: 1100 });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, 'wishlist-cards-desktop.png') });
  console.log('Saved wishlist-cards-desktop.png');

  // 2. Single Card Zoomed screenshot
  const firstCard = await page.$('.ksam-wishlist-card');
  if (firstCard) {
    await firstCard.screenshot({ path: path.join(__dirname, 'wishlist-single-card.png') });
    console.log('Saved wishlist-single-card.png');
  }

  // 3. Test Swatch Click
  const swatches = await page.$$('.ksam-wishlist-swatch');
  if (swatches.length >= 2) {
    await swatches[1].click(); // click 2nd swatch
    await new Promise(r => setTimeout(r, 300));
    console.log('Clicked 2nd color swatch');
  }

  // 4. Test Add To Cart Click
  const cartBtn = await page.$('.ksam-wishlist-cart-btn');
  if (cartBtn) {
    await cartBtn.click();
    await new Promise(r => setTimeout(r, 500));
    console.log('Clicked cart button');
    await page.screenshot({ path: path.join(__dirname, 'wishlist-card-toast.png') });
    console.log('Saved wishlist-card-toast.png');
  }

  // 5. Tablet Screenshot
  await page.setViewport({ width: 820, height: 1180 });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, 'wishlist-cards-tablet.png') });
  console.log('Saved wishlist-cards-tablet.png');

  // 6. Mobile Screenshot (390px)
  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, 'wishlist-cards-mobile.png') });
  
  await page.evaluate(() => {
    document.querySelector('.ksam-wishlist-grid')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, 'wishlist-cards-mobile-scrolled.png') });
  console.log('Saved wishlist-cards-mobile-scrolled.png');

  await browser.close();
  console.log('Puppeteer test finished successfully.');
})();
