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

async function addLineItem(page, searchTerm, postSelectFixes = {}) {
  await click(page, 'button:has-text("Add Line Item"), text=/Add Line Item/i', 'Add Line Item');
  await click(page, 'text=/Select Product/i', 'Select Product');
  await fill(page, 'input[placeholder*="search" i], input[type="search"], input', searchTerm, 'product search');
  await click(page, `text=/${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/i`, 'select ' + searchTerm, 4000);

  if (postSelectFixes.descriptionContains || postSelectFixes.descriptionReplace) {
    const desc = page.locator('textarea[name="description"]').first();
    let cur = await desc.inputValue().catch(async () => await desc.textContent().catch(() => ''));
    if (!cur) cur = '';
    if (postSelectFixes.descriptionReplace) {
      const [from, to] = postSelectFixes.descriptionReplace;
      cur = cur.replace(from, to);
    }
    await desc.fill(cur).catch(() => {});
    console.log('ACTION: updated description -> ' + cur);
    await sleep(800);
  }

  if (postSelectFixes.quantity) {
    await fill(page, 'input[name="quantity"]', String(postSelectFixes.quantity), 'quantity');
  }

  await click(page, 'button:has-text("Save Changes"), text="Save Changes"', 'Save Changes');
}

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('app.remotesf.com')) || context.pages()[0];
  await page.bringToFront();
  console.log('ACTION: focused CRM tab');
  await sleep(1000);

  // Work from current Jarvis estimate/customer context if possible.
  // Close and do not save current estimate by leaving it.
  await click(page, 'button:has-text("Close"), text="Close"', 'Close estimate');
  await click(page, 'text=/BACK TO ALL CUSTOMERS/i', 'Back to all customers');

  // Return to customer list and re-open Jarvis customer.
  await page.goto('https://app.remotesf.com/jobs', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
  console.log('ACTION: opened jobs home');
  await sleep(2000);
  await click(page, 'text=/jarvis\\.bot@example\\.com/i', 'Jarvis customer');
  await click(page, 'text=/View Details/i', 'View Details');
  await click(page, 'text=/Estimate/i', 'Estimate section');
  await click(page, 'text=/Add Estimate/i, button:has-text("Add Estimate")', 'Add Estimate');
  await sleep(2000);

  // Add core shower item.
  await addLineItem(page, 'Onyx Shower', {
    descriptionReplace: [/36 x 60/g, '30 x 60'],
    quantity: 1
  });

  // Add tear out/plumbing.
  await addLineItem(page, 'Tear out and Plumbing', { quantity: 1 });

  // Add installation of Onyx system.
  await addLineItem(page, 'Installation of Onyx System', { quantity: 1 });

  // Add fixture package / shower head.
  await addLineItem(page, 'Shower & Tub Fixtures', { quantity: 1 });

  const body = await page.locator('body').innerText().catch(() => '');
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 40000));
  console.log('---FINAL_BODY_END---');
})();
