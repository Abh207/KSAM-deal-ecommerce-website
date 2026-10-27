const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5175/KSAM-deal-ecommerce-website/product.html?id=1001&category=Men%27s%20Watches', { waitUntil: 'networkidle0' });

  // 1. Check quantity increment
  await page.evaluate(() => {
    const btns = document.querySelectorAll('.product-detail-qty-btn');
    if (btns.length >= 2) btns[1].click();
  });
  const qty = await page.evaluate(() => document.querySelector('.product-detail-qty-val')?.innerText);
  console.log('Qty after + click:', qty);

  // 2. Click Add to Cart
  await page.click('.product-detail-add-btn');
  await new Promise(r => setTimeout(r, 400));
  const addBtnText = await page.evaluate(() => document.querySelector('.product-detail-add-btn')?.innerText);
  console.log('Add btn text after click:', addBtnText);

  // 3. Click Wishlist Heart
  await page.click('.product-detail-heart-btn');
  await new Promise(r => setTimeout(r, 400));
  const heartFill = await page.evaluate(() => document.querySelector('.product-detail-heart-btn svg')?.getAttribute('fill'));
  console.log('Heart fill after toggle:', heartFill);

  // 4. Check wishlist page interactions
  await page.goto('http://localhost:5175/KSAM-deal-ecommerce-website/watchwishlist.html', { waitUntil: 'networkidle0' });
  const cardsBefore = await page.evaluate(() => document.querySelectorAll('.ksam-wishlist-card').length);
  console.log('Wishlist cards before remove:', cardsBefore);

  // Test removing one card via heart button
  if (cardsBefore > 0) {
    await page.click('.ksam-wishlist-heart-btn');
    await new Promise(r => setTimeout(r, 450));
    const cardsAfter = await page.evaluate(() => document.querySelectorAll('.ksam-wishlist-card').length);
    console.log('Wishlist cards after heart remove:', cardsAfter);
  }

  // Test Clear All modal
  const clearBtn = await page.$('.ksam-wishlist-clear-btn');
  if (clearBtn) {
    await clearBtn.click();
    await new Promise(r => setTimeout(r, 300));
    const modalVisible = await page.evaluate(() => Boolean(document.querySelector('.ksam-wishlist-modal')));
    console.log('Clear All modal opens on click:', modalVisible);
  }

  await browser.close();
})();
