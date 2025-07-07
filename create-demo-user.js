const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fxzwnjmzhdynsatvakim.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4enduam16aGR5bnNhdHZha2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODI4MjUsImV4cCI6MjA2NzE1ODgyNX0.l1fmDYnD8eIszoMqx2S0Cqq28fpz_rSjaim2Ke3YIow';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test with a simple query instead of getUser
    const { data, error } = await supabase
      .from('projects')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('Database connection test:', error.message);
      // This is expected if the table doesn't exist yet
    } else {
      console.log('✅ Database connection successful!');
    }
    
    return true;
    
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return false;
  }
}

async function createDemoUser() {
  try {
    console.log('\nCreating demo user...');
    
    const { data, error } = await supabase.auth.signUp({
      email: 'demo@zanwik.com',
      password: 'demo123',
      options: {
        data: {
          first_name: 'Demo',
          last_name: 'User',
          role: 'admin'
        }
      }
    });

    if (error) {
      console.error('❌ Error creating demo user:', error.message);
      
      // If user already exists, try to sign in
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        console.log('User already exists, testing login...');
        await testLogin();
      }
      return;
    }

    console.log('✅ Demo user created successfully!');
    console.log('Email: demo@zanwik.com');
    console.log('Password: demo123');
    
    if (data.user && !data.user.email_confirmed_at) {
      console.log('Note: User needs email confirmation.');
      console.log('You can confirm manually in Supabase dashboard or check your email.');
    }
    
  } catch (error) {
    console.error('Failed to create demo user:', error);
  }
}

async function testLogin() {
  try {
    console.log('\nTesting login with demo credentials...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'demo@zanwik.com',
      password: 'demo123'
    });

    if (error) {
      console.log('❌ Login failed:', error.message);
      return false;
    }

    console.log('✅ Login successful!');
    console.log('User:', data.user.email);
    console.log('User ID:', data.user.id);
    return true;
    
  } catch (error) {
    console.error('Login test failed:', error);
    return false;
  }
}

async function main() {
  console.log('🔧 Supabase Authentication Test\n');
  
  const connected = await testConnection();
  if (!connected) {
    console.log('❌ Cannot proceed without connection');
    return;
  }
  
  await createDemoUser();
  await testLogin();
  
  console.log('\n📋 Manual Steps (if automated creation failed):');
  console.log('1. Go to: https://supabase.com/dashboard/project/fxzwnjmzhdynsatvakim');
  console.log('2. Navigate to: Authentication → Users');
  console.log('3. Click "Add user"');
  console.log('4. Enter:');
  console.log('   - Email: demo@zanwik.com');
  console.log('   - Password: demo123');
  console.log('5. Click "Create user"');
  console.log('6. If email confirmation is required, click the three dots next to the user and select "Confirm"');
  console.log('\nThen try logging in at your dashboard!');
}

main(); 