# Railway Deployment Guide for Umbrella Dashboard Backend

## 🚀 Quick Deploy to Railway (Simplified)

### Step 1: Deploy to Railway
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will automatically detect it's a Node.js app

### Step 2: Configure Minimal Environment Variables
In your Railway project dashboard, go to "Variables" and add these **essential variables**:

```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://client-lhduha3h7-byronmccluney.vercel.app
FRONTEND_URL=https://client-lhduha3h7-byronmccluney.vercel.app
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### Step 3: Deploy
1. Save the environment variables
2. Railway will automatically redeploy
3. Wait for the build to complete
4. Your backend will be available at: `https://your-app-name.railway.app`

### Step 4: Test the Deployment
1. Visit your Railway URL: `https://your-app-name.railway.app`
2. You should see: `{"message":"Umbrella Dashboard API","version":"2.0.0","status":"running"}`
3. Test health check: `https://your-app-name.railway.app/api/health`

### Step 5: Update Frontend API Configuration
Once deployed, update your Vercel frontend:

1. Go to your Vercel project dashboard
2. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-app-name.railway.app
   ```
3. Redeploy your frontend

## 🔧 What's Working Now

✅ **Basic API server** - Responds to health checks  
✅ **CORS configured** - Frontend can connect  
✅ **JWT authentication** - Ready for auth  
✅ **Rate limiting** - Basic protection  
✅ **Error handling** - Graceful failures  

## 🚧 What's Not Working Yet

❌ **Database operations** - Need MongoDB setup  
❌ **Redis caching** - Need Redis setup  
❌ **Full project features** - Need database  
❌ **User authentication** - Need database  

## 📊 Next Steps (Optional)

### Add Database (MongoDB Atlas)
1. Sign up at [mongodb.com](https://mongodb.com)
2. Create a free cluster
3. Get connection string
4. Add to Railway variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/umbrella_dashboard_prod
   ```

### Add Redis (Redis Cloud)
1. Sign up at [redis.com](https://redis.com)
2. Create free database
3. Get connection string
4. Add to Railway variables:
   ```
   REDIS_URL=redis://username:password@host:port
   ```

## 🔧 Troubleshooting

### Health Check Fails
- Check Railway logs in dashboard
- Verify environment variables are set
- Ensure PORT=3000 is set

### Frontend Can't Connect
- Check CORS_ORIGIN matches your Vercel URL exactly
- Verify REACT_APP_API_URL is set in Vercel
- Check browser console for CORS errors

### Build Fails
- Check that all dependencies are in package.json
- Ensure start script is: `"start": "node src/index.js"`

## 💰 Costs

Railway free tier includes:
- $5 credit per month
- Perfect for development and small apps
- Pay-as-you-go for larger usage

## 🆘 Support

If you encounter issues:
1. Check Railway logs in dashboard
2. Verify all environment variables
3. Test locally first: `npm start`
4. Check Railway documentation 