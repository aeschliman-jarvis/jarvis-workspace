const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function click(page, sel, label, timeout = 5000) {
  try {
    await page.locator(sel).first().click({ timeout });
    console.log('ACTION: clicked ' + label + ' via ' + sel);
    await sleep(1200);
    return true;
  } catch { return false; }
}

async function fill(page, sel, value, label, timeout = 5000) {
  try {
    const loc = page.locator(sel).first();
    await loc.click({ timeout });
    await sleep(250);
    await loc.fill(value);
    console.log('ACTION: filled ' + label + ' = ' + value + ' via ' + sel);
    await sleep(800);
    return true;
  } catch { return false; }
}

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('app.remotesf.com/jobs/4440698/estimates/new')) || context.pages().find(p => (p.url() || '').includes('app.remotesf.com/jobs/4440698/estimates')) || context.pages().find(p => (p.url() || '').includes('app.remotesf.com'));
  await page.bringToFront();
  console.log('ACTION: focused Jarvis estimate context');
  await sleep(1000);

  // Ensure we're on the fresh/new estimate page if possible.
  if (!page.url().includes('/estimates/new')) {
    await page.goto('https://app.remotesf.com/jobs/4440698/estimates/new', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    console.log('ACTION: opened fresh estimate URL');
    await sleep(1500);
  }

  // Add Onyx line item using the line-item flow only.
  await click(page, 'button:has-text("Add Line Item")', 'Add Line Item');
  await fill(page, 'input[placeholder*="search" i], input[type="search"]', 'Onyx Shower', 'line-item search');
  await click(page, 'text=/Onyx Shower/i', 'select Onyx Shower');

  const desc = page.locator('textarea[name="description"]').first();
  let cur = await desc.inputValue().catch(async () => await desc.textContent().catch(() => ''));
  console.log('CURRENT_DESCRIPTION:', cur);
  if ((cur || '').includes('36 x 60')) {
    cur = cur.replace(/36 x 60/g, '30 x 60');
    await desc.fill(cur).catch(() => {});
    console.log('ACTION: corrected description -> ' + cur);
    await sleep(700);
  }

  await fill(page, 'input[name="quantity"]', '1', 'quantity');
  await click(page, 'button:has-text("Save Changes")', 'blue Save Changes');

  const body = await page.locator('body').innerText().catch(() => '');
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 30000));
  console.log('---FINAL_BODY_END---');
})();
