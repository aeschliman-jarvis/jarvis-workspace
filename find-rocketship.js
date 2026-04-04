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

    // Step 1: Enter the Default Workspace
    console.log('🚪 Entering "Default Workspace"...');
    await page.getByRole('link', { name: /Default Workspace/ }).click();
    await page.waitForTimeout(2000);

    // Step 2: Dump the entire header HTML to find the rocketship
    console.log('🚀 Dumping header content to find the rocketship...');
    const headerHTML = await page.locator('header').innerHTML().catch(() => '');
    console.log('--- HEADER HTML ---');
    console.log(headerHTML);
    console.log('--- END HEADER ---\n');

    // Step 3: List all SVGs and Icons
    console.log('🔍 Listing all SVGs/Icons in the header...');
    const svgs = await page.locator('header svg, header [class*="icon"]').all();
    for (let i = 0; i < svgs.length; i++) {
      const svg = svgs[i];
      const parentText = await svg.locator('xpath=ancestor::button[1] | ancestor::a[1]').textContent().catch(() => '');
      const classes = await svg.getAttribute('class') || '';
      console.log(`  [${i}] classes="${classes.slice(0, 50)}" parent="${parentText.trim()}"`);
    }

    await page.waitForTimeout(5000);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Done.');
  }
})();
