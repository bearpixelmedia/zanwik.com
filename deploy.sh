#!/bin/bash

# Umbrella Dashboard Deployment Script
# This script deploys both frontend and backend to production

set -e

echo "🚀 Starting Umbrella Dashboard deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI is not installed. Installing now..."
        npm install -g vercel
    fi
    
    print_success "All dependencies are available"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    cd client
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    # Build the application
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Frontend built successfully"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    
    cd ..
}

# Deploy frontend to Vercel
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    cd client
    
    # Check if already logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        print_status "Please login to Vercel..."
        vercel login
    fi
    
    # Deploy to Vercel
    vercel --prod --yes
    
    if [ $? -eq 0 ]; then
        print_success "Frontend deployed successfully"
        FRONTEND_URL=$(vercel ls | grep umbrella-dashboard | head -1 | awk '{print $2}')
        echo "Frontend URL: $FRONTEND_URL"
    else
        print_error "Frontend deployment failed"
        exit 1
    fi
    
    cd ..
}

# Setup backend environment
setup_backend_env() {
    print_status "Setting up backend environment..."
    
    if [ ! -f ".env" ]; then
        print_status "Creating .env file..."
        cp env.example .env
        
        print_warning "Please update the .env file with your production values:"
        echo "  - MONGODB_URI"
        echo "  - STRIPE_SECRET_KEY"
        echo "  - STRIPE_WEBHOOK_SECRET"
        echo "  - REDIS_URL"
        echo "  - JWT_SECRET"
        echo "  - CORS_ORIGIN (set to your frontend URL)"
        
        read -p "Press Enter after updating .env file..."
    fi
}

# Deploy backend
deploy_backend() {
    print_status "Deploying backend..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing backend dependencies..."
        npm install
    fi
    
    # Check if backend is already running
    if pgrep -f "node src/index.js" > /dev/null; then
        print_status "Stopping existing backend process..."
        pkill -f "node src/index.js"
    fi
    
    # Start backend in production mode
    print_status "Starting backend server..."
    NODE_ENV=production nohup node src/index.js > logs/app.log 2>&1 &
    
    if [ $? -eq 0 ]; then
        print_success "Backend started successfully"
        echo "Backend logs: logs/app.log"
    else
        print_error "Backend startup failed"
        exit 1
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if MongoDB is running
    if ! pgrep -f "mongod" > /dev/null; then
        print_warning "MongoDB is not running. Please start MongoDB first."
        print_status "You can start MongoDB with: brew services start mongodb-community"
    fi
    
    # Check if Redis is running
    if ! pgrep -f "redis-server" > /dev/null; then
        print_warning "Redis is not running. Please start Redis first."
        print_status "You can start Redis with: brew services start redis"
    fi
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Wait a moment for services to start
    sleep 5
    
    # Check backend health
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        exit 1
    fi
    
    # Check frontend (if deployed)
    if [ ! -z "$FRONTEND_URL" ]; then
        if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
            print_success "Frontend health check passed"
        else
            print_warning "Frontend health check failed (may still be deploying)"
        fi
    fi
}

# Main deployment flow
main() {
    print_status "Starting deployment process..."
    
    # Check dependencies
    check_dependencies
    
    # Setup database
    setup_database
    
    # Setup backend environment
    setup_backend_env
    
    # Build frontend
    build_frontend
    
    # Deploy frontend
    deploy_frontend
    
    # Deploy backend
    deploy_backend
    
    # Health check
    health_check
    
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Your Umbrella Dashboard is now live!"
    echo "Frontend: $FRONTEND_URL"
    echo "Backend API: http://localhost:3000/api"
    echo ""
    echo "Next steps:"
    echo "1. Update your Supabase project settings"
    echo "2. Configure Stripe webhooks"
    echo "3. Set up monitoring and alerts"
    echo "4. Invite your first users"
}

# Run main function
main "$@" 