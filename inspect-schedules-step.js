const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--remote-debugging-port=9223']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🧭 Navigating to Step 3 (Schedules)...');
    await page.goto('http://localhost:4000/autopilot/new', { waitUntil: 'networkidle' });
    
    // Fast-forward to Step 3
    const inputs = await page.locator('input, textarea, select').all();
    await inputs[0].fill('Test');
    await inputs[1].fill('Test');
    await inputs[2].fill('https://test.com');
    await inputs[3].fill('https://test.com');
    await inputs[4].selectOption({ index: 0 });
    await inputs[5].fill('main');
    await page.getByRole('button', { name: 'Next: Product Program' }).click();
    await page.waitForTimeout(1000);
    await page.locator('textarea').first().fill('Test program');
    await page.getByRole('button', { name: 'Next: Schedules' }).click();
    await page.waitForTimeout(2000);

    console.log('📍 Current URL:', page.url());
    
    // Dump the entire visible text and button list
    const bodyText = await page.locator('body').textContent();
    console.log('Page Content:', bodyText.slice(0, 2000));

    console.log('\n🔘 All Buttons on Step 3:');
    const btns = await page.locator('button').all();
    for (let i = 0; i < btns.length; i++) {
      const text = (await btns[i].textContent() || '').trim();
      const classes = await btns[i].getAttribute('class') || '';
      console.log(`  [${i}] "${text}" [${classes.slice(0, 60)}]`);
    }

    // Check for any "Create" or "Launch" links
    console.log('\n🔗 All Links:');
    const links = await page.locator('a').all();
    for (let i = 0; i < links.length; i++) {
      const text = (await links[i].textContent() || '').trim();
      if (text) console.log(`  [${i}] "${text}" -> ${await links[i].getAttribute('href')}`);
    }

    await page.waitForTimeout(5000);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Done.');
  }
})();
