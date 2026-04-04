const { chromium } = require('playwright');
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function openThread(page, pattern, label){
  try {
    await page.locator(`text=/${pattern.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}/i`).first().click({ timeout: 5000 });
    console.log('ACTION: opened thread ' + label);
    await sleep(2500);
    const body = await page.locator('body').innerText().catch(()=> '');
    console.log(`---THREAD_${label}_START---`);
    console.log(body.slice(0, 18000));
    console.log(`---THREAD_${label}_END---`);
    await page.goBack({ waitUntil:'domcontentloaded', timeout:20000 }).catch(()=>{});
    await sleep(2000);
    return true;
  } catch (e) {
    console.log('FAILED_OPEN ' + label);
    return false;
  }
}

(async()=>{
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url()||'').includes('mail.google.com'));
  if (!page) throw new Error('Gmail tab not found');
  await page.bringToFront();
  await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil:'domcontentloaded', timeout:30000 }).catch(()=>{});
  await sleep(2500);
  console.log('ACTION: reopened Gmail inbox');

  await openThread(page, 'Security alert', 'security');
  await openThread(page, 'Deadline Approaching - 2026 MBSA COACH BACKGROUND SCREENING REQUIRED', 'mbsa');
  await openThread(page, 'Spreadsheet shared with you: "Sold Jobs Redo"', 'sold_jobs');
  await openThread(page, 'Important account update', 'capital_one_update');
  await openThread(page, 'You have only 25% of your iCloud storage left', 'icloud');
})();
