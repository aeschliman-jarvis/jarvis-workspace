const { chromium } = require('playwright');

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('notion.so')) || await context.newPage();
  await page.bringToFront();
  await page.waitForTimeout(1500);

  // Click Empty page from the chooser if present
  const emptyPage = page.getByText('Empty page', { exact: true }).first();
  if (await emptyPage.count().catch(()=>0)) {
    await emptyPage.click().catch(()=>{});
    await page.waitForTimeout(2500);
  }

  const body = await page.locator('body').innerText().catch(()=> '');
  console.log('AFTER_EMPTY_CLICK_URL', page.url());
  console.log(body.slice(0,3000));

  // Try to set page title
  const titleCandidates = [
    page.locator('textarea').first(),
    page.locator('[contenteditable="true"]').first(),
    page.locator('div[role="textbox"]').first(),
  ];

  for (const loc of titleCandidates) {
    try {
      if (await loc.count()) {
        await loc.click({ timeout: 1500 }).catch(()=>{});
        await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A').catch(()=>{});
        await page.keyboard.type('Jarvis Hub');
        await page.waitForTimeout(1500);
        break;
      }
    } catch (e) {}
  }

  console.log('FINAL_URL', page.url());
  console.log('FINAL_TITLE', await page.title());
  console.log((await page.locator('body').innerText().catch(()=> '')).slice(0,4000));
  await browser.close();
})();
