const { chromium } = require('playwright');
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function searchAndOpen(page, query, subjectHint){
  const search = page.locator('input[placeholder*="Search" i], input[aria-label*="Search" i], input[type="search"]').first();
  await search.click({ timeout: 5000 });
  await sleep(200);
  await search.fill(query);
  await sleep(400);
  await search.press('Enter');
  await sleep(2500);
  const target = page.locator(`text=/${subjectHint.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}/i`).first();
  await target.click({ timeout: 5000 }).catch(()=>{});
  await sleep(2500);
  const body = await page.locator('body').innerText().catch(()=> '');
  return body.slice(0, 20000);
}

(async()=>{
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url()||'').includes('outlook.cloud.microsoft/mail')) || context.pages().find(p => (p.url()||'').includes('outlook.office.com/mail'));
  if (!page) throw new Error('Outlook mail tab not found');
  await page.bringToFront();
  await page.goto('https://outlook.cloud.microsoft/mail/', { waitUntil:'domcontentloaded', timeout:30000 }).catch(()=>{});
  await sleep(2500);
  console.log('ACTION: opened Outlook mail');

  const outputs = {};
  outputs.gtrc = await searchAndOpen(page, 'GTRC Credentials', 'GTRC Credentials');
  outputs.gravity = await searchAndOpen(page, 'Gravity Password Update', 'Gravity Password Update');
  outputs.wisetackCreate = await searchAndOpen(page, 'Wisetack account created', 'Wisetack account created');
  outputs.wisetackPortal = await searchAndOpen(page, 'Wisetack merchant portal', 'added as a user');
  outputs.aquaPortal = await searchAndOpen(page, 'Aqua Finance Welcome to our Dealer Portal', 'Dealer Portal');
  outputs.aquaMaterial = await searchAndOpen(page, 'Post Training Material / Aqua', 'Post Training Material / Aqua');
  outputs.signedAgreement = await searchAndOpen(page, 'signed contract Shawn Tracy Jones', 'signed');

  console.log('---OPENED_MAILS_START---');
  console.log(JSON.stringify(outputs, null, 2));
  console.log('---OPENED_MAILS_END---');
})();
