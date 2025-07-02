#!/bin/bash

# Umbrella Dashboard Setup Script
# This script sets up the complete umbrella dashboard environment

set -e

echo "🚀 Starting Umbrella Dashboard Setup..."

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check Node.js version
print_status "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check npm
print_status "Checking npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi

print_success "npm version: $(npm -v)"

# Check if MongoDB is running
print_status "Checking MongoDB connection..."
if ! command -v mongosh &> /dev/null; then
    print_warning "MongoDB client not found. Please install MongoDB."
    print_status "You can install MongoDB from: https://docs.mongodb.com/manual/installation/"
else
    if mongosh --eval "db.runCommand('ping')" &> /dev/null; then
        print_success "MongoDB is running"
    else
        print_warning "MongoDB is not running. Please start MongoDB service."
    fi
fi

# Check if Redis is running
print_status "Checking Redis connection..."
if ! command -v redis-cli &> /dev/null; then
    print_warning "Redis client not found. Please install Redis."
    print_status "You can install Redis from: https://redis.io/download"
else
    if redis-cli ping &> /dev/null; then
        print_success "Redis is running"
    else
        print_warning "Redis is not running. Please start Redis service."
    fi
fi

# Check Docker (optional)
print_status "Checking Docker..."
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        print_success "Docker is available"
    else
        print_warning "Docker is installed but not running"
    fi
else
    print_warning "Docker not found. Docker is optional but recommended for deployment."
fi

# Check PM2 (optional)
print_status "Checking PM2..."
if command -v pm2 &> /dev/null; then
    print_success "PM2 is available"
else
    print_warning "PM2 not found. Installing PM2 globally..."
    npm install -g pm2
    print_success "PM2 installed"
fi

# Create necessary directories
print_status "Creating directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p config
mkdir -p scripts
mkdir -p docs

# Install backend dependencies
print_status "Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd client
npm install

if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

# Create environment file
print_status "Setting up environment configuration..."
if [ ! -f .env ]; then
    cp env.example .env
    print_success "Environment file created from template"
    print_warning "Please edit .env file with your configuration"
else
    print_warning "Environment file already exists"
fi

# Create database indexes
print_status "Setting up database..."
node -e "
const mongoose = require('mongoose');
const Project = require('./src/models/Project');
const User = require('./src/models/User');

async function setupDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/umbrella_dashboard');
        console.log('Connected to MongoDB');
        
        // Create indexes
        await Project.createIndexes();
        await User.createIndexes();
        
        console.log('Database indexes created');
        process.exit(0);
    } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    }
}

setupDatabase();
"

if [ $? -eq 0 ]; then
    print_success "Database setup completed"
else
    print_error "Database setup failed"
    exit 1
fi

# Create default admin user
print_status "Creating default admin user..."
node -e "
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/umbrella_dashboard');
        
        const existingAdmin = await User.findOne({ email: 'admin@umbrella-dashboard.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }
        
        const hashedPassword = await bcrypt.hash('admin123', 12);
        const adminUser = new User({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@umbrella-dashboard.com',
            password: hashedPassword,
            role: 'admin',
            isVerified: true
        });
        
        await adminUser.save();
        console.log('Default admin user created');
        console.log('Email: admin@umbrella-dashboard.com');
        console.log('Password: admin123');
        console.log('Please change the password after first login');
        
        process.exit(0);
    } catch (error) {
        console.error('Failed to create admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
"

if [ $? -eq 0 ]; then
    print_success "Default admin user created"
else
    print_error "Failed to create admin user"
fi

# Set up monitoring
print_status "Setting up monitoring..."
mkdir -p monitoring/scripts
mkdir -p monitoring/logs

# Create monitoring script
cat > monitoring/scripts/health-check.sh << 'EOF'
#!/bin/bash
# Health check script for umbrella dashboard

DASHBOARD_URL="http://localhost:3000/api/health"
LOG_FILE="monitoring/logs/health-check.log"

# Check dashboard health
response=$(curl -s -o /dev/null -w "%{http_code}" $DASHBOARD_URL)

if [ $response -eq 200 ]; then
    echo "$(date): Dashboard is healthy" >> $LOG_FILE
else
    echo "$(date): Dashboard health check failed - HTTP $response" >> $LOG_FILE
    # Send notification here
fi
EOF

chmod +x monitoring/scripts/health-check.sh

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'umbrella-dashboard',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
};
EOF

# Create systemd service file (optional)
if command -v systemctl &> /dev/null; then
    print_status "Creating systemd service file..."
    sudo tee /etc/systemd/system/umbrella-dashboard.service > /dev/null << EOF
[Unit]
Description=Umbrella Dashboard
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    print_success "Systemd service file created"
    print_status "To enable the service: sudo systemctl enable umbrella-dashboard"
    print_status "To start the service: sudo systemctl start umbrella-dashboard"
fi

# Create backup script
cat > scripts/backup.sh << 'EOF'
#!/bin/bash
# Backup script for umbrella dashboard

BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="umbrella_dashboard_$DATE"

mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri="$(grep MONGODB_URI .env | cut -d '=' -f2)" --out="$BACKUP_DIR/$BACKUP_NAME"

# Backup configuration files
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz" .env ecosystem.config.js

echo "Backup completed: $BACKUP_NAME"
EOF

chmod +x scripts/backup.sh

# Create deployment script
cat > scripts/deploy.sh << 'EOF'
#!/bin/bash
# Deployment script for umbrella dashboard

set -e

echo "Deploying Umbrella Dashboard..."

# Pull latest changes
git pull origin main

# Install dependencies
npm install
cd client && npm install && cd ..

# Build frontend
cd client && npm run build && cd ..

# Restart application
if command -v pm2 &> /dev/null; then
    pm2 restart umbrella-dashboard
else
    npm start
fi

echo "Deployment completed successfully"
EOF

chmod +x scripts/deploy.sh

# Final setup
print_status "Finalizing setup..."

# Create README for the setup
cat > SETUP_README.md << 'EOF'
# Umbrella Dashboard Setup Complete

## Quick Start

1. **Start the dashboard:**
   ```bash
   npm run dev
   ```

2. **Access the dashboard:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000

3. **Default admin credentials:**
   - Email: admin@umbrella-dashboard.com
   - Password: admin123

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run build` - Build frontend
- `npm run deploy` - Deploy to production
- `npm run monitor` - Start monitoring

## Configuration

Edit the `.env` file to configure:
- Database connections
- External services
- Monitoring settings
- Notification channels

## Monitoring

The dashboard includes built-in monitoring:
- Health checks every 5 minutes
- Performance metrics
- Error tracking
- Alert notifications

## Backup

Run backup script:
```bash
./scripts/backup.sh
```

## Deployment

Run deployment script:
```bash
./scripts/deploy.sh
```

## Support

For issues and questions, check the main README.md file.
EOF

print_success "Setup completed successfully!"
echo ""
echo "🎉 Umbrella Dashboard is ready to use!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start the dashboard: npm run dev"
echo "3. Access the dashboard at http://localhost:3001"
echo "4. Login with admin@umbrella-dashboard.com / admin123"
echo ""
echo "📚 Check SETUP_README.md for more information"
echo "" 