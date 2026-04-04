const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Jarvis Precision Web Manipulation Initiated...');
  
  // Connect to the existing Chrome instance if possible, or launch new
  const browser = await chromium.launch({ 
    headless: false, 
    channel: 'chrome',
    args: ['--remote-debugging-port=9222']
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate directly to the form
  await page.goto('http://localhost:4000/autopilot/new', { waitUntil: 'networkidle' });
  console.log('📍 Navigated to New Product form.');

  // Helper to fill fields with human-like typing
  const fillField = async (selector, text) => {
    const el = page.locator(selector);
    await el.scrollIntoViewIfNeeded();
    await el.click();
    await el.fill(''); // Clear existing
    await el.type(text, { delay: 50 }); // Type with delay
    console.log(`✅ Filled: ${text.substring(0, 10)}...`);
  };

  try {
    // 1. Product Name
    await fillField('input[placeholder*="name" i], input[label*="name" i], input:nth-of-type(1)', 'Jarvis Workspace');
    
    // 2. Product Program (Description)
    await fillField('textarea[placeholder*="description" i], textarea[placeholder*="program" i], textarea', 'Personal AI OS for maximum leverage. Stack: Next.js, Tailwind, OpenClaw. Goal: Visual God View dashboard.');
    
    // 3. GitHub Repo
    await fillField('input[placeholder*="github" i], input[label*="repo" i], input:nth-of-type(2)', 'git@github.com:aeschliman-jarvis/jarvis-workspace.git');
    
    // 4. Live URL
    await fillField('input[placeholder*="url" i], input[label*="url" i], input:nth-of-type(3)', 'http://localhost:3002');
    
    // 5. Branch
    await fillField('input[placeholder*="branch" i], input[label*="branch" i], input:nth-of-type(4)', 'main');

    // 6. Submit
    const saveBtn = page.locator('button').filter({ hasText: /save|create|submit/i }).first();
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    console.log('🎯 Save button clicked. Awaiting system response...');

    // Wait for navigation or a success message
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Automation Error:', error.message);
  } finally {
    // Keep browser open so you can see the result
    await new Promise(() => {}); 
  }
})();
