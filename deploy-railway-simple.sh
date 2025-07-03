#!/bin/bash

# Simple Railway Deployment Script
echo "🚀 Simple Railway Deployment for Umbrella Dashboard Backend"
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

echo "📋 Setting up minimal environment variables..."
echo ""
echo "The following environment variables will be set:"
echo "✅ NODE_ENV=production"
echo "✅ PORT=3000"
echo "✅ HOST=0.0.0.0"
echo "✅ JWT_SECRET=your-super-secret-jwt-key-change-this-in-production"
echo "✅ JWT_EXPIRES_IN=7d"
echo "✅ CORS_ORIGIN=https://client-lhduha3h7-byronmccluney.vercel.app"
echo "✅ FRONTEND_URL=https://client-lhduha3h7-byronmccluney.vercel.app"
echo "✅ RATE_LIMIT_WINDOW=900000"
echo "✅ RATE_LIMIT_MAX_REQUESTS=100"
echo "✅ LOG_LEVEL=info"
echo ""

echo "🔧 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Railway dashboard"
echo "2. Check the deployment logs"
echo "3. Verify the health check passes"
echo "4. Get your backend URL"
echo "5. Update your Vercel frontend with the backend URL"
echo ""
echo "🌐 Your backend will be available at: https://your-app-name.railway.app"
echo ""
echo "🔍 To check deployment status:"
echo "   railway status"
echo ""
echo "📊 To view logs:"
echo "   railway logs" 