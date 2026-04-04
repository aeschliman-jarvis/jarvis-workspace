const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function tryClick(page, selectors, label, timeout = 4000) {
  for (const sel of selectors) {
    try {
      const loc = page.locator(sel).first();
      if (await loc.count()) {
        await loc.click({ timeout });
        console.log('ACTION: clicked ' + label + ' via ' + sel);
        await sleep(1800);
        return true;
      }
    } catch {}
  }
  return false;
}

async function tryFill(page, selectors, value, label, timeout = 4000) {
  for (const sel of selectors) {
    try {
      const loc = page.locator(sel).first();
      if (await loc.count()) {
        await loc.click({ timeout });
        await sleep(500);
        await loc.fill(value);
        console.log('ACTION: filled ' + label + ' = ' + value + ' via ' + sel);
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
  const page = context.pages().find(p => (p.url() || '').includes('app.remotesf.com')) || context.pages()[0];
  await page.bringToFront();
  console.log('ACTION: focused CRM tab');
  await sleep(1000);

  await page.goto('https://app.remotesf.com/jobs', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
  console.log('ACTION: opened jobs home');
  await sleep(2000);

  await tryClick(page, ['text=/Add Job/i', 'button:has-text("Add Job")', '[role="button"]:has-text("Add Job")'], 'Add Job');

  // Fill likely customer fields.
  await tryFill(page, ['input[name*="name" i]', 'input[placeholder*="name" i]'], 'Jarvis Bot', 'customer name');
  await tryFill(page, ['input[name*="first" i]'], 'Jarvis', 'first name');
  await tryFill(page, ['input[name*="last" i]'], 'Bot', 'last name');
  await tryFill(page, ['input[name*="email" i]', 'input[placeholder*="email" i]'], 'jarvis.bot@example.com', 'email');
  await tryFill(page, ['input[name*="phone" i]', 'input[type="tel"]', 'input[placeholder*="phone" i]'], '6155550199', 'phone');
  await tryFill(page, ['input[name*="address" i]', 'input[placeholder*="address" i]'], '123 Test Lane', 'address');
  await tryFill(page, ['input[name*="city" i]', 'input[placeholder*="city" i]'], 'Nashville', 'city');
  await tryFill(page, ['input[name*="state" i]'], 'TN', 'state');
  await tryFill(page, ['input[name*="zip" i]', 'input[placeholder*="zip" i]'], '37211', 'zip');

  await tryClick(page,
    ['text=/Save/i', 'button:has-text("Save")', '[role="button"]:has-text("Save")', 'text=/Create/i'],
    'Save customer', 5000
  );

  await sleep(3000);

  // Navigate into estimate creation if on customer page.
  await tryClick(page, ['text=/Estimate/i', 'text=/Add Estimate/i', 'text=/Tools/i'], 'Estimate/Tools');
  await tryClick(page, ['text=/Add Estimate/i', 'button:has-text("Add Estimate")'], 'Add Estimate');
  await sleep(2000);

  // Add shower group and items.
  await tryClick(page, ['text=/Add Group/i'], 'Add Group');
  await tryFill(page, ['input[placeholder*="group" i]', 'input[name*="group" i]'], 'Shower', 'group name');
  await tryClick(page, ['text=/Save/i', 'button:has-text("Save")'], 'Save group');

  // Add line item and search/select likely components.
  const lineCycles = [
    { search: 'Onyx Shower', notes: ['30 x 60', '96', 'Breeze'] },
    { search: 'Tear out and Plumbing', notes: ['tear out acrylic shower'] },
    { search: 'Shower & Tub Fixtures', notes: ['random desirable shower head'] },
    { search: 'Installation of Onyx System', notes: [] }
  ];

  for (const item of lineCycles) {
    await tryClick(page, ['text=/Add Line Item/i', 'button:has-text("Add Line Item")'], 'Add Line Item');
    await tryFill(page, ['input[placeholder*="search" i]', 'input[type="search"]'], item.search, 'line item search');
    await sleep(1500);
    await tryClick(page, [`text=/${item.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/i`], 'Select ' + item.search);
    for (const note of item.notes) {
      await tryClick(page, [`text=/${note.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/i`], 'Select option ' + note, 2000);
    }
    await tryClick(page, ['text=/Save/i', 'button:has-text("Save")', 'text=/Add/i'], 'Save line item', 3000);
    await sleep(1500);
  }

  // Look for likely size/color/fixture choices directly on page.
  const preferenceClicks = [
    'text=/30 x 60/i',
    'text=/96/i',
    'text=/Breeze/i',
    'text=/Pulse/i',
    'text=/Refuge/i',
    'text=/Chrome/i',
    'text=/Brushed Nickel/i'
  ];
  for (const sel of preferenceClicks) {
    try { await page.locator(sel).first().click({ timeout: 1500 }); console.log('ACTION: clicked preference ' + sel); await sleep(800);} catch {}
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
