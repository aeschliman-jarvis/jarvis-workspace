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

async function addItem(page, product, opts = {}) {
  await click(page, 'button:has-text("Add Line Item")', 'Add Line Item');

  // Use the line-item flow search bar only.
  await fill(page, 'input[placeholder*="search" i], input[type="search"]', product, 'line-item search');
  await click(page, `text=/${product.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/i`, 'select ' + product, 4000);

  if (opts.fix36to30) {
    const desc = page.locator('textarea[name="description"]').first();
    let cur = await desc.inputValue().catch(async () => await desc.textContent().catch(() => ''));
    cur = (cur || '').replace(/36 x 60/g, '30 x 60');
    await desc.fill(cur).catch(() => {});
    console.log('ACTION: updated description -> ' + cur);
    await sleep(600);
  }

  if (opts.quantity) {
    await fill(page, 'input[name="quantity"]', String(opts.quantity), 'quantity');
  }

  await click(page, 'button:has-text("Save Changes")', 'blue Save Changes');
}

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('/jobs/4440698/estimates/new')) || context.pages().find(p => (p.url() || '').includes('/jobs/4440698/estimates')) || context.pages().find(p => (p.url() || '').includes('app.remotesf.com'));
  await page.bringToFront();
  console.log('ACTION: focused fresh estimate');
  await sleep(1000);

  await addItem(page, 'Onyx Shower', { fix36to30: true, quantity: 1 });
  await addItem(page, 'Tear out and Plumbing', { quantity: 1 });
  await addItem(page, 'Installation of Onyx System', { quantity: 1 });
  await addItem(page, 'Shower & Tub Fixtures', { quantity: 1 });

  const body = await page.locator('body').innerText().catch(() => '');
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 40000));
  console.log('---FINAL_BODY_END---');
})();
