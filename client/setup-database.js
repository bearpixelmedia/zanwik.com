#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Zanwik Dashboard - Database Setup Helper');
console.log('============================================\n');

console.log('To fix the "Profile fetch failed" error, you need to set up your Supabase database tables.');
console.log('\n📋 Follow these steps:\n');

console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
console.log('2. Select your project: fxzwnjmzhdynsatvakim');
console.log('3. Go to "SQL Editor" in the left sidebar');
console.log('4. Copy and paste the following SQL script:\n');

// Read the simple setup SQL file
const sqlPath = path.join(__dirname, 'database', 'supabase-setup-simple.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

console.log('```sql');
console.log(sqlContent);
console.log('```\n');

console.log('5. Click "Run" to execute the script');
console.log('6. Wait for the script to complete (should take a few seconds)');
console.log('7. Refresh your React application\n');

console.log('✅ After running this script, your database will have:');
console.log('   - profiles table (for user profiles)');
console.log('   - login_history table (for login tracking)');
console.log('   - security_events table (for security logging)');
console.log('   - projects table (for project management)');
console.log('   - Row Level Security (RLS) policies');
console.log('   - Automatic profile creation on signup\n');

console.log('🔄 The React app will automatically:');
console.log('   - Create user profiles when users sign up');
console.log('   - Load user data from the profiles table');
console.log('   - Log security events and login history');
console.log('   - Handle authentication properly\n');

console.log('📝 Note: If you want to create a demo user, you can also run:');
console.log('   - Go to "Authentication > Users" in Supabase');
console.log('   - Click "Add user"');
console.log('   - Email: demo@zanwik.com');
console.log('   - Password: demo123\n');

console.log('🎉 Once the database is set up, the "Profile fetch failed" error should be resolved!'); 