# Vercel Environment Variables Setup

## Add these environment variables to your Vercel project:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your `money` project
- Go to **Settings → Environment Variables**

### 2. Add these variables:

**REACT_APP_SUPABASE_URL**
```
https://fxzwnjmzhdynsatvakim.supabase.co
```

**REACT_APP_SUPABASE_ANON_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4enduam16aGR5bnNhdHZha2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODI4MjUsImV4cCI6MjA2NzE1ODgyNX0.l1fmDYnD8eIszoMqx2S0Cqq28fpz_rSjaim2Ke3YIow
```

### 3. Save and Redeploy
- Click **"Save"** for each variable
- Go to **Deployments** tab
- Click **"Redeploy"** on your latest deployment

## Next Steps:
1. Set up the database schema in Supabase
2. Configure authentication settings
3. Test the connection

Your dashboard will then be fully connected to Supabase! 