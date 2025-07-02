# Online Course Platform

A comprehensive platform for creating, selling, and managing online courses with video streaming, progress tracking, and interactive learning features.

## Features

### Core Features
- **Course Creation**: Build courses with video lessons, quizzes, and assignments
- **Video Streaming**: Secure video delivery with progress tracking
- **Student Management**: Track enrollment, progress, and completion
- **Payment Processing**: Integrated Stripe payments for course purchases
- **Progress Tracking**: Monitor student progress and engagement
- **Certificate Generation**: Automatic certificate issuance upon completion

### Instructor Features
- **Course Builder**: Drag-and-drop course creation interface
- **Video Upload**: Support for multiple video formats with automatic processing
- **Analytics Dashboard**: Detailed insights into student performance
- **Revenue Tracking**: Monitor earnings and sales analytics
- **Student Communication**: Built-in messaging and discussion forums
- **Assignment Management**: Create and grade assignments

### Student Features
- **Course Discovery**: Browse and search available courses
- **Learning Dashboard**: Track progress and access course materials
- **Interactive Learning**: Quizzes, assignments, and peer discussions
- **Certificate System**: Earn certificates upon course completion
- **Mobile Learning**: Responsive design for mobile devices
- **Offline Access**: Download course materials for offline viewing

### Technical Features
- **Video Processing**: Automatic video compression and optimization
- **CDN Integration**: Fast global content delivery
- **Security**: DRM-protected video content
- **API Integration**: RESTful API for third-party integrations
- **Real-time Updates**: Live progress tracking and notifications
- **SEO Optimized**: Built for search engine visibility

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Stripe** for payment processing
- **Cloudinary** for video storage and processing
- **FFmpeg** for video processing
- **Nodemailer** for email notifications

### Frontend
- **React** with React Router
- **Tailwind CSS** for styling
- **Video.js** for video player
- **React Hook Form** for forms
- **Recharts** for analytics charts
- **React Player** for video streaming

### Infrastructure
- **MongoDB Atlas** for database
- **Cloudinary** for media storage
- **AWS S3** for file storage (optional)
- **Vercel/Netlify** for deployment

## Monetization Strategy

### Revenue Streams
1. **Course Sales**: 70-85% revenue share for instructors
2. **Subscription Plans**: Monthly/yearly access to course library
3. **Enterprise Solutions**: Custom learning platforms for companies
4. **Certification Fees**: Premium certificates and credentials
5. **Consulting Services**: Course creation and optimization services

### Pricing Models
- **One-time Purchase**: Students buy individual courses
- **Subscription**: Monthly/yearly access to all courses
- **Tiered Pricing**: Basic, Premium, and Enterprise plans
- **Bulk Licensing**: Corporate and educational institution pricing

## Marketing Strategy

### Target Audience
- **Instructors**: Subject matter experts and educators
- **Students**: Lifelong learners and professionals
- **Companies**: Corporate training and skill development
- **Educational Institutions**: Schools and universities

### Marketing Channels
- **Content Marketing**: Educational blog and tutorials
- **Social Media**: LinkedIn, YouTube, Instagram for education
- **SEO**: Target course-related keywords
- **Partnerships**: Collaborate with influencers and educators
- **Email Marketing**: Course announcements and promotions

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Stripe account
- Cloudinary account
- FFmpeg (for video processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd course-platform
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
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=your_verified_email

# File Upload
MAX_FILE_SIZE=100000000
UPLOAD_PATH=uploads
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course
- `GET /api/courses/:id` - Get course by ID
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Lessons
- `GET /api/courses/:courseId/lessons` - Get course lessons
- `POST /api/courses/:courseId/lessons` - Create lesson
- `PUT /api/lessons/:id` - Update lesson
- `DELETE /api/lessons/:id` - Delete lesson

### Enrollments
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/enrollments` - Get user enrollments
- `PUT /api/enrollments/:id/progress` - Update progress

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history

## Deployment

### Production Setup

1. **Database**: Set up MongoDB Atlas cluster
2. **Media Storage**: Configure Cloudinary account
3. **Payment Processing**: Set up Stripe webhooks
4. **Email Service**: Configure SendGrid
5. **Domain**: Set up custom domain with SSL

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
- Configure CDN for video delivery

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Video Protection**: DRM and secure video streaming
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **Input Validation**: Sanitize all user inputs
- **CORS Protection**: Configured for production
- **Helmet.js**: Security headers
- **Stripe Security**: PCI-compliant payment processing

## Support

For support and questions:
- Email: support@courseplatform.com
- Documentation: docs.courseplatform.com
- Community: community.courseplatform.com

## License

MIT License - see LICENSE file for details 