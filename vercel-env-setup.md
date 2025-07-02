# Vercel Environment Variables Setup

## Add these environment variables to your Vercel project:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your `money` project
- Go to **Settings → Environment Variables**

### 2. Add these variables:

**REACT_APP_SUPABASE_URL**
```
https://ynssliolfybuczopjfgn.supabase.co
```

**REACT_APP_SUPABASE_ANON_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inluc3NsaW9sZnlidWN6b3BqZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzU0NDIsImV4cCI6MjA2NzA1MTQ0Mn0.gUygOntZpba9_JVvuz4I6OdOjeqz-Bz29PXoerqWb8k
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