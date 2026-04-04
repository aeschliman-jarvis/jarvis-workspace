const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('notion.so'));
  await page.bringToFront();
  await page.waitForTimeout(1000);
  const info = await page.evaluate(() => {
    const title = Array.from(document.querySelectorAll('h1[role="textbox"]')).find(el => /Granite Transformations/i.test(el.innerText || ''));
    if (!title) return { error: 'no title' };
    function walk(el, depth=0) {
      if (!el || depth > 6) return null;
      return {
        tag: el.tagName,
        role: el.getAttribute('role'),
        ce: el.getAttribute('contenteditable'),
        cls: (el.className || '').toString().slice(0,200),
        text: (el.innerText || '').trim().slice(0,180),
        parent: walk(el.parentElement, depth + 1)
      };
    }
    return walk(title);
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
