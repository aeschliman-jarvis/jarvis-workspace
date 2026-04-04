const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('crm.mygtrecords.info/software/html5.html'));
  await page.bringToFront();
  await page.waitForTimeout(2000);
  const html = await page.content();
  console.log('TITLE', await page.title());
  console.log('URL', page.url());
  console.log('HTML_PREVIEW');
  console.log(html.slice(0,8000));
  const frames = page.frames();
  console.log('FRAMES', frames.map(f => f.url()));
  for (const f of frames) {
    try {
      const txt = await f.locator('body').innerText().catch(()=> '');
      if (txt && txt.trim()) {
        console.log('FRAME_URL', f.url());
        console.log(txt.slice(0,3000));
      }
    } catch(e) {}
  }
  await browser.close();
})();
