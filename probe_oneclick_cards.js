const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('app.remotesf.com/jobs'));
  await page.bringToFront();
  await page.waitForLoadState('domcontentloaded');
  const info = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const textHits = all.filter(el => {
      const t = (el.innerText || '').trim();
      return t && /(sold|closed|won|purple|contract|deposit|check)/i.test(t);
    }).slice(0,120).map(el => ({text:(el.innerText||'').trim().slice(0,300), cls:el.className || '', tag:el.tagName}));
    const styleHits = all.filter(el => {
      const s = getComputedStyle(el);
      return (s.backgroundColor && /rgb\((1[0-9]{2}|[2-9][0-9]),\s*(0|[0-9]{1,2}),\s*(1[0-9]{2}|[2-9][0-9])\)/.test(s.backgroundColor)) ||
             (s.color && /rgb\((1[0-9]{2}|[2-9][0-9]),\s*(0|[0-9]{1,2}),\s*(1[0-9]{2}|[2-9][0-9])\)/.test(s.color));
    }).slice(0,120).map(el => ({text:(el.innerText||'').trim().slice(0,200), cls:el.className || '', tag:el.tagName, bg:getComputedStyle(el).backgroundColor, color:getComputedStyle(el).color}));
    return {textHits, styleHits};
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
