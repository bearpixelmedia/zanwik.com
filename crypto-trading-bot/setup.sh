#!/bin/bash

# Cryptocurrency Trading Bot Setup Script
echo "🚀 Setting up Cryptocurrency Trading Bot..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p data
mkdir -p config

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration before starting the bot."
fi

# Check if MongoDB is running (optional)
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Please start MongoDB before running the bot."
    fi
else
    echo "⚠️  MongoDB is not installed. Please install MongoDB or use MongoDB Atlas."
fi

# Check if Redis is running (optional)
if command -v redis-server &> /dev/null; then
    if pgrep -x "redis-server" > /dev/null; then
        echo "✅ Redis is running"
    else
        echo "⚠️  Redis is not running. Please start Redis before running the bot."
    fi
else
    echo "⚠️  Redis is not installed. Please install Redis or use Redis Cloud."
fi

# Create log files
echo "📝 Creating log files..."
touch logs/trading.log
touch logs/error.log
touch logs/access.log

# Set permissions
chmod 755 logs/
chmod 644 logs/*.log

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Set up exchange API keys"
echo "3. Configure trading parameters"
echo "4. Start MongoDB and Redis (if using local instances)"
echo "5. Run the bot in your preferred mode"
echo ""
echo "🔗 Useful commands:"
echo "  npm run dev          - Start development mode"
echo "  npm run paper-trade  - Start paper trading mode"
echo "  npm run live-trade   - Start live trading mode"
echo "  npm run backtest     - Run backtesting"
echo "  npm test             - Run tests"
echo ""
echo "⚠️  IMPORTANT:"
echo "- This bot is for educational purposes only"
echo "- Trading cryptocurrencies involves substantial risk"
echo "- Always test with paper trading first"
echo "- Never invest more than you can afford to lose"
echo ""
echo "📚 Documentation: README.md"
echo "🐛 Issues: Check the logs directory for error logs" 