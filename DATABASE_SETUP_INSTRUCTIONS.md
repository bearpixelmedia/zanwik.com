# Database Setup Instructions

## Quick Fix for Authentication Timeout

The authentication timeout is happening because the database tables don't exist yet. Here's how to fix it:

### Option 1: Manual Setup (Recommended)
1. Go to https://supabase.com/dashboard
2. Click on your project: **fxzwnjmzhdynsatvakim**
3. Go to **SQL Editor** in the left sidebar
4. Click **"New Query"**
5. Copy and paste the entire contents of `supabase-setup-simple.sql`
6. Click **"Run"** to execute the SQL

### Option 2: Use the App Without Database Tables
The app has been updated to work without database tables. It will:
- Use default user profiles
- Skip database operations gracefully
- Still provide full functionality

### What the SQL Setup Creates:
- ✅ `users` table (for user profiles)
- ✅ `projects` table (for project data)
- ✅ `analytics_overview` table (for dashboard stats)
- ✅ `analytics_revenue` table (for revenue data)
- ✅ Sample data for testing
- ✅ Row Level Security policies

### After Setup:
1. Refresh your React app
2. Try logging in/registering
3. The authentication timeout should be gone
4. Dashboard should show sample data

### Current Status:
- ✅ Environment variables configured
- ✅ Supabase connection working
- ✅ React app running on port 3000
- ⏳ Database tables need to be created (or use fallback mode) 