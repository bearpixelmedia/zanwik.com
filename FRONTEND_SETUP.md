# Frontend Environment Setup

## Vercel Environment Variables

Add these environment variables in your Vercel dashboard:

### Required Variables:
```
REACT_APP_API_URL=https://your-railway-app-url.railway.app/api
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Optional Variables:
```
REACT_APP_APP_NAME=Umbrella Dashboard
REACT_APP_VERSION=1.0.0
```

## Steps to Configure:

1. Go to your Vercel dashboard
2. Select your Umbrella Dashboard project
3. Go to Settings > Environment Variables
4. Add each variable above
5. Redeploy your application

## Get Your Railway URL:

1. Go to your Railway dashboard
2. Select your backend service
3. Copy the generated URL (e.g., `https://money-production-1234.up.railway.app`)
4. Add `/api` to the end for the API_BASE_URL 