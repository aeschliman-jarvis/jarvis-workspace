const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('/jobs/4440698/estimates/2704891')) || context.pages().find(p => (p.url() || '').includes('app.remotesf.com'));
  await page.bringToFront();
  console.log('ACTION: focused Jarvis estimate');
  await sleep(1000);

  // Make sure the description is correct before commit.
  const desc = page.locator('textarea[name="description"]').first();
  const qty = page.locator('input[name="quantity"]').first();
  const currentDesc = await desc.inputValue().catch(async () => await desc.textContent().catch(() => ''));
  if ((currentDesc || '').includes('36 x 60')) {
    await desc.fill(currentDesc.replace(/36 x 60/g, '30 x 60')).catch(() => {});
    console.log('ACTION: normalized description to 30 x 60');
    await sleep(600);
  }
  await qty.fill('1').catch(() => {});
  console.log('ACTION: confirmed quantity 1');
  await sleep(600);

  // Click only Save Changes and then wait.
  await page.locator('button:has-text("Save Changes"), text="Save Changes"').first().click({ timeout: 5000 }).catch(() => {});
  console.log('ACTION: clicked Save Changes');
  await sleep(3000);

  // If the save confirmation appears, do NOT cancel it; confirm it.
  try {
    const dialog = page.locator('text=/Would you like to save your line item\?/i').first();
    if (await dialog.count()) {
      await page.locator('button:has-text("OK"), text=OK').first().click({ timeout: 4000 }).catch(() => {});
      console.log('ACTION: confirmed line-item save with OK');
      await sleep(4000);
    }
  } catch {}

  const body = await page.locator('body').innerText().catch(() => '');
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 30000));
  console.log('---FINAL_BODY_END---');
})();
