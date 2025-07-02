# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up with your GitHub account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name:** `umbrella-dashboard`
   - **Database Password:** Choose a strong password
   - **Region:** Choose closest to you
6. Click "Create new project"
7. Wait for setup to complete (2-3 minutes)

## Step 2: Get Your Project Credentials

1. Go to **Settings > API** in your Supabase dashboard
2. Copy these values:
   - **Project URL:** `https://your-project-id.supabase.co`
   - **Anon Key:** Your public API key

## Step 3: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase-setup.sql`
3. Paste and run the SQL commands
4. This will create all necessary tables and sample data

## Step 4: Configure Authentication

1. Go to **Authentication > Settings**
2. Under **Site URL**, add: `https://money-iti957vw0-byronmccluney.vercel.app`
3. Under **Redirect URLs**, add: `https://money-iti957vw0-byronmccluney.vercel.app/dashboard`
4. Save changes

## Step 5: Update Vercel Environment Variables

1. Go to your Vercel dashboard
2. Select your `money` project
3. Go to **Settings > Environment Variables**
4. Add these variables:
   - **Key:** `REACT_APP_SUPABASE_URL`
   - **Value:** `https://your-project-id.supabase.co`
   - **Key:** `REACT_APP_SUPABASE_ANON_KEY`
   - **Value:** Your anon key from Step 2
5. Redeploy your project

## Step 6: Test the Setup

1. Visit your Vercel app: `https://money-iti957vw0-byronmccluney.vercel.app`
2. Try to register a new account
3. Check your email for verification (if enabled)
4. Try logging in

## Step 7: Create Demo User (Optional)

1. Go to **Authentication > Users** in Supabase
2. Click "Add user"
3. Enter demo credentials:
   - **Email:** `demo@example.com`
   - **Password:** `demo123`
4. The user will be created automatically

## Troubleshooting

### If login doesn't work:
- Check that environment variables are set correctly in Vercel
- Verify the Supabase URL and anon key
- Check browser console for errors

### If you get CORS errors:
- Make sure the site URL is set correctly in Supabase auth settings
- Check that redirect URLs include your Vercel domain

### If database queries fail:
- Run the SQL setup script again
- Check that RLS policies are created correctly

## Next Steps

Once everything is working:
1. Your dashboard will show sample data
2. You can create new projects
3. Analytics will display sample revenue data
4. All authentication is handled by Supabase

## Benefits of This Setup

- ✅ No separate backend needed
- ✅ Built-in authentication
- ✅ Real-time database
- ✅ Automatic API generation
- ✅ Row Level Security
- ✅ Free tier available 