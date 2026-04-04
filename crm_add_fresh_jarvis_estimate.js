const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
async function click(page, sel, label, timeout = 5000) {
  try {
    await page.locator(sel).first().click({ timeout });
    console.log('ACTION: clicked ' + label + ' via ' + sel);
    await sleep(1500);
    return true;
  } catch { return false; }
}
async function fill(page, sel, value, label, timeout = 5000) {
  try {
    const loc = page.locator(sel).first();
    await loc.click({ timeout });
    await sleep(300);
    await loc.fill(value);
    console.log('ACTION: filled ' + label + ' = ' + value + ' via ' + sel);
    await sleep(900);
    return true;
  } catch { return false; }
}
async function addLineItem(page, searchTerm, fix36to30 = false) {
  await click(page, 'button:has-text("Add Line Item"), text=/Add Line Item/i', 'Add Line Item');
  await click(page, 'text=/Select Product/i', 'Select Product');
  await fill(page, 'input[placeholder*="search" i], input[type="search"], input', searchTerm, 'product search');
  await click(page, `text=/${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/i`, 'select ' + searchTerm, 4000);
  if (fix36to30) {
    const desc = page.locator('textarea[name="description"]').first();
    let cur = await desc.inputValue().catch(async () => await desc.textContent().catch(() => ''));
    cur = (cur || '').replace(/36 x 60/g, '30 x 60');
    await desc.fill(cur).catch(() => {});
    console.log('ACTION: updated description -> ' + cur);
    await sleep(600);
  }
  await fill(page, 'input[name="quantity"]', '1', 'quantity');
  await click(page, 'button:has-text("Save Changes"), text="Save Changes"', 'Save Changes');
}
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('/jobs/4440698/estimates')) || context.pages().find(p => (p.url() || '').includes('app.remotesf.com'));
  await page.bringToFront();
  console.log('ACTION: focused Jarvis estimate list');
  await sleep(1000);

  await click(page, 'text=/Add Estimate/i, button:has-text("Add Estimate")', 'Add Estimate');
  await sleep(2000);

  await addLineItem(page, 'Onyx Shower', true);
  await addLineItem(page, 'Tear out and Plumbing', false);
  await addLineItem(page, 'Installation of Onyx System', false);
  await addLineItem(page, 'Shower & Tub Fixtures', false);

  const body = await page.locator('body').innerText().catch(() => '');
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 40000));
  console.log('---FINAL_BODY_END---');
})();
