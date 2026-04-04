const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fillByLabel(page, labelText, value) {
  try {
    const label = page.locator(`text=${labelText}`).first();
    const box = label.locator('xpath=following::input[1]').first();
    await box.click({ timeout: 3000 });
    await sleep(150);
    await box.fill(value);
    console.log(`ACTION: filled ${labelText} = ${value}`);
    await sleep(400);
    return true;
  } catch { return false; }
}

async function clickOne(page, selectors, label) {
  for (const sel of selectors) {
    try {
      await page.locator(sel).first().click({ timeout: 3000 });
      console.log('ACTION: clicked ' + label + ' via ' + sel);
      await sleep(700);
      return true;
    } catch {}
  }
  return false;
}

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('/jobs/new/info')) || context.pages().find(p => (p.url() || '').includes('app.remotesf.com'));
  await page.bringToFront();
  console.log('ACTION: focused customer info page');
  await sleep(500);

  await fillByLabel(page, "CUSTOMER'S NAME", 'Bob Smith');
  await fillByLabel(page, "CUSTOMER'S EMAIL ADDRESS", 'bob.smith@example.com');
  await fillByLabel(page, "CUSTOMER'S PHONE NUMBERS", '6155550123');

  await clickOne(page, ['button:has-text("Save Changes")', 'text=/Save Changes/i'], 'Save customer info');
  await sleep(1500);

  await clickOne(page, ['text=/Estimate/i'], 'Estimate section');
  await clickOne(page, ['button:has-text("Add Estimate")', 'text=/Add Estimate/i'], 'Add Estimate');
  await sleep(1500);

  console.log('URL:', page.url());
  const body = await page.locator('body').innerText().catch(() => '');
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 15000));
  console.log('---FINAL_BODY_END---');
})();
