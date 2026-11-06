import puppeteer from 'puppeteer-core';
import path from 'path';

const outDir = 'C:\\Users\\Abhay\\.gemini\\antigravity\\brain\\24bc4af4-e560-4625-9340-82e1ea268a28';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: { width: 1280, height: 950, deviceScaleFactor: 1 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const sampleCart = [
    {
      id: 901,
      name: "Nordic Minimalist Chrono Watch",
      price: 2499,
      originalPrice: 4999,
      image: "/images/products/lifestyle/watch-chrono.webp",
      category: "accessories-lifestyle",
      quantity: 1
    }
  ];

  // Set cart in localStorage before loading checkout
  await page.goto('http://localhost:5173/index.html');
  await page.evaluate((cart) => {
    localStorage.setItem('cartProductLS', JSON.stringify(cart));
  }, sampleCart);

  console.log('Navigating to checkout...');
  await page.goto('http://localhost:5173/checkout.html', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.checkout-location-banner', { timeout: 8000 });
  console.log('Found .checkout-location-banner!');

  // Fill in address and location toast
  await page.evaluate(() => {
    // Fill React controlled inputs by firing events or directly setting values
    const setVal = (selector, val) => {
      const input = document.querySelector(selector);
      if (input) {
        input.value = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };

    setVal('input[name="name"]', 'Abhay Sharma');
    setVal('input[name="phone"]', '9876543210');
    setVal('input[name="email"]', 'abhay@example.com');
    setVal('input[name="house"]', 'Flat 402, Green Glen Heights');
    setVal('input[name="street"]', 'Outer Ring Road, Bellandur');
    setVal('input[name="landmark"]', 'Near Ecospace Business Park');
    setVal('input[name="city"]', 'Bengaluru');
    setVal('select[name="state"]', 'Karnataka');
    setVal('input[name="pincode"]', '560103');

    // Show toast pill
    let pill = document.querySelector('.location-toast-pill');
    if (!pill) {
      pill = document.createElement('div');
      pill.className = 'location-toast-pill';
      pill.innerHTML = '<span>📍</span> Location detected: Bellandur, Bengaluru, Karnataka (560103)';
      const banner = document.querySelector('.checkout-location-banner');
      if (banner && banner.parentNode) {
        banner.parentNode.insertBefore(pill, banner.nextSibling);
      }
    }
  });

  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'screenshot_3_checkout_autofill.png'), fullPage: false });
  console.log('-> Checkout autofill screenshot captured successfully!');

  await browser.close();
}

run().catch(console.error);
