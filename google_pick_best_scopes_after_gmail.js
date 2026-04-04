const { chromium } = require('playwright');
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

(async()=>{
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url()||'').includes('/apis/credentials/wizard')) || context.pages().find(p => (p.url()||'').includes('console.cloud.google.com'));
  if (!page) throw new Error('OAuth scopes page not found');
  await page.bringToFront();
  await sleep(1000);

  // Re-open add/remove scopes list if needed.
  await page.locator('button:has-text("Add or remove scopes"), text=/Add or remove scopes/i').first().click({ timeout: 4000 }).catch(()=>{});
  await sleep(2000);

  const body = await page.locator('body').innerText().catch(()=> '');
  console.log('---SCOPES_REFRESHED_START---');
  console.log(body.slice(0, 30000));
  console.log('---SCOPES_REFRESHED_END---');

  // Highest-leverage subset:
  // openid, userinfo.email, userinfo.profile, drive.file, drive.readonly, gmail.modify
  const preferred = [
    'openid',
    'userinfo.email',
    'userinfo.profile',
    'drive.file',
    'drive.readonly',
    'gmail.modify'
  ];

  for (const pat of preferred) {
    try {
      const row = page.locator(`text=/${pat.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}/i`).first();
      await row.scrollIntoViewIfNeeded().catch(()=>{});
      await sleep(200);
      await row.click({ timeout: 3000 }).catch(()=>{});
      console.log('ACTION: selected scope ' + pat);
      await sleep(500);
    } catch {}
  }

  await page.locator('button:has-text("Update"), text=/Update/i').first().click({ timeout: 5000 }).catch(()=>{});
  console.log('ACTION: clicked Update scopes');
  await sleep(2500);

  const finalBody = await page.locator('body').innerText().catch(()=> '');
  console.log('---FINAL_SCOPE_STATE_START---');
  console.log(finalBody.slice(0, 25000));
  console.log('---FINAL_SCOPE_STATE_END---');
})();
