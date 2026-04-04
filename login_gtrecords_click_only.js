const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  await page.goto('https://crm.mygtrecords.info', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);

  // Fill only username + password, leave domain alone.
  const user = page.locator('input[name="username"], #Editbox1').first();
  const pass = page.locator('input[name="Password"], #Editbox2').first();
  await user.fill('JAeschliman');
  await pass.fill('Gt05006!');

  const logon = page.locator('#buttonLogOn, input[type="button"]');
  await logon.first().click();
  await page.waitForTimeout(8000);

  console.log('FINAL_URL', page.url());
  console.log('FINAL_TITLE', await page.title());
  const body = await page.locator('body').innerText().catch(()=> '');
  console.log('FINAL_BODY', body.slice(0,3000));
  await browser.close();
})();
