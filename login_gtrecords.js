const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  await page.goto('https://granitecrm.com/', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  const body = await page.locator('body').innerText().catch(()=> '');
  console.log('TITLE', await page.title());
  console.log('BODY_PREVIEW', body.slice(0,2000));

  const user = page.locator('input').filter({has: page.locator('xpath=..')}).nth(0);
  const inputs = page.locator('input');
  const count = await inputs.count();
  for (let i=0;i<count;i++) {
    const ph = await inputs.nth(i).getAttribute('placeholder').catch(()=>null);
    const type = await inputs.nth(i).getAttribute('type').catch(()=>null);
    const name = await inputs.nth(i).getAttribute('name').catch(()=>null);
    console.log('INPUT', i, {ph,type,name});
  }

  // Best-effort fill
  for (let i=0;i<count;i++) {
    const el = inputs.nth(i);
    const type = (await el.getAttribute('type').catch(()=>'')) || '';
    const name = ((await el.getAttribute('name').catch(()=>'')) || '').toLowerCase();
    const ph = ((await el.getAttribute('placeholder').catch(()=>'')) || '').toLowerCase();
    if (type === 'password' || name.includes('pass') || ph.includes('pass')) {
      await el.fill('Gt05006!').catch(()=>{});
    } else if (type === 'text' || type === 'email' || name.includes('user') || ph.includes('user') || ph.includes('email')) {
      await el.fill('JAeschliman').catch(()=>{});
    }
  }

  const buttons = page.locator('button, input[type=submit]');
  const bcount = await buttons.count();
  for (let i=0;i<bcount;i++) {
    const txt = (await buttons.nth(i).innerText().catch(()=>'')) || (await buttons.nth(i).getAttribute('value').catch(()=>'')) || '';
    console.log('BUTTON', i, txt);
  }
  for (let i=0;i<bcount;i++) {
    const txt = ((await buttons.nth(i).innerText().catch(()=>'')) || (await buttons.nth(i).getAttribute('value').catch(()=>'')) || '').toLowerCase();
    if (txt.includes('login') || txt.includes('sign in') || txt.includes('log in')) {
      await buttons.nth(i).click().catch(()=>{});
      break;
    }
  }
  await page.waitForTimeout(5000);
  console.log('FINAL_URL', page.url());
  console.log('FINAL_TITLE', await page.title());
  console.log('FINAL_BODY', (await page.locator('body').innerText().catch(()=> '')).slice(0,2500));
  await browser.close();
})();
