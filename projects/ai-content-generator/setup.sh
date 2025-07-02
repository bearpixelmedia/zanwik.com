#!/bin/bash

echo "🚀 Setting up AI Content Generator..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing server dependencies..."
npm install

echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

echo "📝 Creating environment files..."

# Create server .env file if it doesn't exist
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created .env file for server"
    echo "⚠️  Please update .env with your actual API keys"
else
    echo "✅ Server .env file already exists"
fi

# Create client .env file if it doesn't exist
if [ ! -f client/.env ]; then
    cp client/env.example client/.env
    echo "✅ Created .env file for client"
    echo "⚠️  Please update client/.env with your actual API keys"
else
    echo "✅ Client .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env files with your API keys:"
echo "   - OpenAI API key"
echo "   - Stripe keys"
echo "   - MongoDB connection string"
echo ""
echo "2. Start MongoDB (if running locally)"
echo ""
echo "3. Start the development servers:"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more information, see the README.md file" 