const { chromium } = require('playwright');
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.bringToFront();
  console.log('ACTION: opened Google');
  await sleep(1500);
  const q = page.locator('textarea[name="q"], input[name="q"]').first();
  await q.click({ timeout: 5000 });
  await q.fill('One Click Contractor help estimate add line item');
  await sleep(600);
  await q.press('Enter');
  console.log('ACTION: searched docs query');
  await page.waitForLoadState('domcontentloaded');
  await sleep(2500);

  const links = await page.locator('a').evaluateAll(els => els.map(a => ({text:(a.innerText||a.textContent||'').trim(), href:a.href||''})).filter(x => x.href));
  console.log('---SEARCH_LINKS_START---');
  console.log(JSON.stringify(links.slice(0, 60), null, 2));
  console.log('---SEARCH_LINKS_END---');
})();
