#!/bin/bash

echo "🚀 Setting up Subscription Box Management Platform..."

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

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

# Create environment file
echo "⚙️  Creating environment file..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Environment file created. Please edit .env with your configuration."
else
    echo "✅ Environment file already exists."
fi

# Create Tailwind config for frontend
echo "🎨 Setting up Tailwind CSS..."
cd client
if [ ! -f tailwind.config.js ]; then
    npx tailwindcss init
    echo "✅ Tailwind config created."
else
    echo "✅ Tailwind config already exists."
fi
cd ..

# Create PostCSS config for frontend
echo "🎨 Setting up PostCSS..."
cd client
if [ ! -f postcss.config.js ]; then
    cat > postcss.config.js << EOF
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
    echo "✅ PostCSS config created."
else
    echo "✅ PostCSS config already exists."
fi
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Set up your MongoDB database"
echo "3. Configure Stripe API keys (optional)"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "Available commands:"
echo "  npm run dev          - Start both backend and frontend"
echo "  npm run server       - Start backend only"
echo "  npm run client       - Start frontend only"
echo "  npm run build        - Build frontend for production"
echo "  npm start            - Start production server"
echo ""
echo "Happy coding! 🚀" 