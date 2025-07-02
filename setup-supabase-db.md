# Supabase Database Setup

## Step 1: Access Your Supabase Project
1. Go to: https://supabase.com/dashboard
2. Click on your project: **supabase-amber-jacket**
3. Go to **SQL Editor** in the left sidebar

## Step 2: Run the Database Schema
1. Click **"New Query"**
2. Copy and paste the entire contents of `supabase-setup-simple.sql`
3. Click **"Run"** to execute the SQL

## Step 3: Verify Setup
After running the SQL, you should see:
- ✅ Tables created: `projects`, `analytics_overview`, `analytics_revenue`, `users`
- ✅ Sample data inserted (5 sample projects, analytics data)
- ✅ RLS policies created
- ✅ No permission errors

## Step 4: Configure Authentication
1. Go to **Authentication → Settings**
2. Under **Site URL**, add: `https://money-iti957vw0-byronmccluney.vercel.app`
3. Under **Redirect URLs**, add: `https://money-iti957vw0-byronmccluney.vercel.app/dashboard`
4. Click **"Save"**

## Step 5: Test Connection
1. Go back to your Vercel app
2. Try to register a new account
3. Check that login works
4. Verify dashboard loads with sample data

## Troubleshooting
- If you get permission errors, use `supabase-setup-simple.sql` instead
- Make sure all SQL commands executed successfully
- Verify environment variables are set in Vercel
- Check that authentication settings are configured correctly 