#!/bin/bash

# Deploy script for Zanwik Umbrella Dashboard
# This script builds the React app and deploys to Vercel

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Check if we're in the correct directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Please run this script from the project root."
    exit 1
fi

# Check if client directory exists
if [ ! -d "client" ]; then
    echo "❌ Error: client directory not found."
    exit 1
fi

echo "📦 Installing dependencies..."
cd client
npm install

echo "🔨 Building React app..."
npm run build

echo "✅ Build completed successfully!"

# Go back to root
cd ..

echo "🌐 Deploying to Vercel..."
npx vercel --prod

echo "🎉 Deployment completed!"
echo "📝 Your app should be available at your configured domain shortly."
echo "🔍 Check the Vercel dashboard for deployment status and logs." 