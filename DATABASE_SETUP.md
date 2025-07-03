# Database Setup Guide

## Railway MongoDB Setup

### 1. Add MongoDB Plugin in Railway:
1. Go to your Railway project dashboard
2. Click "New" → "Plugin"
3. Search for "MongoDB"
4. Add the MongoDB plugin
5. Railway will automatically add `MONGODB_URI` to your environment variables

### 2. Add Redis Plugin (Optional but Recommended):
1. Go to your Railway project dashboard
2. Click "New" → "Plugin"
3. Search for "Redis"
4. Add the Redis plugin
5. Railway will automatically add `REDIS_URL` to your environment variables

### 3. Required Environment Variables:

Add these to your Railway backend environment variables:

```
# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://your-vercel-frontend-url.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL (for Socket.io)
FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
```

### 4. Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## After Setup:

1. Your backend will automatically connect to MongoDB
2. ProjectService will start loading projects from the database
3. All API endpoints will be fully functional
4. Real-time features will work with Redis

## Testing the Connection:

Once set up, you can test your API at:
- Health check: `https://your-railway-url.railway.app/api/health`
- Detailed health: `https://your-railway-url.railway.app/api/health/detailed` 