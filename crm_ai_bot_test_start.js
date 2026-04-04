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
    await sleep(900);
    return true;
  } catch { return false; }
}

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('app.remotesf.com/jobs')) || context.pages().find(p => (p.url() || '').includes('app.remotesf.com'));
  await page.bringToFront();
  console.log('ACTION: focused CRM home');
  await sleep(1000);

  await click(page, 'text=/Add Job/i', 'Add Job');

  // Create new customer cleanly.
  await fill(page, 'input[name*="name" i], input[placeholder*="name" i]', 'AI BOT TEST', 'customer name');
  await fill(page, 'input[name*="email" i], input[placeholder*="email" i]', 'ai.bot.test@example.com', 'email');
  await fill(page, 'input[name*="phone" i], input[type="tel"], input[placeholder*="phone" i]', '6155550101', 'phone');
  await click(page, 'text=/Save/i, button:has-text("Save")', 'Save customer');

  await sleep(2500);

  // Move to estimate flow.
  await click(page, 'text=/Estimate/i', 'Estimate section');
  await click(page, 'text=/Add Estimate/i, button:has-text("Add Estimate")', 'Add Estimate');

  await sleep(2500);

  console.log('URL:', page.url());
  const body = await page.locator('body').innerText().catch(() => '');
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 20000));
  console.log('---FINAL_BODY_END---');
})();
