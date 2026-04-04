const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('/3362225c1eac80cfa382dda618acb112')) || context.pages().find(p => p.url().includes('notion.so'));
  await page.bringToFront();
  await page.waitForTimeout(1500);

  const titleLocs = [
    page.locator('textarea').first(),
    page.locator('[contenteditable="true"]').first(),
    page.locator('div[role="textbox"]').first(),
  ];

  for (const loc of titleLocs) {
    try {
      if (await loc.count()) {
        await loc.click({ timeout: 1000 }).catch(()=>{});
        await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A').catch(()=>{});
        await page.keyboard.type('Jarvis Hub');
        await page.waitForTimeout(1500);
        break;
      }
    } catch (e) {}
  }

  console.log('TITLE', await page.title());
  console.log('BODY', (await page.locator('body').innerText().catch(()=> '')).slice(0,3000));
  await browser.close();
})();
