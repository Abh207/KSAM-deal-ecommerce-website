const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function testScreenshots() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  
  const widths = [390, 768, 1024, 1280, 1440, 1920];
  for (const w of widths) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto('http://localhost:5173/KSAM-deal-ecommerce-website/contact-us.html', { waitUntil: 'networkidle2' });
    // wait 1.5s for video playback to advance
    await new Promise(r => setTimeout(r, 1500));
    
    const hero = await page.$('.ct-hero-section');
    if (hero) {
      const box = await hero.boundingBox();
      console.log('Width:', w, 'Hero box:', box);
      await page.screenshot({ 
        path: 'scripts/hero-video-' + w + '.png', 
        clip: { x: 0, y: 0, width: w, height: Math.min(Math.round(box.height + 80), 960) } 
      });
    }
  }

  // Runtime video checks at 1440px
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/KSAM-deal-ecommerce-website/contact-us.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const state = await page.evaluate(() => {
    const vid = document.querySelector('.ct-hero-bg-video');
    const poster = document.querySelector('.ct-hero-bg-poster');
    const oldRotator = document.querySelector('.ct-hero-rotator');
    const oldChips = document.querySelector('.ct-hero-satellites');
    
    return {
      hasVideo: Boolean(vid),
      videoPaused: vid ? vid.paused : null,
      videoMuted: vid ? vid.muted : null,
      videoCurrentTime: vid ? vid.currentTime : null,
      videoReadyState: vid ? vid.readyState : null,
      videoCurrentSrc: vid ? vid.currentSrc : null,
      hasOldRotator: Boolean(oldRotator),
      hasOldChips: Boolean(oldChips),
      posterRendered: Boolean(poster)
    };
  });

  console.log('Hero Video Runtime State:', JSON.stringify(state, null, 2));

  await browser.close();
  console.log('Verification script completed.');
}

testScreenshots().catch(console.error);
