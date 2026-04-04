const { chromium } = require('playwright');

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('crm.mygtrecords.info/software/html5.html'));
  await page.bringToFront();
  await page.waitForTimeout(2000);

  async function shot(name) {
    const path = `/Users/jaeschliman/.openclaw/workspace/${name}.png`;
    await page.screenshot({ path, fullPage: false });
    console.log('SCREENSHOT', path);
  }

  await shot('gtrecords-01-start');

  const box = await page.locator('body').boundingBox();
  console.log('BODYBOX', JSON.stringify(box));

  // Click several likely useful areas to surface UI / menus.
  const points = [
    [120,80], [250,80], [400,80], [600,80],
    [80,140], [180,140], [300,140], [500,140],
    [60,220], [220,220], [500,220],
    [50,400], [250,400], [500,400],
    [50,700], [250,700], [500,700]
  ];

  let i = 2;
  for (const [x,y] of points) {
    try {
      await page.mouse.click(x,y);
      await page.waitForTimeout(1200);
      await shot(`gtrecords-${String(i).padStart(2,'0')}-${x}-${y}`);
      i++;
    } catch(e) {
      console.log('CLICKERR', x, y, String(e));
    }
  }

  await browser.close();
})();
