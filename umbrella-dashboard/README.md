# Umbrella Dashboard

A comprehensive management dashboard for overseeing all 10 online money-making projects. Monitor, deploy, and manage your entire portfolio of projects from a single interface.

## Overview

The Umbrella Dashboard provides centralized management for:
- **AI Content Generator SaaS**
- **Digital Product Marketplace**
- **Freelance Service Platform**
- **Subscription Box Management**
- **Online Course Platform**
- **Affiliate Marketing Dashboard**
- **Dropshipping Store Builder**
- **Social Media Management Tool**
- **Online Survey Platform**
- **Cryptocurrency Trading Bot**

## Features

### Project Management
- **Unified Dashboard**: View all projects in one interface
- **Project Status**: Real-time monitoring of each project's health
- **Deployment Management**: Deploy, update, and rollback projects
- **Resource Monitoring**: CPU, memory, disk usage, and performance metrics
- **Log Management**: Centralized logging and error tracking

### Analytics & Reporting
- **Revenue Dashboard**: Track income from all projects
- **User Analytics**: Monitor user growth and engagement
- **Performance Metrics**: Response times, uptime, and error rates
- **Financial Reports**: Revenue, expenses, and profit analysis
- **Custom Reports**: Generate reports for specific time periods

### Infrastructure Management
- **Server Management**: Monitor and manage all servers
- **Database Management**: MongoDB, Redis, and PostgreSQL monitoring
- **SSL Certificate Management**: Auto-renewal and monitoring
- **Backup Management**: Automated backups and recovery
- **Security Monitoring**: Security alerts and vulnerability scanning

### Development Tools
- **Code Repository Management**: Git integration and version control
- **CI/CD Pipeline**: Automated testing and deployment
- **Environment Management**: Staging, production, and development environments
- **API Documentation**: Centralized API docs for all projects
- **Testing Dashboard**: Test results and coverage reports

### Business Intelligence
- **Market Analysis**: Industry trends and competitor analysis
- **Customer Insights**: User behavior and feedback analysis
- **ROI Tracking**: Return on investment for each project
- **Growth Metrics**: User acquisition and retention rates
- **Predictive Analytics**: Revenue forecasting and trend prediction

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for data storage
- **Redis** for caching and real-time data
- **Socket.io** for real-time updates
- **PM2** for process management
- **Docker** for containerization

### Frontend
- **React** with TypeScript
- **Chart.js** for data visualization
- **Socket.io Client** for real-time updates
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **Framer Motion** for animations

### Infrastructure
- **Docker** for containerization
- **AWS/DigitalOcean** for deployment
- **MongoDB Atlas** for database
- **Redis Cloud** for caching
- **Cloudflare** for CDN and security

## Project Structure

```
umbrella-dashboard/
├── src/
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions
│   └── index.js          # Main server file
├── client/               # React frontend
├── config/               # Configuration files
├── scripts/              # Deployment scripts
├── docs/                 # Documentation
└── monitoring/           # Monitoring tools
```

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Redis server
- Docker (optional)
- PM2 (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd umbrella-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the dashboard**
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/umbrella_dashboard
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Projects Configuration
PROJECTS_PATH=../projects
DOCKER_ENABLED=true
PM2_ENABLED=true

# Monitoring
UPTIME_ROBOT_API_KEY=your_uptime_robot_key
NEW_RELIC_LICENSE_KEY=your_new_relic_key
SENTRY_DSN=your_sentry_dsn

# Notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
SLACK_WEBHOOK_URL=your_slack_webhook
DISCORD_WEBHOOK_URL=your_discord_webhook

# External Services
STRIPE_SECRET_KEY=your_stripe_secret_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
DIGITALOCEAN_TOKEN=your_digitalocean_token
```

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects/:id/deploy` - Deploy project
- `POST /api/projects/:id/restart` - Restart project
- `GET /api/projects/:id/logs` - Get project logs

### Analytics
- `GET /api/analytics/overview` - Get overview analytics
- `GET /api/analytics/revenue` - Get revenue analytics
- `GET /api/analytics/users` - Get user analytics
- `GET /api/analytics/performance` - Get performance metrics

### Infrastructure
- `GET /api/infrastructure/servers` - Get server status
- `GET /api/infrastructure/databases` - Get database status
- `GET /api/infrastructure/ssl` - Get SSL certificate status
- `POST /api/infrastructure/backup` - Create backup

## Deployment

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up -d
```

### PM2 Deployment
```bash
# Start with PM2
pm2 start ecosystem.config.js
```

### Manual Deployment
```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Start production server
npm start
```

## Monitoring

### Health Checks
- Automatic health checks every 5 minutes
- Email/Slack notifications for failures
- Automatic restart on failure
- Performance monitoring and alerting

### Logging
- Centralized log collection
- Log rotation and archiving
- Error tracking and alerting
- Performance monitoring

### Security
- SSL certificate monitoring
- Security vulnerability scanning
- Access control and authentication
- Audit logging

## Support

For support and questions:
- Email: support@umbrella-dashboard.com
- Documentation: docs.umbrella-dashboard.com
- Community: community.umbrella-dashboard.com

## License

MIT License - see LICENSE file for details 