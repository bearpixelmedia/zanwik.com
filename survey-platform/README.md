# Online Survey Platform

A comprehensive platform for creating, distributing, and analyzing surveys with advanced analytics, reporting, and data visualization capabilities.

## Features

### Core Features
- **Survey Builder**: Drag-and-drop survey creation with 20+ question types
- **Response Collection**: Multi-channel distribution and response tracking
- **Advanced Analytics**: Real-time analytics with charts and insights
- **Data Export**: Export results in multiple formats (PDF, Excel, CSV)
- **Team Collaboration**: Multi-user access with role-based permissions
- **White-label Solution**: Custom branding for agencies and organizations

### Survey Creation
- **Question Types**: Multiple choice, rating scales, open-ended, matrix, file upload
- **Logic & Branching**: Conditional logic and skip patterns
- **Templates**: Pre-built survey templates for common use cases
- **Media Support**: Images, videos, and audio in questions
- **Multi-language**: Support for multiple languages and translations
- **Mobile Optimization**: Responsive design for all devices

### Distribution & Collection
- **Multiple Channels**: Email, social media, website embedding, QR codes
- **Email Campaigns**: Automated email distribution with tracking
- **Social Sharing**: Direct sharing to social media platforms
- **Website Integration**: Embed surveys on websites and landing pages
- **QR Code Generation**: Mobile-friendly QR codes for offline distribution
- **Response Limits**: Set maximum responses and time limits

### Analytics & Reporting
- **Real-time Dashboard**: Live response tracking and analytics
- **Advanced Charts**: Interactive charts and data visualization
- **Cross-tabulation**: Analyze relationships between questions
- **Filtering & Segmentation**: Filter responses by demographics and criteria
- **Export Options**: PDF reports, Excel spreadsheets, CSV data
- **Custom Reports**: Create and schedule custom reports

### Advanced Features
- **A/B Testing**: Test different survey versions
- **Response Validation**: Custom validation rules and requirements
- **Progress Tracking**: Track completion rates and drop-off points
- **Geolocation**: Track respondent locations and demographics
- **Device Analytics**: Analyze responses by device and browser
- **API Integration**: RESTful API for custom integrations

### Team & Collaboration
- **User Management**: Add team members with different roles
- **Approval Workflow**: Survey review and approval process
- **Activity Logs**: Track all actions and changes
- **Collaboration Tools**: Comments, mentions, and task assignment
- **White-label**: Custom branding for agencies and organizations

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Stripe** for payment processing
- **Redis** for caching and sessions
- **Socket.io** for real-time updates
- **Chart.js** for data visualization
- **PDF-lib** for report generation
- **ExcelJS** for spreadsheet export

### Frontend
- **React** with React Router
- **Tailwind CSS** for styling
- **Recharts** for analytics charts
- **React Hook Form** for forms
- **React Query** for data fetching
- **Socket.io Client** for real-time updates
- **React Dropzone** for file uploads
- **Framer Motion** for animations
- **React Beautiful DnD** for drag-and-drop

### Infrastructure
- **MongoDB Atlas** for database
- **Redis Cloud** for caching
- **AWS S3** for file storage
- **Vercel/Netlify** for deployment

## Monetization Strategy

### Revenue Streams
1. **Subscription Plans**: Monthly/yearly access to platform features
2. **Per-Response Pricing**: Pay per survey response collected
3. **Premium Features**: Advanced analytics and reporting tools
4. **White-label Solutions**: Custom branded platforms for agencies
5. **API Access**: Developer API for custom integrations

### Pricing Models
- **Starter**: $29/month for basic surveys (100 responses)
- **Professional**: $79/month for advanced features (1,000 responses)
- **Business**: $199/month for enterprise features (10,000 responses)
- **Enterprise**: $499/month for unlimited responses and white-label
- **Pay-per-use**: $0.10 per response for occasional users

## Marketing Strategy

### Target Audience
- **Market Researchers**: Professional researchers and consultants
- **Businesses**: Companies conducting customer feedback and market research
- **Educational Institutions**: Universities and schools for academic research
- **Government Agencies**: Public sector organizations for citizen surveys
- **Non-profits**: Organizations conducting community surveys
- **Agencies**: Marketing and research agencies serving clients

### Marketing Channels
- **Content Marketing**: Blog about survey best practices and research methods
- **Social Media**: LinkedIn, Twitter for business audience
- **SEO**: Target survey and research keywords
- **Webinars**: Educational content about survey design and analysis
- **Partnerships**: Collaborate with research organizations and universities

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Redis server
- Stripe account
- AWS S3 bucket (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd survey-platform
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

4. **Database setup**
   ```bash
   # MongoDB connection will be established automatically
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/survey_platform

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yoursurveyplatform.com

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name

# File Upload
MAX_FILE_SIZE=10000000
UPLOAD_PATH=uploads

# Survey Settings
MAX_QUESTIONS_PER_SURVEY=100
MAX_RESPONSES_PER_SURVEY=10000
RESPONSE_RETENTION_DAYS=365

# Analytics Settings
ANALYTICS_ENABLED=true
REAL_TIME_UPDATES=true
EXPORT_LIMIT=10000

# Security
CORS_ORIGIN=http://localhost:3000
SESSION_SECRET=your_session_secret_key
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Surveys
- `GET /api/surveys` - Get all surveys
- `POST /api/surveys` - Create survey
- `GET /api/surveys/:id` - Get survey by ID
- `PUT /api/surveys/:id` - Update survey
- `DELETE /api/surveys/:id` - Delete survey
- `POST /api/surveys/:id/publish` - Publish survey

### Responses
- `GET /api/responses` - Get all responses
- `POST /api/responses` - Submit response
- `GET /api/responses/:id` - Get response by ID
- `GET /api/surveys/:id/responses` - Get survey responses

### Analytics
- `GET /api/analytics/overview` - Get overview analytics
- `GET /api/analytics/surveys` - Get survey analytics
- `GET /api/analytics/responses` - Get response analytics
- `GET /api/analytics/export` - Export analytics data

### Reports
- `GET /api/reports/generate` - Generate custom report
- `GET /api/reports/schedule` - Schedule report generation
- `GET /api/reports/download` - Download report

## Deployment

### Production Setup

1. **Database**: Set up MongoDB Atlas cluster
2. **Redis**: Configure Redis Cloud instance
3. **File Storage**: Set up AWS S3 bucket
4. **Payment Processing**: Configure Stripe webhooks
5. **Email Service**: Set up SendGrid
6. **Domain**: Set up custom domain with SSL

### Deployment Options

**Vercel (Recommended)**
```bash
npm run build
vercel --prod
```

**Heroku**
```bash
heroku create
git push heroku main
```

**AWS/DigitalOcean**
- Deploy using Docker containers
- Set up load balancer and auto-scaling
- Configure CDN for static assets

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevent abuse and spam responses
- **Input Validation**: Sanitize all user inputs
- **CORS Protection**: Configured for production
- **Helmet.js**: Security headers
- **Data Encryption**: Encrypt sensitive survey data
- **Response Validation**: Prevent duplicate and invalid responses

## Support

For support and questions:
- Email: support@surveyplatform.com
- Documentation: docs.surveyplatform.com
- Community: community.surveyplatform.com

## License

MIT License - see LICENSE file for details 