const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🧭 Going to the Autopilot Dashboard...');
    await page.goto('http://localhost:4000/autopilot', { waitUntil: 'networkidle' });
    
    // Find the "Jarvis Dashboard v2" product link
    console.log('🔍 Looking for "Jarvis Dashboard v2"...');
    const productLink = page.getByRole('link', { name: /Jarvis Dashboard v2/i });
    
    if (await productLink.count() > 0) {
      await productLink.click();
      await page.waitForTimeout(3000);
      console.log('📍 Inside the product. Current URL:', page.url());
      
      // Take a screenshot of the product view
      await page.screenshot({ path: 'product-view-inspect.png', fullPage: true });
      console.log('📸 Screenshot saved to product-view-inspect.png');

      // Look for any "Run", "Trigger", or "New Task" buttons
      console.log('\n🔘 Searching for trigger buttons...');
      const buttons = await page.locator('button').all();
      for (let i = 0; i < buttons.length; i++) {
        const text = (await buttons[i].textContent() || '').trim();
        if (text && text.match(/run|trigger|start|new|task|ideate/i)) {
          console.log(`  [${i}] "${text}"`);
        }
      }

      // Look for an "Ideas" or "Missions" tab
      console.log('\n📑 Searching for tabs/sections...');
      const tabs = await page.locator('a, [role="tab"], button[class*="tab"]').all();
      for (let i = 0; i < tabs.length; i++) {
        const text = (await tabs[i].textContent() || '').trim();
        if (text) console.log(`  [${i}] "${text}"`);
      }

    } else {
      console.log('❌ Could not find "Jarvis Dashboard v2" on the main page.');
    }

    await page.waitForTimeout(5000);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
  }
})();
