#!/bin/bash

echo "🚀 Setting up Dropshipping Store Builder..."

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

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js version $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    print_success "npm version $(npm -v) is installed"
}

# Check if Redis is installed
check_redis() {
    if ! command -v redis-server &> /dev/null; then
        print_warning "Redis is not installed. Please install Redis for caching and sessions."
        print_warning "You can install Redis using: brew install redis (macOS) or apt-get install redis-server (Ubuntu)"
    else
        print_success "Redis is installed"
    fi
}

# Install backend dependencies
install_backend() {
    print_status "Installing backend dependencies..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in current directory"
        exit 1
    fi
    
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Backend dependencies installed successfully"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
}

# Install frontend dependencies
install_frontend() {
    print_status "Installing frontend dependencies..."
    
    if [ ! -d "client" ]; then
        print_error "Client directory not found"
        exit 1
    fi
    
    cd client
    
    if [ ! -f "package.json" ]; then
        print_error "Client package.json not found"
        exit 1
    fi
    
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed successfully"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    
    cd ..
}

# Setup environment variables
setup_env() {
    print_status "Setting up environment variables..."
    
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            print_success "Environment file created from template"
            print_warning "Please edit .env file with your configuration"
        else
            print_error "env.example not found"
            exit 1
        fi
    else
        print_warning "Environment file already exists"
    fi
}

# Create uploads directory
create_uploads() {
    print_status "Creating uploads directory..."
    
    mkdir -p uploads
    mkdir -p uploads/images
    mkdir -p uploads/videos
    mkdir -p uploads/products
    mkdir -p uploads/themes
    
    print_success "Uploads directory structure created"
}

# Setup database (MongoDB)
setup_database() {
    print_status "Database setup instructions:"
    echo ""
    echo "1. Install MongoDB locally or use MongoDB Atlas"
    echo "2. Create a database named 'dropshipping_builder'"
    echo "3. Update the MONGODB_URI in your .env file"
    echo ""
    echo "For MongoDB Atlas:"
    echo "- Go to https://cloud.mongodb.com"
    echo "- Create a free cluster"
    echo "- Get your connection string"
    echo "- Update MONGODB_URI in .env"
    echo ""
}

# Setup external services
setup_services() {
    print_status "External services setup instructions:"
    echo ""
    echo "1. Stripe (Payments):"
    echo "   - Go to https://stripe.com"
    echo "   - Create an account"
    echo "   - Get your API keys"
    echo "   - Update STRIPE_* variables in .env"
    echo ""
    echo "2. SendGrid (Email):"
    echo "   - Go to https://sendgrid.com"
    echo "   - Create an account"
    echo "   - Get your API key"
    echo "   - Update SENDGRID_API_KEY in .env"
    echo ""
    echo "3. AWS S3 (Optional - File Storage):"
    echo "   - Go to https://aws.amazon.com/s3/"
    echo "   - Create a bucket"
    echo "   - Get your access keys"
    echo "   - Update AWS_* variables in .env"
    echo ""
    echo "4. Redis (Caching):"
    echo "   - Install Redis locally or use Redis Cloud"
    echo "   - Update REDIS_URL in .env"
    echo ""
    echo "5. Product Sourcing APIs (Optional):"
    echo "   - AliExpress API for product sourcing"
    echo "   - Amazon API for product data"
    echo "   - Shopify API for integration"
    echo "   - Update respective API keys in .env"
    echo ""
}

# Create startup script
create_startup_script() {
    print_status "Creating startup script..."
    
    cat > start.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Dropshipping Store Builder..."

# Start Redis if not running
if ! pgrep -x "redis-server" > /dev/null; then
    echo "Starting Redis server..."
    redis-server --daemonize yes
fi

# Start backend
echo "Starting backend server..."
npm run server &

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend development server..."
cd client && npm start
EOF

    chmod +x start.sh
    print_success "Startup script created (run with ./start.sh)"
}

# Create production build script
create_build_script() {
    print_status "Creating production build script..."
    
    cat > build.sh << 'EOF'
#!/bin/bash

echo "🏗️ Building Dropshipping Store Builder for production..."

# Build frontend
echo "Building frontend..."
cd client && npm run build && cd ..

echo "✅ Build complete!"
echo "To start production server:"
echo "npm start"
EOF

    chmod +x build.sh
    print_success "Build script created (run with ./build.sh)"
}

# Create Redis setup script
create_redis_script() {
    print_status "Creating Redis setup script..."
    
    cat > setup-redis.sh << 'EOF'
#!/bin/bash

echo "🔧 Setting up Redis..."

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "Redis is not installed. Installing Redis..."
    
    # Detect OS and install Redis
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install redis
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update
        sudo apt-get install -y redis-server
    else
        echo "Please install Redis manually for your operating system"
        exit 1
    fi
fi

# Start Redis
echo "Starting Redis server..."
redis-server --daemonize yes

echo "✅ Redis setup complete!"
echo "Redis is running on localhost:6379"
EOF

    chmod +x setup-redis.sh
    print_success "Redis setup script created (run with ./setup-redis.sh)"
}

# Main setup function
main() {
    echo "🛍️ Dropshipping Store Builder Setup"
    echo "==================================="
    echo ""
    
    # Check prerequisites
    check_node
    check_npm
    check_redis
    
    # Install dependencies
    install_backend
    install_frontend
    
    # Setup environment
    setup_env
    
    # Create directories
    create_uploads
    
    # Create scripts
    create_startup_script
    create_build_script
    create_redis_script
    
    # Show setup instructions
    setup_database
    setup_services
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your configuration"
    echo "2. Set up MongoDB database"
    echo "3. Configure external services (Stripe, SendGrid, AWS S3)"
    echo "4. Set up Redis (run ./setup-redis.sh if needed)"
    echo "5. Configure product sourcing APIs (optional)"
    echo "6. Run './start.sh' to start development servers"
    echo ""
    echo "For production deployment:"
    echo "1. Run './build.sh' to build the application"
    echo "2. Set NODE_ENV=production in .env"
    echo "3. Run 'npm start' to start production server"
    echo ""
    echo "Documentation: README.md"
    echo "Support: Check the README for troubleshooting"
}

# Run main function
main 