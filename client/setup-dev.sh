#!/bin/bash

echo "🔧 Setting up development environment..."

# Install Husky for Git hooks (only in development)
if [ -d ".git" ]; then
  echo "📦 Installing Husky for Git hooks..."
  npm install husky --save-dev
  npx husky install
  echo "✅ Husky installed and configured"
else
  echo "⚠️  Not a Git repository, skipping Husky installation"
fi

# Run the environment setup
echo "🌍 Setting up environment variables..."
./setup-env.sh

echo "🎉 Development environment setup complete!"
echo "🚀 You can now run: npm start" 