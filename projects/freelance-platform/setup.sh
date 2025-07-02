#!/bin/bash

echo "🚀 Setting up Freelance Service Platform..."

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

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB and start the service."
    echo "   You can use: brew install mongodb-community (macOS) or apt-get install mongodb (Ubuntu)"
else
    echo "✅ MongoDB is installed"
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd ../client
npm install

# Go back to root
cd ..

# Create .env file if it doesn't exist
if [ ! -f server/.env ]; then
    echo "📝 Creating server .env file..."
    cp env.example server/.env
    echo "⚠️  Please update the server/.env file with your actual configuration values"
fi

# Create client .env file if it doesn't exist
if [ ! -f client/.env ]; then
    echo "📝 Creating client .env file..."
    echo "REACT_APP_API_URL=http://localhost:5000/api" > client/.env
    echo "⚠️  Please update the client/.env file if needed"
fi

# Build the client
echo "🔨 Building the client..."
cd client
npm run build

# Go back to root
cd ..

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update the server/.env file with your actual configuration values"
echo "2. Set up your MongoDB database and update the connection string"
echo "3. Set up your Stripe account and add the keys to .env (optional)"
echo "4. Set up AWS S3 for file uploads (optional)"
echo ""
echo "🚀 To start the application:"
echo "1. Start the server: cd server && npm run dev"
echo "2. Start the client: cd client && npm start"
echo ""
echo "🌐 The application will be available at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000/api"
echo ""
echo "📚 Available scripts:"
echo "   - server: npm run dev (development)"
echo "   - server: npm start (production)"
echo "   - client: npm start (development)"
echo "   - client: npm run build (production build)" 