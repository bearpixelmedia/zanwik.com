// Clear authentication cache and storage
console.log('🧹 Clearing Authentication Cache...\n');

// Clear localStorage
console.log('1. Clearing localStorage...');
const localStorageKeys = Object.keys(localStorage);
const authKeys = localStorageKeys.filter(key => 
  key.includes('supabase') || 
  key.includes('auth') || 
  key.includes('session') ||
  key.includes('user')
);

if (authKeys.length > 0) {
  console.log('   Found auth-related keys:', authKeys);
  authKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`   ✅ Removed: ${key}`);
  });
} else {
  console.log('   ℹ️ No auth-related keys found');
}

// Clear sessionStorage
console.log('\n2. Clearing sessionStorage...');
const sessionStorageKeys = Object.keys(sessionStorage);
const sessionAuthKeys = sessionStorageKeys.filter(key => 
  key.includes('supabase') || 
  key.includes('auth') || 
  key.includes('session') ||
  key.includes('user')
);

if (sessionAuthKeys.length > 0) {
  console.log('   Found auth-related keys:', sessionAuthKeys);
  sessionAuthKeys.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`   ✅ Removed: ${key}`);
  });
} else {
  console.log('   ℹ️ No auth-related keys found');
}

// Clear all cookies (if any)
console.log('\n3. Clearing cookies...');
const cookies = document.cookie.split(';');
const authCookies = cookies.filter(cookie => {
  const name = cookie.split('=')[0].trim();
  return name.includes('supabase') || name.includes('auth') || name.includes('session');
});

if (authCookies.length > 0) {
  console.log('   Found auth-related cookies:', authCookies.map(c => c.split('=')[0].trim()));
  authCookies.forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    console.log(`   ✅ Removed: ${name}`);
  });
} else {
  console.log('   ℹ️ No auth-related cookies found');
}

console.log('\n✅ Authentication cache cleared!');
console.log('\n📝 Instructions:');
console.log('1. Refresh the page (Ctrl+R or Cmd+R)');
console.log('2. Check the console for the new session logs');
console.log('3. You should see "hasSession: false" and "hasUser: false"');
console.log('4. No more profile fetch timeouts should occur');
console.log('\n🎉 If the issue persists, there might be a different cause.'); 