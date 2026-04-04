const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--remote-debugging-port=9223']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Set up event listeners for network requests
  page.on('request', request => {
    if (request.url().includes('/api/') || request.url().includes('/trpc/')) {
      console.log(`🌐 ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/') || response.url().includes('/trpc/')) {
      const status = response.status();
      const text = await response.text().catch(() => '');
      console.log(`  ↳ ${status} ${text.slice(0, 200)}`);
    }
  });
  
  try {
    console.log('🧭 Navigating to localhost:4000...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Click "New Workspace"
    console.log('🖱️  Clicking "New Workspace"...');
    await page.getByRole('button', { name: 'New Workspace' }).click();
    await page.waitForTimeout(1500);
    
    // Wait for the modal/dialog to appear
    await page.waitForSelector('[role="dialog"], .modal, [class*="modal"], [class*="dialog"], form', { timeout: 5000 }).catch(() => {
      console.log('⚠️  No modal detected via standard selectors. Checking for overlays...');
    });
    
    // Screenshot the modal
    await page.screenshot({ path: 'claude-inspect-modal.png', fullPage: true });
    console.log('📸 Modal screenshot saved to claude-inspect-modal.png');
    
    // Get the full HTML of the body to understand the structure
    const html = await page.content();
    console.log('\n📄 Page HTML (first 5000 chars):');
    console.log(html.slice(0, 5000));
    
    // Find ALL inputs, textareas, selects, and contenteditables
    console.log('\n🔍 Finding ALL possible form fields...');
    const allFields = await page.locator('input, textarea, select, [contenteditable="true"]').all();
    console.log(`Found ${allFields.length} potential form fields.`);
    
    for (let i = 0; i < allFields.length; i++) {
      const field = allFields[i];
      try {
        const isVisible = await field.isVisible();
        if (!isVisible) continue;
        
        const type = await field.getAttribute('type') || 'text';
        const placeholder = await field.getAttribute('placeholder') || '';
        const name = await field.getAttribute('name') || '';
        const id = await field.getAttribute('id') || '';
        const tagName = await field.evaluate(el => el.tagName.toLowerCase());
        const parentText = await field.locator('xpath=ancestor::div[@class][1]').textContent().catch(() => '').slice(0, 100);
        
        console.log(`  [${i}] <${tagName}> type="${type}" placeholder="${placeholder}" name="${name}" id="${id}"`);
        if (parentText) console.log(`      context: "${parentText}"`);
      } catch (e) {
        // Skip stale references
      }
    }
    
    // Also check for any buttons
    console.log('\n🔘 Finding ALL buttons...');
    const allButtons = await page.locator('button, [role="button"], input[type="submit"], input[type="button"]').all();
    for (let i = 0; i < allButtons.length; i++) {
      const btn = allButtons[i];
      try {
        const isVisible = await btn.isVisible();
        if (!isVisible) continue;
        const text = (await btn.textContent() || '').trim();
        console.log(`  [${i}] "${text}"`);
      } catch (e) {}
    }
    
    await page.waitForTimeout(5000);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await page.screenshot({ path: 'claude-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 Inspection complete. Review claude-inspect-modal.png and the HTML output above.');
  }
})();
