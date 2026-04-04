const { chromium } = require('playwright');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  let page = context.pages()[0] || await context.newPage();

  await page.bringToFront();
  await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('ACTION: opened Google');
  await sleep(2000);

  const searchBox = page.locator('textarea[name="q"], input[name="q"]');
  await searchBox.waitFor({ timeout: 15000 });
  await searchBox.click();
  await sleep(2000);
  await searchBox.fill('roofing companies Murfreesboro TN');
  await sleep(2000);
  await searchBox.press('Enter');
  console.log('ACTION: searched');
  await page.waitForLoadState('domcontentloaded');
  await sleep(2000);

  const anchors = await page.locator('a').evaluateAll((els) => {
    return els.map(a => ({
      text: (a.innerText || a.textContent || '').trim(),
      href: a.href || ''
    }));
  });

  const banned = ['google.com', 'youtube.com', 'yelp.com', 'angi.com', 'bbb.org', 'homeadvisor.com', 'expertise.com', 'houzz.com'];
  const picked = [];
  const seenHosts = new Set();
  for (const a of anchors) {
    if (!a.href || !/^https?:/i.test(a.href)) continue;
    try {
      const u = new URL(a.href);
      const host = u.hostname.replace(/^www\./, '');
      if (banned.some(b => host.includes(b))) continue;
      if (seenHosts.has(host)) continue;
      if (!a.text) continue;
      seenHosts.add(host);
      picked.push(a.href);
      if (picked.length === 2) break;
    } catch {}
  }

  if (picked.length < 2) throw new Error('Could not identify two non-ad results');

  const page2 = await context.newPage();
  await page2.goto(picked[0], { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page2.bringToFront();
  console.log('ACTION: opened result 1 -> ' + picked[0]);
  await sleep(2000);

  const page3 = await context.newPage();
  await page3.goto(picked[1], { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page3.bringToFront();
  console.log('ACTION: opened result 2 -> ' + picked[1]);
  await sleep(2000);

  await page2.bringToFront();
  console.log('ACTION: focused result 1');
  await sleep(2000);

  await page3.bringToFront();
  console.log('ACTION: focused result 2');
  await sleep(2000);

  console.log('DONE');
})();
