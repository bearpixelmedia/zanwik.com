# Backend Deployment Guide

## Deploy to Render (Free Hosting)

### Step 1: Set up MongoDB Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user
5. Get your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/umbrella_dashboard`)

### Step 2: Deploy to Render
1. Go to [Render.com](https://render.com)
2. Sign up with your GitHub account
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name:** `umbrella-dashboard-backend`
   - **Root Directory:** Leave empty (deploy from root)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### Step 3: Set Environment Variables in Render
Add these environment variables in your Render service settings:

```
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://money-iti957vw0-byronmccluney.vercel.app
CORS_ORIGIN=https://money-iti957vw0-byronmccluney.vercel.app
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_random_jwt_secret_key
ENCRYPTION_KEY=your_32_character_encryption_key
SESSION_SECRET=your_random_session_secret
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Copy your service URL (e.g., `https://umbrella-dashboard-backend.onrender.com`)

### Step 5: Update Frontend
1. Go to your Vercel dashboard
2. Add environment variable:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://your-render-service-url.onrender.com/api`
3. Redeploy your frontend

### Step 6: Test
1. Visit your Vercel frontend
2. Try logging in with demo credentials
3. Check that API calls work

## Alternative: Deploy to Railway
If Render doesn't work, you can also deploy to Railway:
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repo
3. Set environment variables
4. Deploy

## Troubleshooting
- If you get CORS errors, make sure `CORS_ORIGIN` matches your frontend URL exactly
- If MongoDB connection fails, check your connection string
- If JWT errors occur, make sure `JWT_SECRET` is set 