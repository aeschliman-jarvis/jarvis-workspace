const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function clickText(page, pattern, label, timeout = 4000) {
  try {
    const loc = page.locator(pattern).first();
    await loc.click({ timeout });
    console.log('ACTION: clicked ' + label + ' via ' + pattern);
    await sleep(1500);
    return true;
  } catch { return false; }
}

async function fillInput(page, value) {
  const sels = ['input[type="search"]', 'input[placeholder*="search" i]', 'input', 'textarea'];
  for (const sel of sels) {
    try {
      const loc = page.locator(sel).first();
      if (await loc.count()) {
        await loc.click({ timeout: 3000 });
        await sleep(500);
        await loc.fill(value);
        console.log('ACTION: filled input = ' + value + ' via ' + sel);
        await sleep(1200);
        return true;
      }
    } catch {}
  }
  return false;
}

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('/jobs/4440698/estimates/2704891')) || context.pages().find(p => (p.url() || '').includes('app.remotesf.com'));
  await page.bringToFront();
  console.log('ACTION: focused Jarvis estimate');
  await sleep(1500);

  // Create/enter Shower group if needed.
  await clickText(page, 'text=/Add Group/i', 'Add Group');
  await fillInput(page, 'Shower');
  await clickText(page, 'text=/Save/i', 'Save group');
  await sleep(1500);

  // Add line item and explicitly use Select Product dropdown.
  const items = [
    { product: 'Onyx Shower', prefs: ['30 x 60', '96', 'Breeze'] },
    { product: 'Tear out and Plumbing', prefs: ['Fiberglass', 'Acrylic', 'Removal'] },
    { product: 'Shower & Tub Fixtures', prefs: ['Pulse', 'Refuge', 'Brushed Nickel'] },
    { product: 'Installation of Onyx System', prefs: ['Regular Install'] }
  ];

  for (const item of items) {
    await clickText(page, 'text=/Add Line Item/i', 'Add Line Item');
    await sleep(1200);

    // specifically target product dropdown or select-product control
    await clickText(page, 'text=/Select Product/i', 'Select Product');
    await clickText(page, '[role="combobox"]', 'combobox');
    await clickText(page, 'select', 'native select');

    await fillInput(page, item.product);
    await clickText(page, `text=/${item.product.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/i`, 'product ' + item.product, 3000);

    for (const pref of item.prefs) {
      await clickText(page, `text=/${pref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/i`, 'preference ' + pref, 1500);
    }

    await clickText(page, 'text=/Add$/i', 'Add');
    await clickText(page, 'text=/Save/i', 'Save line item');
    await sleep(2000);
  }

  const title = await page.title().catch(() => '');
  const url = page.url();
  const body = await page.locator('body').innerText().catch(() => '');
  console.log('---FINAL_TITLE---');
  console.log(title);
  console.log('---FINAL_URL---');
  console.log(url);
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 50000));
  console.log('---FINAL_BODY_END---');
})();
