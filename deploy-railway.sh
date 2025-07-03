#!/bin/bash

# Railway Deployment Script for Umbrella Dashboard Backend
echo "🚀 Railway Deployment Script for Umbrella Dashboard Backend"
echo "=========================================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

# Check if project exists
if ! railway status &> /dev/null; then
    echo "📁 Initializing Railway project..."
    railway init
fi

echo "🔧 Building and deploying..."
railway up

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Railway dashboard"
echo "2. Add environment variables (see RAILWAY_DEPLOYMENT.md)"
echo "3. Get your backend URL"
echo "4. Update your Vercel frontend with the backend URL"
echo ""
echo "🌐 Your backend will be available at: https://your-app-name.railway.app" 