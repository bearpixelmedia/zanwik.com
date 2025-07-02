const crypto = require('crypto');

console.log('=== Environment Variables for Backend Deployment ===\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log(`JWT_SECRET=${jwtSecret}`);

// Generate Encryption Key (32 characters)
const encryptionKey = crypto.randomBytes(16).toString('hex');
console.log(`ENCRYPTION_KEY=${encryptionKey}`);

// Generate Session Secret
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log(`SESSION_SECRET=${sessionSecret}`);

console.log('\n=== Copy these values to your Render environment variables ===');
console.log('\nYou still need to:');
console.log('1. Set up MongoDB Atlas and get your MONGODB_URI');
console.log('2. Deploy to Render following the DEPLOYMENT_GUIDE.md');
console.log('3. Update your Vercel frontend with REACT_APP_API_URL'); 