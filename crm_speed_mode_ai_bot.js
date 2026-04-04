const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function tryFill(page, selectors, value, label) {
  for (const sel of selectors) {
    try {
      const loc = page.locator(sel).first();
      if (await loc.count()) {
        await loc.click({ timeout: 2000 });
        await sleep(150);
        await loc.fill(value);
        console.log('ACTION: filled ' + label + ' = ' + value + ' via ' + sel);
        await sleep(300);
        return true;
      }
    } catch {}
  }
  return false;
}

async function tryClick(page, selectors, label) {
  for (const sel of selectors) {
    try {
      await page.locator(sel).first().click({ timeout: 2500 });
      console.log('ACTION: clicked ' + label + ' via ' + sel);
      await sleep(500);
      return true;
    } catch {}
  }
  return false;
}

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('app.remotesf.com')) || context.pages()[0];
  await page.bringToFront();
  console.log('ACTION: focused CRM page');
  await sleep(500);

  // If not already on new job info, go there fast.
  if (!page.url().includes('/jobs/new/info')) {
    await page.goto('https://app.remotesf.com/jobs/new/info', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    console.log('ACTION: opened new job info');
    await sleep(700);
  }

  await tryFill(page, ['input[name*="customer" i]', 'input[placeholder*="customer" i]', 'input[name*="name" i]'], 'AI BOT TEST', 'customer name');
  await tryFill(page, ['input[name*="email" i]', 'input[placeholder*="email" i]'], 'ai.bot.test@example.com', 'email');
  await tryFill(page, ['input[name*="phone" i]', 'input[type="tel"]', 'input[placeholder*="phone" i]'], '6155550101', 'phone');
  await tryFill(page, ['input[name*="job" i]', 'input[placeholder*="job" i]'], 'AI BOT TEST JOB', 'job name');
  await tryFill(page, ['input[name*="address" i]', 'input[placeholder*="address" i]'], '123 Test St', 'address');
  await tryFill(page, ['input[name*="city" i]', 'input[placeholder*="city" i]'], 'Nashville', 'city');
  await tryFill(page, ['input[name*="postal" i]', 'input[name*="zip" i]', 'input[placeholder*="postal" i]'], '37211', 'postal');

  // Set state if possible.
  try {
    const stateSel = page.locator('select').nth(1);
    await stateSel.selectOption({ label: 'Tennessee' }).catch(async () => await stateSel.selectOption('Tennessee').catch(() => {}));
    console.log('ACTION: selected state Tennessee');
    await sleep(300);
  } catch {}

  // Set job type if possible.
  try {
    const selects = page.locator('select');
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      const s = selects.nth(i);
      const txt = await s.textContent().catch(() => '');
      if ((txt || '').includes('Select')) {
        await s.selectOption({ index: 1 }).catch(() => {});
        console.log('ACTION: selected first available option in select #' + i);
        await sleep(300);
      }
    }
  } catch {}

  await tryClick(page, ['button:has-text("Save Changes")', 'text=/Save Changes/i'], 'Save customer info');
  await sleep(1500);

  // If customer saved, push immediately to estimate section.
  await tryClick(page, ['text=/Estimate/i'], 'Estimate section');
  await tryClick(page, ['button:has-text("Add Estimate")', 'text=/Add Estimate/i'], 'Add Estimate');
  await sleep(1500);

  const body = await page.locator('body').innerText().catch(() => '');
  console.log('URL:', page.url());
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 20000));
  console.log('---FINAL_BODY_END---');
})();
