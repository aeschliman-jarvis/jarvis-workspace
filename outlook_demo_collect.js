const { chromium } = require('playwright');
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

(async()=>{
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const pages = context.pages();
  let page = pages.find(p => (p.url()||'').includes('outlook.office.com'));
  if (!page) throw new Error('Outlook tab not found');
  await page.bringToFront();
  console.log('ACTION: focused Outlook tab');
  await sleep(1200);

  // Calendar read
  await page.goto('https://outlook.office.com/calendar/view/week', { waitUntil:'domcontentloaded', timeout:30000 }).catch(()=>{});
  console.log('ACTION: opened Outlook calendar');
  await sleep(2500);
  const calText = await page.locator('body').innerText().catch(()=> '');
  console.log('---CALENDAR_START---');
  console.log(calText.slice(0, 15000));
  console.log('---CALENDAR_END---');

  // Mail search pass
  await page.goto('https://outlook.office.com/mail/', { waitUntil:'domcontentloaded', timeout:30000 }).catch(()=>{});
  console.log('ACTION: opened Outlook mail');
  await sleep(2500);

  const queries = ['username', 'password', 'login', 'portal', 'link', 'document'];
  const results = [];

  for (const q of queries) {
    try {
      const search = page.locator('input[placeholder*="Search" i], input[aria-label*="Search" i], input[type="search"]').first();
      await search.click({ timeout: 5000 });
      await sleep(300);
      await search.fill(q);
      await sleep(500);
      await search.press('Enter');
      console.log('ACTION: searched mail for ' + q);
      await sleep(2500);
      const body = await page.locator('body').innerText().catch(()=> '');
      results.push({ query: q, text: body.slice(0, 12000) });
    } catch (e) {
      results.push({ query: q, text: 'SEARCH_FAILED' });
    }
  }

  console.log('---MAIL_RESULTS_START---');
  console.log(JSON.stringify(results, null, 2));
  console.log('---MAIL_RESULTS_END---');
})();
