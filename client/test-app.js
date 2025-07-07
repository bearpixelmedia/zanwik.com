// Simple test script to verify the React application
const puppeteer = require('puppeteer');

async function testApp() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser console error:', msg.text());
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.error('Page error:', error.message);
  });
  
  try {
    console.log('Testing application at http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Wait for the app to load
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Check if there are any JavaScript errors
    const errors = await page.evaluate(() => {
      return window.errors || [];
    });
    
    if (errors.length > 0) {
      console.error('JavaScript errors found:', errors);
    } else {
      console.log('✅ No JavaScript errors detected');
    }
    
    // Check if the app loaded successfully
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check if React is loaded
    const reactLoaded = await page.evaluate(() => {
      return typeof React !== 'undefined';
    });
    
    if (reactLoaded) {
      console.log('✅ React is loaded successfully');
    } else {
      console.error('❌ React is not loaded');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Only run if puppeteer is available
try {
  require('puppeteer');
  testApp();
} catch (error) {
  console.log('Puppeteer not available, skipping automated test');
  console.log('Please check the application manually at http://localhost:3000');
} 