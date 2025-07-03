# Railway Deployment Guide for Umbrella Dashboard Backend

## 🚀 Quick Deploy to Railway

### Step 1: Prepare Your Repository
1. Make sure your code is pushed to GitHub
2. The backend code should be in the root directory
3. The frontend code should be in the `client/` directory

### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will automatically detect it's a Node.js app

### Step 3: Configure Environment Variables
In your Railway project dashboard, go to "Variables" and add these:

#### Required Variables:
```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

#### Database (Choose one):
**Option A: MongoDB Atlas (Recommended)**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/umbrella_dashboard_prod
```

**Option B: Railway MongoDB Plugin**
1. Add MongoDB plugin in Railway
2. Use the provided connection string

#### Redis (Choose one):
**Option A: Redis Cloud**
```
REDIS_URL=redis://username:password@host:port
```

**Option B: Railway Redis Plugin**
1. Add Redis plugin in Railway
2. Use the provided connection string

#### Frontend URL:
```
CORS_ORIGIN=https://client-lhduha3h7-byronmccluney.vercel.app
FRONTEND_URL=https://client-lhduha3h7-byronmccluney.vercel.app
```

#### Optional Variables:
```
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-key
```

### Step 4: Deploy
1. Railway will automatically deploy when you save the variables
2. Wait for the build to complete
3. Your backend will be available at: `https://your-app-name.railway.app`

### Step 5: Update Frontend API Configuration
Once deployed, update your frontend API configuration to point to your Railway backend:

1. Go to your Vercel project dashboard
2. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-app-name.railway.app
   ```
3. Redeploy your frontend

## 🔧 Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure the start script is correct: `"start": "node src/index.js"`

### Environment Variables
- Make sure all required variables are set
- Check that MongoDB and Redis URLs are correct

### CORS Issues
- Ensure `CORS_ORIGIN` points to your Vercel frontend URL
- Check that the frontend is making requests to the correct backend URL

## 📊 Monitoring

Railway provides:
- Real-time logs
- Performance metrics
- Automatic restarts
- Health checks

## 🔄 Continuous Deployment

Railway automatically redeploys when you push to your main branch.

## 💰 Costs

Railway has a generous free tier:
- $5 credit per month
- Perfect for small to medium applications
- Pay-as-you-go pricing for larger apps

## 🆘 Support

If you encounter issues:
1. Check Railway logs in the dashboard
2. Verify environment variables
3. Test locally first
4. Check Railway documentation 