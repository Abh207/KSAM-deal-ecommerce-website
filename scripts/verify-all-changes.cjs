const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5175/KSAM-deal-ecommerce-website/';
const SCREENSHOT_DIR = path.resolve(__dirname, '../dist/test-screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Wishlist Page (Desktop 1440x900)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 1: Wishlist Page Desktop Layout ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}watchwishlist.html`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.ksam-wishlist-card', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 600));

    // Measure cards
    const cardInfo = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.ksam-wishlist-card'));
      const grid = document.querySelector('.ksam-wishlist-grid');
      const gridStyles = grid ? window.getComputedStyle(grid) : null;
      const gridCols = gridStyles ? gridStyles.getPropertyValue('grid-template-columns').split(' ').length : 0;

      const firstCard = cards[0];
      if (!firstCard) return { count: 0 };
      const cardRect = firstCard.getBoundingClientRect();
      const img = firstCard.querySelector('.ksam-wishlist-card-image img');
      const imgWrap = firstCard.querySelector('.ksam-wishlist-card-image');
      const title = firstCard.querySelector('.ksam-wishlist-card-title');
      const viewBtn = firstCard.querySelector('.ksam-wishlist-view-btn');
      const cartBtn = firstCard.querySelector('.ksam-wishlist-cart-btn');

      return {
        count: cards.length,
        gridColumns: gridCols,
        cardWidth: Math.round(cardRect.width),
        cardHeight: Math.round(cardRect.height),
        imageWrapHeight: Math.round(imgWrap ? imgWrap.getBoundingClientRect().height : 0),
        titleSingleLine: title ? title.clientHeight <= 35 : false,
        titleText: title ? title.textContent.trim() : '',
        viewBtnHeight: Math.round(viewBtn ? viewBtn.getBoundingClientRect().height : 0),
        cartBtnSize: Math.round(cartBtn ? cartBtn.getBoundingClientRect().width : 0)
      };
    });

    console.log('Wishlist Card Metrics:', cardInfo);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_wishlist_desktop.png') });

    // -------------------------------------------------------------------------
    // TEST 1B: Wishlist Mobile Layout (375x812)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 1B: Wishlist Mobile Layout ---');
    await page.setViewport({ width: 375, height: 812 });
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('.ksam-wishlist-card', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 600));

    const mobileCardInfo = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.ksam-wishlist-card'));
      const grid = document.querySelector('.ksam-wishlist-grid');
      const gridStyles = window.getComputedStyle(grid);
      const gridCols = gridStyles.getPropertyValue('grid-template-columns').split(' ').length;
      const firstCard = cards[0];
      const imgWrap = firstCard ? firstCard.querySelector('.ksam-wishlist-card-image') : null;
      return {
        count: cards.length,
        gridColumns: gridCols,
        cardWidth: firstCard ? Math.round(firstCard.getBoundingClientRect().width) : 0,
        cardHeight: firstCard ? Math.round(firstCard.getBoundingClientRect().height) : 0,
        imageHeight: imgWrap ? Math.round(imgWrap.getBoundingClientRect().height) : 0
      };
    });
    console.log('Mobile Card Metrics:', mobileCardInfo);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_wishlist_mobile.png') });

    // Reset to desktop viewport
    await page.setViewport({ width: 1440, height: 900 });

    // -------------------------------------------------------------------------
    // TEST 2: Bug Reproduction & Verification ("Aqua Pro Diver" Watch)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Click Aqua Pro Diver View Product ---');
    await page.goto(`${BASE_URL}watchwishlist.html`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Find card with "Aqua Pro Diver"
    const clickedUrl = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.ksam-wishlist-card'));
      for (const card of cards) {
        const title = card.querySelector('.ksam-wishlist-card-title');
        if (title && title.textContent.includes('Aqua Pro Diver')) {
          const btn = card.querySelector('.ksam-wishlist-view-btn');
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (clickedUrl) {
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      const currentUrl = page.url();
      console.log('Navigated to URL:', currentUrl);

      const productDetails = await page.evaluate(() => {
        const titleEl = document.querySelector('.product-detail-title');
        const priceEl = document.querySelector('.product-detail-current-price');
        const catEl = document.querySelector('.product-detail-cat-pill');
        const imgEl = document.querySelector('.product-detail-img');
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        const pageBg = window.getComputedStyle(document.querySelector('.product-detail-page')).backgroundColor;
        const relatedTitle = document.querySelector('.product-detail-related-header h2');
        const relatedSub = document.querySelector('.product-detail-related-subtitle');
        const relatedCards = Array.from(document.querySelectorAll('.product-detail-related-card')).map(c => {
          return {
            title: c.querySelector('.related-card-title')?.textContent.trim(),
            cat: c.querySelector('.related-card-cat')?.textContent.trim(),
            price: c.querySelector('.related-card-price')?.textContent.trim()
          };
        });

        return {
          title: titleEl?.textContent.trim(),
          price: priceEl?.textContent.trim(),
          category: catEl?.textContent.trim(),
          imgSrc: imgEl?.src,
          bodyBg,
          pageBg,
          relatedTitle: relatedTitle?.textContent.trim(),
          relatedSub: relatedSub?.textContent.trim(),
          relatedCards
        };
      });

      console.log('Aqua Pro Diver Details:', productDetails);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_aqua_pro_diver_details.png') });
    }

    // -------------------------------------------------------------------------
    // TEST 3: 8 Different Products from Diverse Categories
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Testing 8 Diverse Products ---');
    const testProducts = [
      {
        name: 'Sport Watch (Aqua Pro Diver)',
        url: `${BASE_URL}product.html?id=5&category=Sport%20Watches&uid=sport-watches-5`,
        expectedCat: 'watch'
      },
      {
        name: 'Smart Watch (Smart Watch Pro)',
        url: `${BASE_URL}product.html?id=2002&category=Watches&uid=watches-2002`,
        expectedCat: 'watch'
      },
      {
        name: 'Shoe (Classic Retro Dunk Sneakers)',
        url: `${BASE_URL}product.html?id=2005&category=Shoes&uid=shoes-2005`,
        expectedCat: 'shoe'
      },
      {
        name: 'Shoe (Urban Street Runner)',
        url: `${BASE_URL}product.html?id=shoe-001&category=Sneakers&uid=sneakers-shoe-001`,
        expectedCat: 'shoe'
      },
      {
        name: 'Chair / Furniture (Luxury Office Chair)',
        url: `${BASE_URL}product.html?id=2003&category=Furniture&uid=furniture-2003`,
        expectedCat: 'chair'
      },
      {
        name: 'Clothing (Emerald Silk Evening Dress)',
        url: `${BASE_URL}product.html?id=2007&category=Clothes&uid=clothes-2007`,
        expectedCat: 'cloth'
      },
      {
        name: 'Audio / Gadget (Premium Wireless Headphones)',
        url: `${BASE_URL}product.html?id=2001&category=Gadgets&uid=gadgets-2001`,
        expectedCat: 'audio'
      },
      {
        name: 'Beauty (Vitamin C Face Serum)',
        url: `${BASE_URL}product.html?id=101&category=Skin%20Care&uid=skin-care-101`,
        expectedCat: 'beauty'
      }
    ];

    for (let i = 0; i < testProducts.length; i++) {
      const tp = testProducts[i];
      console.log(`\nTesting [${i + 1}/8] ${tp.name}:`);
      await page.goto(tp.url, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 600));

      const res = await page.evaluate(() => {
        const notFound = document.querySelector('.product-detail-notfound');
        if (notFound) return { notFound: true };

        const title = document.querySelector('.product-detail-title')?.textContent.trim();
        const price = document.querySelector('.product-detail-current-price')?.textContent.trim();
        const cat = document.querySelector('.product-detail-cat-pill')?.textContent.trim();
        const img = document.querySelector('.product-detail-img')?.src;
        const relatedSub = document.querySelector('.product-detail-related-subtitle')?.textContent.trim();
        const relatedCount = document.querySelectorAll('.product-detail-related-card').length;
        const firstRelatedCat = document.querySelector('.related-card-cat')?.textContent.trim();
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;

        return {
          notFound: false,
          title,
          price,
          cat,
          img: img ? img.split('/').pop() : null,
          relatedSub,
          relatedCount,
          firstRelatedCat,
          bodyBg
        };
      });

      console.log('Result:', res);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `product_${i + 1}.png`) });
    }

    // -------------------------------------------------------------------------
    // TEST 4: Add to Cart on Details Page
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Add to Cart Verification ---');
    await page.goto(`${BASE_URL}product.html?id=5&category=Sport%20Watches&uid=sport-watches-5`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.product-detail-add-btn', { timeout: 5000 });

    const cartResult = await page.evaluate(() => {
      const addBtn = document.querySelector('.product-detail-add-btn');
      if (!addBtn) return { success: false, reason: 'Add button not found' };
      addBtn.click();
      const rawCart = localStorage.getItem('cartProductLS');
      const cart = rawCart ? JSON.parse(rawCart) : [];
      return {
        success: true,
        cartCount: cart.length,
        lastItem: cart[cart.length - 1]
      };
    });
    console.log('Cart Test Result:', cartResult);

    console.log('\nConsole Errors during testing:', consoleErrors);
    console.log('\nAll tests completed successfully!');

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await browser.close();
  }
}

run();
