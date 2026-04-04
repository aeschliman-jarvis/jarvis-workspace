const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  await page.goto('https://crm.mygtrecords.info', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  await page.locator('input[name="username"], #Editbox1').first().fill('Jaeschliman');
  await page.locator('input[name="Password"], #Editbox2').first().fill('Gtr05006!');
  await page.locator('#buttonLogOn').click();
  await page.waitForTimeout(10000);
  console.log('FINAL_URL', page.url());
  console.log('FINAL_TITLE', await page.title());
  const body = await page.locator('body').innerText().catch(()=> '');
  console.log('FINAL_BODY', body.slice(0,4000));
  await browser.close();
})();
