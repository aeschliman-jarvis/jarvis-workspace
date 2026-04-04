const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--remote-debugging-port=9223']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log(`  [Browser] ${msg.type()}: ${msg.text().slice(0, 100)}`));
  
  try {
    console.log('🧭 Navigating to localhost:4000/autopilot...');
    await page.goto('http://localhost:4000/autopilot', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('📦 Looking for "Create First Product" button...');
    // Try multiple selectors
    const btn = await page.locator('button:has-text("Create First Product"), button:has-text("Create Product"), a:has-text("Create First Product")').first();
    
    if (await btn.count() > 0) {
      console.log('✅ Found the button. Clicking...');
      await btn.click();
      
      // Wait for either a navigation or a modal
      await Promise.race([
        page.waitForNavigation({ timeout: 10000 }).catch(() => null),
        page.waitForSelector('[role="dialog"], form, [class*="modal"]', { timeout: 10000 }).catch(() => null),
        page.waitForTimeout(5000)
      ]);
      
      console.log('📍 Current URL:', page.url());
      await page.screenshot({ path: 'after-create-product.png', fullPage: true });
      console.log('📸 Screenshot saved.');

      // Check for form fields
      const inputs = await page.locator('input, textarea, select').all();
      console.log(`\n🔍 Found ${inputs.length} form fields.`);
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        try {
          const type = await input.getAttribute('type') || 'text';
          const placeholder = await input.getAttribute('placeholder') || '';
          console.log(`  [${i}] type="${type}" placeholder="${placeholder}"`);
        } catch (e) {}
      }
    } else {
      console.log('❌ Button not found. Dumping page text...');
      const text = await page.locator('body').textContent();
      console.log(text.slice(0, 1500));
    }

    await page.waitForTimeout(5000);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Done.');
  }
})();
