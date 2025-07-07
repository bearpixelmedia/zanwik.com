// Test Supabase connection and profile fetching
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fxzwnjmzhdynsatvakim.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4enduam16aGR5bnNhdHZha2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODI4MjUsImV4cCI6MjA2NzE1ODgyNX0.l1fmDYnD8eIszoMqx2S0Cqq28fpz_rSjaim2Ke3YIow';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log('🔍 Testing Supabase Connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection failed:', testError);
      return;
    }
    console.log('✅ Connection successful\n');

    // Test 2: Check if profiles table exists and has data
    console.log('2. Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError);
    } else {
      console.log('✅ Profiles table accessible');
      console.log(`📊 Found ${profiles.length} profiles`);
      if (profiles.length > 0) {
        console.log('Sample profile:', profiles[0]);
      }
    }
    console.log('');

    // Test 3: Check current session
    console.log('3. Testing authentication...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    } else if (session) {
      console.log('✅ User is authenticated');
      console.log('User ID:', session.user.id);
      console.log('User email:', session.user.email);
      
      // Test 4: Try to fetch this user's profile
      console.log('\n4. Testing profile fetch for current user...');
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
      } else {
        console.log('✅ Profile fetch successful');
        console.log('Profile:', userProfile);
      }
    } else {
      console.log('ℹ️ No active session (user not logged in)');
    }
    console.log('');

    // Test 5: Check RLS policies
    console.log('5. Testing RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (policiesError && policiesError.code === 'PGRST116') {
      console.log('ℹ️ RLS policies are working (expected error for unauthenticated user)');
    } else if (policiesError) {
      console.error('❌ RLS policy error:', policiesError);
    } else {
      console.log('✅ RLS policies allow access');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSupabase().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 