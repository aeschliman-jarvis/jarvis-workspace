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
    await page.waitForTimeout(2000);
    
    // Screenshot the page
    await page.screenshot({ path: 'autensa-page.png', fullPage: true });
    console.log('📸 Screenshot saved to autensa-page.png');
    
    // Get all interactive elements
    console.log('\n🔍 Finding all interactive elements...');
    const buttons = await page.locator('button, [role="button"], a, input, textarea, select').all();
    console.log(`Found ${buttons.length} interactive elements:\n`);
    
    for (let i = 0; i < Math.min(buttons.length, 30); i++) {
      const el = buttons[i];
      const text = (await el.textContent() || '').trim().slice(0, 60);
      const tag = await el.evaluate(e => e.tagName.toLowerCase());
      const role = await el.getAttribute('role') || '';
      const id = await el.getAttribute('id') || '';
      const classes = await el.getAttribute('class') || '';
      console.log(`  [${i}] <${tag}${role ? ` role="${role}"` : ''}${id ? ` id="${id}"` : ''}> "${text}"`);
      if (classes) console.log(`      classes: "${classes.slice(0, 80)}"`);
    }
    
    // Check for any modals or dialogs
    const modals = await page.locator('[role="dialog"], .modal, [class*="modal"], [class*="dialog"]').count();
    console.log(`\n📦 Modals/dialogs found: ${modals}`);
    
    await page.waitForTimeout(3000);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Done.');
  }
})();
