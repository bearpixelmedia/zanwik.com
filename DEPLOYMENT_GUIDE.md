# 🚀 Umbrella Dashboard - Production Deployment Guide

This guide will walk you through deploying your Umbrella Dashboard to production with all features including backend integration, payment processing, and real-time analytics.

## 📋 Prerequisites

Before deploying, ensure you have:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local or cloud)
- [Redis](https://redis.io/) (local or cloud)
- [Vercel CLI](https://vercel.com/cli) (for frontend deployment)
- [Stripe Account](https://stripe.com/) (for payments)
- [Supabase Account](https://supabase.com/) (for authentication)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Databases     │
│   (Vercel)      │◄──►│   (Node.js)     │◄──►│   (MongoDB +    │
│                 │    │                 │    │    Redis)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │   Stripe        │    │   Monitoring    │
│   (Auth)        │    │   (Payments)    │    │   (Logs)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)

1. **Clone and setup:**
   ```bash
   git clone <your-repo>
   cd money
   ```

2. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

3. **Follow the prompts** to configure your environment variables.

### Option 2: Manual Deployment

## 🔧 Step-by-Step Manual Deployment

### 1. Backend Setup

#### 1.1 Environment Configuration

```bash
# Copy the production environment template
cp env.production.example .env

# Edit the .env file with your actual values
nano .env
```

**Required Environment Variables:**

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/umbrella_dashboard_prod
REDIS_URL=redis://username:password@host:port

# Authentication
JWT_SECRET=your-super-secret-jwt-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Payments
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret

# Frontend URL
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

#### 1.2 Database Setup

**MongoDB Atlas (Recommended for Production):**

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

**Redis Cloud:**

1. Create a Redis Cloud account
2. Create a new database
3. Get your connection string
4. Update `REDIS_URL` in your `.env` file

#### 1.3 Install Dependencies

```bash
npm install
```

#### 1.4 Start Backend Server

```bash
# Development
npm run dev

# Production
NODE_ENV=production node src/index.js
```

### 2. Frontend Setup

#### 2.1 Environment Configuration

```bash
cd client

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
EOF
```

#### 2.2 Build and Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

### 3. Third-Party Services Setup

#### 3.1 Supabase Configuration

1. **Create a Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Configure authentication:**
   - Go to Authentication > Settings
   - Add your frontend URL to allowed redirect URLs
   - Configure email templates

3. **Set up database tables:**
   ```sql
   -- Users table (handled by Supabase Auth)
   -- Projects table
   CREATE TABLE projects (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     name TEXT NOT NULL,
     description TEXT,
     category TEXT,
     status TEXT DEFAULT 'planning',
     revenue DECIMAL DEFAULT 0,
     users INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Add RLS policies
   ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view own projects" ON projects
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert own projects" ON projects
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can update own projects" ON projects
     FOR UPDATE USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can delete own projects" ON projects
     FOR DELETE USING (auth.uid() = user_id);
   ```

#### 3.2 Stripe Configuration

1. **Create a Stripe account:**
   - Go to [stripe.com](https://stripe.com)
   - Create an account and get your API keys

2. **Set up webhooks:**
   - Go to Stripe Dashboard > Webhooks
   - Add endpoint: `https://your-backend-domain.com/api/payments/webhook`
   - Select events: `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the webhook secret to your `.env` file

3. **Create products and prices:**
   ```bash
   # Using Stripe CLI
   stripe products create --name "Umbrella Dashboard Pro" --description "Professional money-making dashboard"
   stripe prices create --product=prod_xxx --unit-amount=2900 --currency=usd --recurring[interval]=month
   ```

#### 3.3 Monitoring Setup

1. **Sentry (Error Tracking):**
   - Create a Sentry account
   - Add your DSN to `.env`

2. **Logging:**
   - Set up log aggregation (e.g., Loggly, Papertrail)
   - Configure log rotation

## 🔒 Security Configuration

### 1. SSL/TLS Setup

```bash
# Install SSL certificate (Let's Encrypt)
sudo certbot --nginx -d your-domain.com

# Update nginx configuration
sudo nano /etc/nginx/sites-available/your-domain.com
```

### 2. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Environment Security

- Use strong, unique passwords
- Rotate API keys regularly
- Enable 2FA on all accounts
- Use environment variables for all secrets

## 📊 Monitoring and Analytics

### 1. Application Monitoring

```bash
# Install PM2 for process management
npm install -g pm2

# Start application with PM2
pm2 start src/index.js --name "umbrella-dashboard"

# Monitor logs
pm2 logs umbrella-dashboard

# Monitor performance
pm2 monit
```

### 2. Database Monitoring

- Set up MongoDB Atlas monitoring
- Configure Redis monitoring
- Set up alerts for high usage

### 3. Performance Monitoring

- Set up New Relic or DataDog
- Configure uptime monitoring
- Set up performance alerts

## 🔄 Continuous Deployment

### 1. GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        npm install
        cd client && npm install
        
    - name: Build frontend
      run: cd client && npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        working-directory: ./client
        
    - name: Deploy backend
      run: |
        # Deploy to your server
        ssh user@your-server "cd /path/to/app && git pull && npm install && pm2 restart umbrella-dashboard"
```

### 2. Environment Secrets

Add these secrets to your GitHub repository:

- `VERCEL_TOKEN`
- `ORG_ID`
- `PROJECT_ID`
- `SERVER_SSH_KEY`

## 🧪 Testing

### 1. Health Checks

```bash
# Test backend health
curl https://your-backend-domain.com/api/health

# Test frontend
curl https://your-frontend-domain.vercel.app
```

### 2. Payment Testing

```bash
# Test Stripe webhooks
stripe listen --forward-to localhost:3000/api/payments/webhook

# Test payment flow
# Use Stripe test cards: 4242 4242 4242 4242
```

### 3. Load Testing

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Check `CORS_ORIGIN` in backend `.env`
   - Ensure frontend URL is correct

2. **Database Connection:**
   - Verify MongoDB/Redis connection strings
   - Check network connectivity

3. **Payment Issues:**
   - Verify Stripe keys are correct
   - Check webhook configuration
   - Ensure SSL is enabled

4. **Authentication Issues:**
   - Verify Supabase configuration
   - Check redirect URLs
   - Ensure JWT secret is set

### Debug Commands

```bash
# Check backend logs
tail -f logs/app.log

# Check PM2 status
pm2 status

# Check database connection
mongo "your-connection-string" --eval "db.runCommand('ping')"

# Test Redis connection
redis-cli -u "your-redis-url" ping
```

## 📈 Post-Deployment

### 1. Performance Optimization

- Enable CDN for static assets
- Configure caching headers
- Optimize database queries
- Set up image optimization

### 2. Analytics Setup

- Configure Google Analytics
- Set up conversion tracking
- Monitor user behavior
- Track revenue metrics

### 3. Backup Strategy

- Set up automated database backups
- Configure file backups
- Test restore procedures
- Document recovery processes

## 🎯 Next Steps

1. **User Onboarding:**
   - Create welcome emails
   - Set up user guides
   - Configure help system

2. **Feature Rollout:**
   - Enable advanced features gradually
   - Monitor usage patterns
   - Gather user feedback

3. **Scaling:**
   - Monitor performance metrics
   - Plan for horizontal scaling
   - Consider microservices architecture

## 📞 Support

For deployment issues:

1. Check the troubleshooting section
2. Review application logs
3. Test individual components
4. Contact support with specific error messages

---

**🎉 Congratulations!** Your Umbrella Dashboard is now deployed and ready to help users make money online! 