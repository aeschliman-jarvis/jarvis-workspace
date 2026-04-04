const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('notion.so'));
  await page.bringToFront();
  await page.waitForTimeout(1200);
  const items = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('textarea, input, [contenteditable="true"], div[role="textbox"], h1[role="textbox"], [data-content-editable-leaf="true"]')).map((el, i) => ({
      i,
      tag: el.tagName,
      role: el.getAttribute('role'),
      ce: el.getAttribute('contenteditable'),
      text: (el.innerText || el.value || '').trim().slice(0,180),
      ph: el.getAttribute('placeholder') || '',
      cls: (el.className || '').toString().slice(0,180)
    }));
  });
  console.log(JSON.stringify(items, null, 2));
  await browser.close();
})();
