const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--remote-debugging-port=9223']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🧭 Navigating to localhost:4000/autopilot/new...');
    await page.goto('http://localhost:4000/autopilot/new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Fill fields quickly
    const inputs = await page.locator('input, textarea, select').all();
    await inputs[0].fill('Test Product');
    await inputs[1].fill('A test product for Jarvis');
    await inputs[2].fill('https://github.com/test/repo');
    await inputs[3].fill('https://test.com');
    await inputs[4].selectOption({ index: 0 });
    await inputs[5].fill('main');
    console.log('✅ All 6 fields filled.');

    // List ALL buttons on the page
    console.log('\n🔘 Listing ALL buttons:');
    const allButtons = await page.locator('button, a[role="button"], input[type="submit"], input[type="button"]').all();
    for (let i = 0; i < allButtons.length; i++) {
      const btn = allButtons[i];
      try {
        const text = (await btn.textContent() || '').trim();
        const type = await btn.getAttribute('type') || 'button';
        const disabled = await btn.isDisabled();
        const visible = await btn.isVisible();
        console.log(`  [${i}] "${text}" type="${type}" disabled=${disabled} visible=${visible}`);
      } catch (e) {}
    }

    // Also check for any clickable divs/spans
    console.log('\n🖱️  Checking for clickable elements with "create/submit/start" text:');
    const clickables = await page.locator('[class*="cursor-pointer"], [role="button"]').all();
    for (let i = 0; i < clickables.length; i++) {
      const el = clickables[i];
      try {
        const text = (await el.textContent() || '').trim();
        if (text.toLowerCase().match(/create|submit|start|launch|begin|save/)) {
          console.log(`  [${i}] "${text}"`);
        }
      } catch (e) {}
    }

    await page.screenshot({ path: 'product-form-buttons.png', fullPage: true });
    await page.waitForTimeout(5000);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Done.');
  }
})();
