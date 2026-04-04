#!/usr/bin/env node
/**
 * Jarvis: Create Autopilot Product
 * 
 * A high-agency, one-command script to launch a new product 
 * into the Autensa Mission Control system.
 * 
 * Usage: node jarvis-create-product.js "My Product" "My Description"
 */

const { chromium } = require('playwright');

const PRODUCT_NAME = process.argv[2] || 'Jarvis Autonomous Agent';
const PRODUCT_DESC = process.argv[3] || 'A high-agency operator for Jacob that handles complex UI interactions and form submissions autonomously.';
const REPO_URL = process.argv[4] || 'https://github.com/aeschliman-jarvis/jarvis-workspace';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log(`🚀 Launching: ${PRODUCT_NAME}`);
    
    // 1. Navigate and Fill Details
    await page.goto('http://localhost:4000/autopilot/new', { waitUntil: 'networkidle' });
    console.log('⌨️  Filling details...');
    const inputs = await page.locator('input, textarea, select').all();
    await inputs[0].fill(PRODUCT_NAME);
    await inputs[1].fill(PRODUCT_DESC);
    await inputs[2].fill(REPO_URL);
    await inputs[3].fill('https://localhost:4000');
    await inputs[4].selectOption({ index: 0 });
    await inputs[5].fill('main');
    
    // 2. Product Program
    await page.getByRole('button', { name: 'Next: Product Program' }).click();
    await page.waitForTimeout(1000);
    console.log('📝 Writing program brief...');
    await page.locator('textarea').first().fill(`## Purpose\n${PRODUCT_DESC}\n\n## Priorities\nLeverage, Speed, and Durability.`);
    
    // 3. Launch
    await page.getByRole('button', { name: 'Next: Schedules' }).click();
    await page.waitForTimeout(1000);
    console.log('📅 Finalizing schedules...');
    await page.getByRole('button', { name: 'Go to Product Dashboard' }).click();
    
    // Verify
    await page.waitForURL(/\/autopilot\/[a-z0-9-]+/, { timeout: 10000 });
    console.log(`✅ "${PRODUCT_NAME}" is live at: ${page.url()}`);
    
    await page.waitForTimeout(3000);

  } catch (err) {
    console.error('❌ Launch failed:', err.message);
  } finally {
    await browser.close();
  }
})();
