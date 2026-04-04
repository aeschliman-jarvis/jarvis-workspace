const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('/jobs/4440698/estimates/2704891')) || context.pages().find(p => (p.url() || '').includes('app.remotesf.com'));
  await page.bringToFront();
  console.log('ACTION: focused Jarvis estimate');
  await sleep(1000);

  // If save-confirm dialog is open, cancel it so we can edit the item first.
  try {
    const dialog = page.locator('text=/Would you like to save your line item\?/i').first();
    if (await dialog.count()) {
      await page.locator('button:has-text("Cancel"), text=Cancel').first().click({ timeout: 3000 });
      console.log('ACTION: dismissed save dialog with Cancel');
      await sleep(1200);
    }
  } catch {}

  const desc = page.locator('textarea[name="description"]').first();
  const qty = page.locator('input[name="quantity"]').first();

  const currentDesc = await desc.inputValue().catch(async () => await desc.textContent().catch(() => ''));
  console.log('CURRENT_DESCRIPTION:', currentDesc);

  const newDesc = (currentDesc || '36 x 60 LH Mid with 96" walls and BN Drain').replace(/36 x 60/g, '30 x 60');
  await desc.click({ timeout: 5000 }).catch(() => {});
  await sleep(300);
  await desc.fill(newDesc).catch(() => {});
  console.log('ACTION: updated description -> ' + newDesc);
  await sleep(1000);

  await qty.click({ timeout: 5000 }).catch(() => {});
  await sleep(300);
  await qty.fill('1').catch(() => {});
  console.log('ACTION: set quantity = 1');
  await sleep(1000);

  await page.locator('button:has-text("Save Changes"), text="Save Changes"').first().click({ timeout: 5000 }).catch(() => {});
  console.log('ACTION: clicked Save Changes');
  await sleep(2000);

  // If confirmation dialog appears, accept it.
  try {
    const dialog2 = page.locator('text=/Would you like to save your line item\?/i').first();
    if (await dialog2.count()) {
      await page.locator('button:has-text("OK"), text=OK').first().click({ timeout: 3000 });
      console.log('ACTION: confirmed save with OK');
      await sleep(2000);
    }
  } catch {}

  const title = await page.title().catch(() => '');
  const url = page.url();
  const body = await page.locator('body').innerText().catch(() => '');
  console.log('---FINAL_TITLE---');
  console.log(title);
  console.log('---FINAL_URL---');
  console.log(url);
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 30000));
  console.log('---FINAL_BODY_END---');
})();
