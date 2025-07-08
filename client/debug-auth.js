// Debug authentication process
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fxzwnjmzhdynsatvakim.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4enduam16aGR5bnNhdHZha2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODI4MjUsImV4cCI6MjA2NzE1ODgyNX0.l1fmDYnD8eIszoMqx2S0Cqq28fpz_rSjaim2Ke3YIow';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugAuth() {
  console.log('🔍 Debugging Authentication Process...\n');

  try {
    // Step 1: Check current session
    console.log('1. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return;
    }
    
    if (session) {
      console.log('✅ User is logged in');
      console.log('   User ID:', session.user.id);
      console.log('   User email:', session.user.email);
      console.log('   Session expires:', new Date(session.expires_at * 1000));
      
      // Step 2: Try to fetch profile
      console.log('\n2. Trying to fetch profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Profile fetch error:', profileError.message);
        
        // Step 3: Try to create profile
        console.log('\n3. Trying to create profile...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              role: 'viewer',
              permissions: ['view_projects', 'view_analytics'],
              preferences: {},
            },
          ])
          .select()
          .single();
        
        if (createError) {
          console.error('❌ Profile creation error:', createError);
        } else {
          console.log('✅ Profile created successfully:', newProfile);
        }
      } else {
        console.log('✅ Profile found:', profile);
      }
    } else {
      console.log('ℹ️ No user logged in');
      console.log('   This is normal - user needs to log in first');
    }
    
    // Step 4: Check if there are any existing profiles
    console.log('\n4. Checking existing profiles...');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);
    
    if (allProfilesError) {
      console.error('❌ Error fetching all profiles:', allProfilesError);
    } else {
      console.log(`📊 Found ${allProfiles.length} profiles in database`);
      if (allProfiles.length > 0) {
        console.log('Sample profiles:');
        allProfiles.forEach((profile, index) => {
          console.log(`   ${index + 1}. ${profile.email} (${profile.role})`);
        });
      }
    }
    
    // Step 5: Test RLS policies
    console.log('\n5. Testing RLS policies...');
    if (session) {
      // Test with authenticated user
      const { data: authTest, error: authTestError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (authTestError) {
        console.error('❌ RLS test failed for authenticated user:', authTestError);
      } else {
        console.log('✅ RLS allows access for authenticated user');
      }
    } else {
      // Test without authentication
      const { data: unauthTest, error: unauthTestError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (unauthTestError && unauthTestError.code === 'PGRST116') {
        console.log('✅ RLS correctly blocks unauthenticated access');
      } else if (unauthTestError) {
        console.error('❌ Unexpected RLS error:', unauthTestError);
      } else {
        console.log('⚠️ RLS allows unauthenticated access (this might be a security issue)');
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugAuth().then(() => {
  console.log('\n🏁 Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
}); 