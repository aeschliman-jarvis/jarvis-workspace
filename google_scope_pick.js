const { chromium } = require('playwright');
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
(async()=>{
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url()||'').includes('console.cloud.google.com'));
  if (!page) throw new Error('Cloud Console tab not found');
  await page.bringToFront();
  await sleep(1200);

  console.log('URL:', page.url());
  let body = await page.locator('body').innerText().catch(()=> '');
  console.log('---SCOPES_PAGE_START---');
  console.log(body.slice(0, 25000));
  console.log('---SCOPES_PAGE_END---');

  // Try to click Add or Edit scopes if present.
  await page.locator('button:has-text("Add or remove scopes"), text=/Add or remove scopes/i').first().click({ timeout: 4000 }).catch(()=>{});
  await sleep(2000);
  body = await page.locator('body').innerText().catch(()=> '');
  console.log('---SCOPES_MODAL_START---');
  console.log(body.slice(0, 30000));
  console.log('---SCOPES_MODAL_END---');

  // Choose high-leverage scopes if visible.
  const desiredPatterns = [
    'gmail.modify',
    'gmail.readonly',
    'drive.readonly',
    'drive.file'
  ];

  for (const pat of desiredPatterns) {
    try {
      const loc = page.locator(`text=/${pat.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}/i`).first();
      await loc.scrollIntoViewIfNeeded().catch(()=>{});
      await sleep(300);
      // click checkbox nearby if possible, else click text.
      await loc.click({ timeout: 2500 }).catch(()=>{});
      console.log('ACTION: selected scope pattern ' + pat);
      await sleep(500);
    } catch {}
  }

  // Save/update scopes if button exists.
  await page.locator('button:has-text("Update"), button:has-text("Save"), text=/Update/i, text=/Save/i').first().click({ timeout: 4000 }).catch(()=>{});
  console.log('ACTION: attempted save scopes');
  await sleep(2000);

  body = await page.locator('body').innerText().catch(()=> '');
  console.log('---FINAL_SCOPES_STATE_START---');
  console.log(body.slice(0, 25000));
  console.log('---FINAL_SCOPES_STATE_END---');
})();
