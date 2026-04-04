const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('/3362225c1eac80cfa382dda618acb112')) || context.pages().find(p => p.url().includes('notion.so'));
  await page.bringToFront();
  await page.waitForTimeout(1200);

  const items = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('textarea, input, [contenteditable="true"], div[role="textbox"], h1, h2'))
      .map((el, i) => ({
        i,
        tag: el.tagName,
        role: el.getAttribute('role'),
        text: (el.innerText || el.value || '').trim().slice(0,120),
        ph: el.getAttribute('placeholder'),
        cls: el.className,
      }))
      .slice(0,80);
  });
  console.log(JSON.stringify(items, null, 2));
  await browser.close();
})();
