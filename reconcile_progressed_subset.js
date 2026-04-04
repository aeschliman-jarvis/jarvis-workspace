const { chromium } = require('playwright');
const targets = [
  {sheet:'Marlena Hollis', query:'Marlena Hollis'},
  {sheet:'Amanda Runyon', query:'Amanda Runyon'},
  {sheet:'Asha Sethi', query:'Asha Sethi'},
  {sheet:'Becky West', query:'Becky West'},
  {sheet:'Bonnie Hill (Lowe)', query:'Bonnie Lowe'},
  {sheet:'Charles Hobson', query:'Charles Hobson'},
  {sheet:'DeAnn Idso', query:'DeAnn Idso'},
  {sheet:'Debra Norris', query:'Debra Norris'},
  {sheet:'Jennifer Allen', query:'Jennifer Allen'},
  {sheet:'Lori Whitehurst', query:'Lori Whitehurst'},
  {sheet:'Robert Griffith', query:'Robert Griffith'},
  {sheet:'Ronald Champion', query:'Ronald Champion'},
  {sheet:'Shawn Jones', query:'Shawn Tracy Jones'},
  {sheet:'Laura Lovejoy', query:'Giles Laura Lovejoy'}
];
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('app.remotesf.com/jobs')) || context.pages()[0];
  await page.bringToFront();
  for (const t of targets) {
    try {
      await page.goto('https://app.remotesf.com/jobs', {waitUntil:'domcontentloaded'});
      await page.waitForTimeout(1800);
      const search = page.locator('input').first();
      await search.fill('');
      await search.fill(t.query);
      await page.waitForTimeout(2200);
      const body = await page.locator('body').innerText().catch(()=> '');
      const found = body.toLowerCase().includes(t.query.split(' ')[0].toLowerCase());
      console.log(`\nSHEET: ${t.sheet} | QUERY: ${t.query} | FOUND_HINT: ${found}`);
      const lines = body.split('\n').filter(l => {
        const low = l.toLowerCase();
        return t.query.toLowerCase().split(' ').some(tok => tok && tok.length>3 && low.includes(tok.toLowerCase())) || /(price|appointment|updated|view details|sales rep)/i.test(l);
      });
      console.log(lines.slice(0,25).join(' | '));
    } catch(e) {
      console.log(`SHEET: ${t.sheet} | ERROR: ${String(e)}`);
    }
  }
  await browser.close();
})();
