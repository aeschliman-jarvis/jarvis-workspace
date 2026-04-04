const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('/jobs/4440698/estimates/2704891')) || context.pages().find(p => (p.url() || '').includes('app.remotesf.com'));
  await page.bringToFront();
  console.log('ACTION: focused Jarvis estimate');
  await sleep(700);

  const btn = page.locator('button:has-text("Save Changes")').first();
  await btn.click({ timeout: 5000 }).catch(async () => {
    await page.locator('text="Save Changes"').first().click({ timeout: 5000 });
  });
  console.log('ACTION: clicked blue Save Changes button');
  await sleep(3000);

  const body = await page.locator('body').innerText().catch(() => '');
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 25000));
  console.log('---FINAL_BODY_END---');
})();
