import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testFeatures() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true });

  console.log('Testing Home page (index)...');
  await page.goto('http://127.0.0.1:4173/KSAM-deal-ecommerce-website/', { waitUntil: 'networkidle2' });

  // Check wishlist counter and cart counter in DOM
  const counters = await page.evaluate(() => {
    const cartCountEl = document.querySelector('[data-cart-count], .cart-badge, .nav-cart-count, #cartValue');
    return {
      hasNav: !!document.querySelector('nav, header, .navbar'),
      hasHero: !!document.querySelector('#home, .hero'),
      cartCountText: cartCountEl ? cartCountEl.textContent.trim() : '0'
    };
  });
  console.log('Home features:', counters);

  console.log('Testing Audio page (audio.html)...');
  await page.goto('http://127.0.0.1:4173/KSAM-deal-ecommerce-website/audio.html', { waitUntil: 'networkidle2' });
  const audioChecks = await page.evaluate(() => {
    const video = document.querySelector('video.audio-bg-video');
    const cards = document.querySelectorAll('.audio-card, .audio-product-card');
    const hero = document.querySelector('.audio-hero');
    return {
      hasVideo: !!video,
      videoPoster: video?.getAttribute('poster'),
      cardsCount: cards.length,
      hasHero: !!hero
    };
  });
  console.log('Audio checks:', audioChecks);

  console.log('Testing Shop page (shop.html)...');
  await page.goto('http://127.0.0.1:4173/KSAM-deal-ecommerce-website/shop.html', { waitUntil: 'networkidle2' });
  const shopChecks = await page.evaluate(() => {
    const heroVid = document.querySelector('.products-hero-video');
    const categories = document.querySelectorAll('.cs-list-item, .cs-chip');
    return {
      hasHeroVideo: !!heroVid,
      heroPoster: heroVid?.getAttribute('poster'),
      categoriesCount: categories.length
    };
  });
  console.log('Shop checks:', shopChecks);

  console.log('Testing Product page (Product.html)...');
  await page.goto('http://127.0.0.1:4173/KSAM-deal-ecommerce-website/Product.html', { waitUntil: 'networkidle2' });
  const productChecks = await page.evaluate(() => {
    return {
      hasRoot: !!document.getElementById('product-root'),
      title: document.title
    };
  });
  console.log('Product checks:', productChecks);

  await browser.close();
  console.log('\nAll feature checks completed successfully!');
}

testFeatures().catch(console.error);
