# 🔑 API Keys Setup Guide

## 🎯 **Quick Setup Checklist**

### **✅ LinkedIn API Setup**
1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Create a new app
3. Request "Share on LinkedIn" permission
4. Get Client ID and Client Secret
5. Generate Access Token

### **✅ Twitter API Setup**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Enable OAuth 2.0
4. Get API Key, API Secret, Access Token, Access Token Secret
5. Generate Bearer Token

### **✅ Reddit API Setup**
1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Create a new app (script type)
3. Get Client ID and Client Secret
4. Use your Reddit username and password

## 🔧 **Environment Variables Setup**

### **Step 1: Create .env file**
```bash
cd /Users/whitefoxstudios/Projects/Web/zanwik.com
cp .env.automation .env
```

### **Step 2: Add your API keys**
```bash
# LinkedIn API
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token_here

# Twitter API
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret_here
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# Reddit API
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here
REDDIT_USERNAME=your_reddit_username_here
REDDIT_PASSWORD=your_reddit_password_here

# Analytics
GOOGLE_ANALYTICS_ID=G-Y1DM6G1JR1
GOOGLE_TAG_MANAGER_ID=your_gtm_id_here

# Content Management
CANVA_API_KEY=your_canva_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_key_here
```

## 🚀 **Quick Test Commands**

### **Test LinkedIn**
```bash
node automation/post-linkedin.js
```

### **Test Twitter**
```bash
node automation/post-twitter.js
```

### **Test Reddit**
```bash
node automation/post-reddit.js
```

### **Test All Platforms**
```bash
node automation/master-automation.js test
```

## 📱 **Platform-Specific Setup**

### **LinkedIn Setup**
1. **Go to LinkedIn Developer Portal**
2. **Create New App**
   - App name: "Zanwik Content Marketing"
   - LinkedIn Page: Select your company page
   - App logo: Upload your logo
   - Legal agreement: Accept terms
3. **Request Permissions**
   - Share on LinkedIn
   - Read user profile
   - Read user email address
4. **Get Credentials**
   - Client ID
   - Client Secret
   - Access Token

### **Twitter Setup**
1. **Go to Twitter Developer Portal**
2. **Create New App**
   - App name: "Zanwik Content Marketing"
   - App description: "Content marketing automation for Zanwik"
   - Website: https://client-g75jef1ib-byronmccluney.vercel.app
3. **Enable OAuth 2.0**
   - Go to App Settings
   - Enable OAuth 2.0
   - Set callback URL: http://localhost:3000/auth/twitter/callback
4. **Get Credentials**
   - API Key
   - API Secret
   - Access Token
   - Access Token Secret
   - Bearer Token

### **Reddit Setup**
1. **Go to Reddit App Preferences**
2. **Create New App**
   - App type: "script"
   - App name: "Zanwik Content Marketing"
   - Description: "Content marketing automation for Zanwik"
   - Redirect URI: http://localhost:3000/auth/reddit/callback
3. **Get Credentials**
   - Client ID
   - Client Secret
   - Username (your Reddit username)
   - Password (your Reddit password)

## 🎯 **Content Creation Tools**

### **Visual Content**
- **Canva** - For Instagram stories and carousel posts
- **Figma** - For infographics and designs
- **Unsplash** - For stock photos
- **Giphy** - For animated GIFs

### **Video Content**
- **TikTok** - For short-form videos
- **Instagram Reels** - For vertical videos
- **YouTube Shorts** - For 60-second videos
- **Loom** - For screen recordings

### **Audio Content**
- **Anchor** - For podcast hosting
- **Audacity** - For audio editing
- **Zoom** - For interviews
- **Riverside** - For high-quality recordings

## 📊 **Analytics Setup**

### **Google Analytics 4**
1. **Go to Google Analytics**
2. **Create Property**
   - Property name: "Zanwik Content Marketing"
   - Website URL: https://client-g75jef1ib-byronmccluney.vercel.app
   - Industry: Technology
3. **Get Tracking ID**
   - GA4 Measurement ID: G-Y1DM6G1JR1
   - Add to your website

### **Google Search Console**
1. **Go to Google Search Console**
2. **Add Property**
   - URL: https://client-g75jef1ib-byronmccluney.vercel.app
3. **Verify Ownership**
   - Upload HTML file
   - Add meta tag
   - Use Google Analytics

### **Social Media Analytics**
- **LinkedIn Analytics** - Available in LinkedIn Page admin
- **Twitter Analytics** - Available in Twitter dashboard
- **Reddit Analytics** - Available in Reddit profile
- **Instagram Analytics** - Available in Instagram business account

## 🚀 **Quick Start Commands**

### **Install Dependencies**
```bash
npm install axios dotenv
```

### **Set Up Environment**
```bash
cp .env.automation .env
# Edit .env with your API keys
```

### **Test Integrations**
```bash
node automation/master-automation.js test
```

### **Start Daily Posting**
```bash
node automation/master-automation.js post monday
```

## 🎯 **Success Metrics**

### **Traffic Goals**
- **Month 1:** 1,000+ blog visitors
- **Month 2:** 2,500+ blog visitors
- **Month 3:** 5,000+ blog visitors

### **Engagement Goals**
- **LinkedIn:** 5%+ engagement rate
- **Twitter:** 3%+ engagement rate
- **Reddit:** 10+ upvotes per post

### **Conversion Goals**
- **Newsletter Signups:** 5%+ conversion rate
- **API Directory Visits:** 10%+ click-through rate
- **Social Media Followers:** 100+ new followers per month

---

**Ready to set up your API keys and start automating your content marketing!** 🚀
