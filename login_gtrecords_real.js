const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  await page.goto('https://crm.mygtrecords.info', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  console.log('TITLE', await page.title());
  let body = await page.locator('body').innerText().catch(()=> '');
  console.log('BODY_PREVIEW', body.slice(0,2000));

  const inputs = page.locator('input');
  const count = await inputs.count();
  for (let i=0;i<count;i++) {
    const ph = await inputs.nth(i).getAttribute('placeholder').catch(()=>null);
    const type = await inputs.nth(i).getAttribute('type').catch(()=>null);
    const name = await inputs.nth(i).getAttribute('name').catch(()=>null);
    const id = await inputs.nth(i).getAttribute('id').catch(()=>null);
    console.log('INPUT', i, {ph,type,name,id});
  }

  for (let i=0;i<count;i++) {
    const el = inputs.nth(i);
    const type = ((await el.getAttribute('type').catch(()=>'')) || '').toLowerCase();
    const name = ((await el.getAttribute('name').catch(()=>'')) || '').toLowerCase();
    const ph = ((await el.getAttribute('placeholder').catch(()=>'')) || '').toLowerCase();
    const id = ((await el.getAttribute('id').catch(()=>'')) || '').toLowerCase();
    if (type === 'password' || name.includes('pass') || ph.includes('pass') || id.includes('pass')) {
      await el.fill('Gt05006!').catch(()=>{});
    } else if (
      type === 'text' || type === 'email' ||
      name.includes('user') || name.includes('email') ||
      ph.includes('user') || ph.includes('email') ||
      id.includes('user') || id.includes('email') || id.includes('login')
    ) {
      await el.fill('JAeschliman').catch(()=>{});
    }
  }

  const buttons = page.locator('button, input[type=submit], a');
  const bcount = await buttons.count();
  for (let i=0;i<bcount;i++) {
    const txt = ((await buttons.nth(i).innerText().catch(()=>'')) || (await buttons.nth(i).getAttribute('value').catch(()=>'')) || '').trim();
    if (txt) console.log('BUTTON', i, txt);
  }

  let clicked = false;
  for (let i=0;i<bcount;i++) {
    const txt = (((await buttons.nth(i).innerText().catch(()=>'')) || (await buttons.nth(i).getAttribute('value').catch(()=>'')) || '').trim().toLowerCase());
    if (txt.includes('login') || txt.includes('log in') || txt.includes('sign in') || txt==='submit') {
      await buttons.nth(i).click().catch(()=>{});
      clicked = true;
      break;
    }
  }
  if (!clicked) {
    await page.keyboard.press('Enter').catch(()=>{});
  }

  await page.waitForTimeout(6000);
  console.log('FINAL_URL', page.url());
  console.log('FINAL_TITLE', await page.title());
  body = await page.locator('body').innerText().catch(()=> '');
  console.log('FINAL_BODY', body.slice(0,3000));
  await browser.close();
})();
