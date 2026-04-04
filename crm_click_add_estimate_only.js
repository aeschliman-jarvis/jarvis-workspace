const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('/jobs/4440698/estimates')) || context.pages().find(p => (p.url() || '').includes('app.remotesf.com'));
  await page.bringToFront();
  console.log('ACTION: focused estimate list');
  await sleep(700);
  try {
    await page.locator('button:has-text("Add Estimate")').first().click({ timeout: 5000 });
  } catch {
    await page.locator('text=/Add Estimate/i').first().click({ timeout: 5000 });
  }
  console.log('ACTION: clicked Add Estimate');
  await sleep(3000);
  console.log('URL:', page.url());
  console.log((await page.locator('body').innerText().catch(() => '')).slice(0, 15000));
})();
