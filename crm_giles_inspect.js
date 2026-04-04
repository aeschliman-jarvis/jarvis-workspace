const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const pages = context.pages();
  const page = pages.find(p => (p.url() || '').includes('app.remotesf.com/jobs')) || pages[0];
  await page.bringToFront();
  console.log('ACTION: focused CRM tab');
  await sleep(2000);

  // Try a few likely search/input patterns.
  const searchSelectors = [
    'input[placeholder*="Search" i]',
    'input[type="search"]',
    'input[name*="search" i]',
    'input[aria-label*="Search" i]',
    'input'
  ];

  let usedSearch = false;
  for (const sel of searchSelectors) {
    const loc = page.locator(sel).first();
    try {
      if (await loc.count()) {
        await loc.click({ timeout: 2000 });
        await sleep(1000);
        await loc.fill('Giles Lovejoy');
        await sleep(1000);
        await loc.press('Enter');
        usedSearch = true;
        console.log('ACTION: searched for Giles Lovejoy using ' + sel);
        break;
      }
    } catch {}
  }

  await sleep(3000);

  // If search didn’t clearly work, try clicking text links/buttons containing the name.
  const textTargets = page.locator('text=/Giles Lovejoy/i');
  const count = await textTargets.count().catch(() => 0);
  if (count > 0) {
    await textTargets.first().click({ timeout: 5000 }).catch(() => {});
    console.log('ACTION: clicked Giles Lovejoy');
    await sleep(3000);
  }

  // Try to open estimate if visible.
  const estimateTargets = page.locator('text=/estimate/i');
  const ecount = await estimateTargets.count().catch(() => 0);
  if (ecount > 0) {
    await estimateTargets.first().click({ timeout: 5000 }).catch(() => {});
    console.log('ACTION: clicked estimate');
    await sleep(3000);
  }

  const title = await page.title().catch(() => '');
  const url = page.url();
  const bodyText = await page.locator('body').innerText().catch(() => '');
  console.log('---PAGE_TITLE---');
  console.log(title);
  console.log('---PAGE_URL---');
  console.log(url);
  console.log('---BODY_SNIPPET_START---');
  console.log(bodyText.slice(0, 12000));
  console.log('---BODY_SNIPPET_END---');
})();
