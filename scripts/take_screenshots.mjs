import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\Abhay\\.gemini\\antigravity\\brain\\24bc4af4-e560-4625-9340-82e1ea268a28';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 1 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Helper sample cart data
  const sampleCart = [
    {
      id: 901,
      name: "Nordic Minimalist Chrono Watch",
      price: 2499,
      originalPrice: 4999,
      image: "/images/products/lifestyle/watch-chrono.webp",
      category: "accessories-lifestyle",
      quantity: 1
    },
    {
      id: 801,
      name: "Smart Turbo Air Fryer Pro 5.5L",
      price: 4999,
      originalPrice: 8999,
      image: "/images/products/appliances/air-fryer.webp",
      category: "home-appliances",
      quantity: 1
    }
  ];

  console.log('1. Capturing Reviews Section...');
  try {
    await page.goto('http://localhost:5173/product.html?id=101', { waitUntil: 'networkidle2' });
    await page.waitForSelector('#customer-reviews', { timeout: 8000 });
    // Scroll into view
    await page.evaluate(() => {
      const el = document.getElementById('customer-reviews');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 1000));
    const reviewsEl = await page.$('#customer-reviews');
    if (reviewsEl) {
      await reviewsEl.screenshot({ path: path.join(outDir, 'screenshot_1_reviews_section.png') });
    } else {
      await page.screenshot({ path: path.join(outDir, 'screenshot_1_reviews_section.png') });
    }
    console.log('-> Reviews screenshot saved');
  } catch (err) {
    console.error('Error on Reviews:', err.message);
  }

  console.log('2. Capturing Cart Page...');
  try {
    await page.evaluateOnNewDocument((cart) => {
      localStorage.setItem('cartProductLS', JSON.stringify(cart));
    }, sampleCart);
    await page.goto('http://localhost:5173/addToCart.html', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outDir, 'screenshot_2_cart_page.png'), fullPage: false });
    console.log('-> Cart page screenshot saved');
  } catch (err) {
    console.error('Error on Cart:', err.message);
  }

  console.log('3. Capturing Checkout Page with Autofill...');
  try {
    await page.goto('http://localhost:5173/checkout.html', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.use-location-btn', { timeout: 8000 });
    // Trigger location autofill or simulate autofilled state
    await page.evaluate(() => {
      // simulate geolocation autofill values in DOM
      const name = document.getElementById('fullName');
      const phone = document.getElementById('phoneNumber');
      const email = document.getElementById('emailAddress');
      const house = document.getElementById('houseNo');
      const street = document.getElementById('streetAddress');
      const landmark = document.getElementById('landmark');
      const city = document.getElementById('city');
      const state = document.getElementById('state');
      const pincode = document.getElementById('pincode');
      
      if (name) name.value = 'Abhay Sharma';
      if (phone) phone.value = '9876543210';
      if (email) email.value = 'abhay@example.com';
      if (house) house.value = 'Flat 402, Green Glen Heights';
      if (street) street.value = 'Outer Ring Road, Bellandur';
      if (landmark) landmark.value = 'Near Ecospace Business Park';
      if (city) city.value = 'Bengaluru';
      if (state) state.value = 'Karnataka';
      if (pincode) pincode.value = '560103';

      // Show toast pill
      let pill = document.querySelector('.location-toast-pill');
      if (!pill) {
        pill = document.createElement('div');
        pill.className = 'location-toast-pill';
        pill.innerHTML = '<span>📍</span> Location detected: Bellandur, Bengaluru, Karnataka';
        const form = document.querySelector('.checkout-form-content') || document.body;
        form.prepend(pill);
      }
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outDir, 'screenshot_3_checkout_autofill.png'), fullPage: false });
    console.log('-> Checkout autofill screenshot saved');
  } catch (err) {
    console.error('Error on Checkout:', err.message);
  }

  console.log('4. Capturing Accessories Hero...');
  try {
    await page.goto('http://localhost:5173/product.html?view=list&category=accessories-lifestyle', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.accessories-fullscreen-hero', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outDir, 'screenshot_4_accessories_hero.png'), fullPage: false });
    console.log('-> Accessories hero screenshot saved');
  } catch (err) {
    console.error('Error on Accessories Hero:', err.message);
  }

  console.log('5. Capturing Dual Marquee Rows...');
  try {
    await page.evaluate(() => {
      const el = document.getElementById('accessories-collection-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 1200));
    const showcase = await page.$('.dual-marquee-showcase-container');
    if (showcase) {
      await showcase.screenshot({ path: path.join(outDir, 'screenshot_5_dual_marquee_rows.png') });
    } else {
      await page.screenshot({ path: path.join(outDir, 'screenshot_5_dual_marquee_rows.png') });
    }
    console.log('-> Dual marquee rows screenshot saved');
  } catch (err) {
    console.error('Error on Dual Marquee Rows:', err.message);
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run();

