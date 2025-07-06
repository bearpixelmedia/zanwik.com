# Zanwik Deployment Guide

## Overview
Zanwik is a SaaS platform with:
- **Landing Page**: `https://www.zanwik.com/` (static HTML)
- **Dashboard App**: `https://www.zanwik.com/dashboard` (React app)

## Quick Deployment

### Option 1: Using the deployment script
```bash
./deploy.sh
```

### Option 2: Manual deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
railway up
```

## Environment Variables

Make sure these environment variables are set in Railway:

### Required
- `PORT`: Railway sets this automatically
- `NODE_ENV`: Set to `production`

### Optional (for full functionality)
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key

## Domain Configuration

1. **Custom Domain**: Configure `www.zanwik.com` in Railway
2. **SSL**: Railway provides automatic SSL certificates
3. **DNS**: Point your domain to Railway's servers

## Health Checks

The app includes health check endpoints:
- `/api/health` - Basic health check
- `/api/health/detailed` - Detailed system status

## Troubleshooting

### Landing page not loading
1. Check if `public/index.html` exists
2. Verify static file serving is configured
3. Check Railway logs: `railway logs`

### Dashboard not loading
1. Verify React build is in `client/build`
2. Check if `/dashboard` route is configured
3. Ensure all dependencies are installed

### Port issues
- Railway automatically sets the `PORT` environment variable
- The app listens on `0.0.0.0` to accept all connections

## Local Development

```bash
# Start backend
npm start

# Start frontend (in another terminal)
cd client && npm start
```

## File Structure

```
zanwik.com/
├── public/
│   ├── index.html          # Landing page
│   └── favicon.svg         # Favicon
├── client/
│   └── build/              # React app build
├── src/
│   └── index.js            # Express server
└── railway.json            # Railway configuration
```

## Monitoring

- **Railway Dashboard**: Monitor deployment status
- **Application Logs**: `railway logs`
- **Health Endpoints**: Check `/api/health` 