#!/bin/bash

# Zanwik Production Deployment Script
echo "🚀 Starting Zanwik Production Deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please run 'vercel login' first."
    exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build:all

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app is now live at: https://zanwik.com"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set up environment variables in Vercel dashboard"
    echo "2. Configure custom domain"
    echo "3. Set up SSL certificate"
    echo "4. Configure database connections"
    echo "5. Test all functionality"
else
    echo "❌ Deployment failed. Please check the logs and try again."
    exit 1
fi
