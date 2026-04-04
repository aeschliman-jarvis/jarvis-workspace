const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.bringToFront();
  console.log('ACTION: opened Google');
  await sleep(2000);

  const searchBox = page.locator('textarea[name="q"], input[name="q"]');
  await searchBox.waitFor({ timeout: 15000 });
  await searchBox.click();
  await sleep(2000);
  await searchBox.fill('cows');
  await sleep(2000);
  await searchBox.press('Enter');
  console.log('ACTION: searched cows');
  await page.waitForLoadState('domcontentloaded');
  await sleep(2000);

  const tabs = [
    'https://en.wikipedia.org/wiki/Cattle',
    'https://www.britannica.com/animal/cattle-livestock',
    'https://www.nationalgeographic.com/animals/mammals/facts/domestic-cattle'
  ];

  const opened = [];
  for (const url of tabs) {
    const p = await context.newPage();
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await p.bringToFront();
    opened.push(p);
    console.log('ACTION: opened ' + url);
    await sleep(2000);
  }

  for (let i = 0; i < opened.length; i++) {
    await opened[i].bringToFront();
    console.log('ACTION: focused tab ' + (i + 1));
    await sleep(2000);
  }

  console.log('COW_DEMO_DONE');
})();
