const { chromium } = require('playwright');
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function click(page, sel, label, timeout=5000){
  try {
    await page.locator(sel).first().click({ timeout });
    console.log('ACTION: clicked '+label+' via '+sel);
    await sleep(1200);
    return true;
  } catch { return false; }
}

async function openApiAndEnable(page, url, name){
  await page.goto(url, { waitUntil:'domcontentloaded', timeout:30000 }).catch(()=>{});
  console.log('ACTION: opened '+name+' page');
  await sleep(3000);
  await click(page, 'button:has-text("Enable")', 'Enable '+name, 6000);
  await click(page, 'text=/Enable/i', 'Enable text '+name, 6000);
  await sleep(4000);
  console.log('ACTION: attempted enable for '+name);
}

(async()=>{
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url()||'').includes('console.cloud.google.com'));
  if (!page) throw new Error('Cloud Console tab not found');
  await page.bringToFront();
  console.log('ACTION: focused Cloud Console');
  await sleep(1000);

  // Open Gmail API directly.
  await openApiAndEnable(page, 'https://console.cloud.google.com/apis/library/gmail.googleapis.com', 'Gmail API');

  // Open Drive API directly.
  await openApiAndEnable(page, 'https://console.cloud.google.com/apis/library/drive.googleapis.com', 'Google Drive API');

  console.log('URL:', page.url());
  const body = await page.locator('body').innerText().catch(()=> '');
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 20000));
  console.log('---FINAL_BODY_END---');
})();
