const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('/jobs/4440698/estimates/2704891')) || context.pages().find(p => (p.url() || '').includes('app.remotesf.com'));
  await page.bringToFront();
  console.log('ACTION: focused Jarvis estimate');
  await sleep(1200);

  // Open a single line item flow cleanly.
  try { await page.locator('text=/Add Line Item/i').first().click({ timeout: 5000 }); console.log('ACTION: clicked Add Line Item'); } catch {}
  await sleep(2000);

  // Explicit product selection path.
  const prodSel = page.locator('text=/Select Product/i').first();
  await prodSel.click({ timeout: 5000 }).catch(() => {});
  console.log('ACTION: clicked Select Product');
  await sleep(1200);

  const search = page.locator('input[placeholder*="search" i], input[type="search"], input').first();
  await search.click({ timeout: 5000 }).catch(() => {});
  await sleep(500);
  await search.fill('Onyx Shower').catch(() => {});
  console.log('ACTION: searched Onyx Shower');
  await sleep(1200);

  await page.locator('text=/Onyx Shower/i').first().click({ timeout: 5000 }).catch(() => {});
  console.log('ACTION: selected Onyx Shower');
  await sleep(2000);

  // After selecting, dump actionable controls on screen so the exact workflow can be seen.
  const snapshot1 = await page.evaluate(() => {
    const items = [];
    const els = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="combobox"], [role="option"], label, div, span'));
    for (const el of els) {
      const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
      const tag = el.tagName;
      const role = el.getAttribute('role') || '';
      const placeholder = el.getAttribute('placeholder') || '';
      const name = el.getAttribute('name') || '';
      if (!text && !placeholder && !name) continue;
      if ((text + placeholder + name).length > 120) continue;
      items.push({ tag, role, text, placeholder, name });
    }
    return items.slice(0, 400);
  });
  console.log('---AFTER_SELECT_CONTROLS_START---');
  console.log(JSON.stringify(snapshot1, null, 2));
  console.log('---AFTER_SELECT_CONTROLS_END---');

  // Attempt targeted option clicks only if visibly present.
  const prefs = ['30 x 60', '96', 'Breeze'];
  for (const pref of prefs) {
    try {
      await page.locator(`text=/${pref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/i`).first().click({ timeout: 2000 });
      console.log('ACTION: clicked preference ' + pref);
      await sleep(1000);
    } catch {}
  }

  // Capture controls again after preference clicks.
  const snapshot2 = await page.evaluate(() => {
    const items = [];
    const els = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="combobox"], [role="option"], label, div, span'));
    for (const el of els) {
      const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
      const tag = el.tagName;
      const role = el.getAttribute('role') || '';
      const placeholder = el.getAttribute('placeholder') || '';
      const name = el.getAttribute('name') || '';
      if (!text && !placeholder && !name) continue;
      if ((text + placeholder + name).length > 120) continue;
      items.push({ tag, role, text, placeholder, name });
    }
    return items.slice(0, 400);
  });
  console.log('---AFTER_PREF_CONTROLS_START---');
  console.log(JSON.stringify(snapshot2, null, 2));
  console.log('---AFTER_PREF_CONTROLS_END---');

  const title = await page.title().catch(() => '');
  const url = page.url();
  const body = await page.locator('body').innerText().catch(() => '');
  console.log('---FINAL_TITLE---');
  console.log(title);
  console.log('---FINAL_URL---');
  console.log(url);
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 25000));
  console.log('---FINAL_BODY_END---');
})();
