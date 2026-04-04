const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--remote-debugging-port=9223']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1
    console.log('1️⃣  Product Details');
    await page.goto('http://localhost:4000/autopilot/new', { waitUntil: 'networkidle' });
    const inputs = await page.locator('input, textarea, select').all();
    await inputs[0].fill('Autensa Form Automation');
    await inputs[1].fill('A high-agency agent that pilots the Mission Control UI to fill forms and verify data.');
    await inputs[2].fill('https://github.com/aeschliman-jarvis/jarvis-workspace');
    await inputs[3].fill('https://localhost:4000');
    await inputs[4].selectOption({ index: 0 });
    await inputs[5].fill('main');
    await page.getByRole('button', { name: 'Next: Product Program' }).click();
    await page.waitForTimeout(1000);

    // Step 2
    console.log('2️⃣  Product Program');
    await page.locator('textarea').first().fill(`## Purpose
To provide a hands-free way to interact with the Mission Control dashboard for testing and operations.

## Target Users
Jacob (System Operator) who needs to verify form integrity and agent behavior.

## Priorities
- Zero manual typing
- robust against UI changes
- clear visual feedback via screenshots

## Directives
Research best practices for Playwright accessibility tree mapping.`);
    await page.getByRole('button', { name: 'Next: Schedules' }).click();
    await page.waitForTimeout(1000);

    // Step 3
    console.log('3️⃣  Schedules & Launch');
    await page.getByRole('button', { name: 'Go to Product Dashboard' }).click();
    
    // Wait for the product to be created and the dashboard to load
    await page.waitForURL(/\/autopilot\/product\//, { timeout: 10000 });
    console.log('📍 Product Dashboard URL:', page.url());
    
    await page.screenshot({ path: 'product-dashboard-success.png', fullPage: true });
    console.log('✅ Product created and dashboard loaded!');

    await page.waitForTimeout(5000);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await page.screenshot({ path: 'full-flow-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 Mission complete.');
  }
})();
