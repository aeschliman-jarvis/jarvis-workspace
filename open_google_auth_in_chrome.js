const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=719251948288-4hfiah8t1l5qj42j8c2erdl2v2fc632t.apps.googleusercontent.com&redirect_uri=http%3A%2F%2F127.0.0.1%3A8765%2Fcallback&response_type=code&scope=openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.modify+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.readonly&access_type=offline&prompt=consent&state=PIxHkxyzJksG_7LpaGbCbJwAb9AlPnwp';
  await page.goto(url, {waitUntil:'domcontentloaded'});
  await page.bringToFront();
  console.log('OPENED', page.url());
  await browser.close();
})();
