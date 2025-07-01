#!/bin/bash

echo "🚀 Setting up Online Course Platform..."

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
    mkdir -p uploads/files
    
    print_success "Uploads directory structure created"
}

# Setup database (MongoDB)
setup_database() {
    print_status "Database setup instructions:"
    echo ""
    echo "1. Install MongoDB locally or use MongoDB Atlas"
    echo "2. Create a database named 'course_platform'"
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
    echo "   - Update STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in .env"
    echo ""
    echo "2. Cloudinary (Video/Image Storage):"
    echo "   - Go to https://cloudinary.com"
    echo "   - Create a free account"
    echo "   - Get your credentials"
    echo "   - Update CLOUDINARY_* variables in .env"
    echo ""
    echo "3. SendGrid (Email):"
    echo "   - Go to https://sendgrid.com"
    echo "   - Create an account"
    echo "   - Get your API key"
    echo "   - Update SENDGRID_API_KEY in .env"
    echo ""
}

# Create startup script
create_startup_script() {
    print_status "Creating startup script..."
    
    cat > start.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Online Course Platform..."

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

echo "🏗️ Building Online Course Platform for production..."

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

# Main setup function
main() {
    echo "🎓 Online Course Platform Setup"
    echo "================================"
    echo ""
    
    # Check prerequisites
    check_node
    check_npm
    
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
    
    # Show setup instructions
    setup_database
    setup_services
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your configuration"
    echo "2. Set up MongoDB database"
    echo "3. Configure external services (Stripe, Cloudinary, SendGrid)"
    echo "4. Run './start.sh' to start development servers"
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