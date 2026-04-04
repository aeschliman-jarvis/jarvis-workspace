const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('/jobs/4387760/estimates')) || context.pages().find(p => (p.url() || '').includes('app.remotesf.com'));
  await page.bringToFront();
  console.log('ACTION: focused Giles estimate page');
  await sleep(1500);

  // Try opening the estimate row by number and amount/product links.
  const options = [
    ['text=2675474', 'estimate number'],
    ['text=16', 'products count'],
    ['text=$13,197.60', 'estimate amount'],
    ['text=/Present Options/i', 'Present Options']
  ];

  for (const [sel, label] of options) {
    try {
      await page.locator(sel).first().click({ timeout: 5000 });
      console.log('ACTION: clicked ' + label);
      await sleep(3000);
    } catch {}
  }

  const title = await page.title().catch(() => '');
  const url = page.url();
  const body = await page.locator('body').innerText().catch(() => '');
  console.log('---FINAL_TITLE---');
  console.log(title);
  console.log('---FINAL_URL---');
  console.log(url);
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 40000));
  console.log('---FINAL_BODY_END---');
})();
