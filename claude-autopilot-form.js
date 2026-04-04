const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--remote-debugging-port=9223']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🧭 Navigating to localhost:4000...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('🚪 Entering "Default Workspace"...');
    await page.getByRole('link', { name: /Default Workspace/ }).click();
    await page.waitForTimeout(2000);

    console.log('🚀 Clicking the Rocketship (Autopilot)...');
    await page.getByRole('link', { name: 'Autopilot' }).click();
    await page.waitForTimeout(3000);

    console.log('📍 Current URL:', page.url());
    await page.screenshot({ path: 'autopilot-page.png', fullPage: true });
    console.log('📸 Screenshot saved to autopilot-page.png');

    // Inspect the page for forms/inputs
    console.log('\n🔍 Inspecting Autopilot page content...');
    const bodyText = await page.locator('body').textContent();
    console.log('Page text preview:', bodyText.slice(0, 1000));

    const inputs = await page.locator('input, textarea, select').all();
    console.log(`\nFound ${inputs.length} form fields.`);
    
    const buttons = await page.locator('button, [role="button"]').all();
    console.log(`Found ${buttons.length} buttons.`);
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      const text = (await btn.textContent() || '').trim();
      if (text) console.log(`  [${i}] "${text}"`);
    }

    await page.waitForTimeout(5000);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Done.');
  }
})();
