#!/bin/bash

echo "🚀 Setting up Digital Product Marketplace..."

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

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL and create a database."
    echo "   You can use: brew install postgresql (macOS) or apt-get install postgresql (Ubuntu)"
else
    echo "✅ PostgreSQL is installed"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please update the .env file with your actual configuration values"
fi

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init

# Build the application
echo "🔨 Building the application..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update the .env file with your actual configuration values"
echo "2. Set up your Stripe account and add the keys to .env"
echo "3. Set up AWS S3 for file uploads (optional)"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "🌐 The application will be available at http://localhost:3000" 