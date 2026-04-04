const { chromium } = require('playwright');
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
(async()=>{
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url()||'').includes('console.cloud.google.com'));
  if (!page) throw new Error('Google Auth Platform tab not found');
  await page.bringToFront();
  await sleep(1000);

  const scopes = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/drive.readonly'
  ].join('\n');

  // Use the large text area near 'Manually add scopes'
  const area = page.locator('textarea').first();
  await area.click({ timeout: 5000 }).catch(()=>{});
  await sleep(200);
  await area.fill(scopes).catch(()=>{});
  console.log('ACTION: pasted manual scopes');
  await sleep(500);

  await page.locator('button:has-text("Add to table"), text=/Add to table/i').first().click({ timeout: 4000 }).catch(()=>{});
  console.log('ACTION: clicked Add to table');
  await sleep(2000);

  await page.locator('button:has-text("Update"), text=/Update/i').first().click({ timeout: 4000 }).catch(()=>{});
  console.log('ACTION: clicked Update');
  await sleep(2000);

  await page.locator('button:has-text("Save"), text=/Save/i').first().click({ timeout: 4000 }).catch(()=>{});
  console.log('ACTION: clicked Save');
  await sleep(3000);

  const body = await page.locator('body').innerText().catch(()=> '');
  console.log('---FINAL_SCOPE_SAVE_STATE_START---');
  console.log(body.slice(0, 25000));
  console.log('---FINAL_SCOPE_SAVE_STATE_END---');
})();
