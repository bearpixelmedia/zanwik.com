#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Content Marketing Automation...\n');

// Create automation configuration
const automationConfig = {
  platforms: {
    linkedin: {
      enabled: true,
      postingTime: '09:00',
      hashtags: ['#API', '#WebDevelopment', '#Tech', '#Entrepreneurship', '#Programming']
    },
    twitter: {
      enabled: true,
      postingTime: '12:00',
      hashtags: ['#API', '#WebDev', '#JavaScript', '#Tech']
    },
    reddit: {
      enabled: true,
      postingTime: '14:00',
      subreddits: ['webdev', 'startups', 'programming']
    }
  },
  content: {
    blogPosts: [
      {
        title: 'How to Integrate APIs in 2024: Complete Developer Guide',
        slug: 'api-integration-guide-2024',
        category: 'Tutorial',
        url: 'https://client-g75jef1ib-byronmccluney.vercel.app/blog/api-integration-guide-2024'
      },
      {
        title: 'Top 10 APIs Every Startup Should Know (With Code Examples)',
        slug: 'top-10-apis-startup-should-know',
        category: 'List',
        url: 'https://client-g75jef1ib-byronmccluney.vercel.app/blog/top-10-apis-startup-should-know'
      },
      {
        title: 'API Security Best Practices: Protect Your Data',
        slug: 'api-security-best-practices',
        category: 'Security',
        url: 'https://client-g75jef1ib-byronmccluney.vercel.app/blog/api-security-best-practices'
      }
    ]
  },
  schedule: {
    monday: {
      linkedin: 'API Integration Guide post',
      twitter: 'Thread starter',
      reddit: 'r/webdev post'
    },
    tuesday: {
      linkedin: 'Top 10 APIs for Startups',
      twitter: 'Startup APIs tweet',
      reddit: 'r/startups post'
    },
    wednesday: {
      linkedin: 'API Security post',
      twitter: 'Security thread',
      reddit: 'r/programming post'
    },
    thursday: {
      linkedin: 'Combined insights',
      twitter: 'Best practices thread',
      reddit: 'AMA/Q&A post'
    },
    friday: {
      linkedin: 'Case study',
      twitter: 'Weekly recap',
      reddit: 'Community engagement'
    }
  }
};

// Create content templates
const contentTemplates = {
  linkedin: {
    apiIntegration: `🔧 Just published: "How to Integrate APIs in 2024: Complete Developer Guide"

This comprehensive 12-minute read covers:
✅ Authentication methods (OAuth 2.0, JWT, API Keys)
✅ Error handling best practices
✅ Testing strategies
✅ Real code examples you can use today

Perfect for developers, entrepreneurs, and anyone building modern applications.

Read the full guide: {url}

#API #WebDevelopment #Tech #Entrepreneurship #Programming`,

    top10APIs: `🚀 Every startup needs these 10 APIs to succeed:

1. Stripe (Payments)
2. Twilio (Communication) 
3. SendGrid (Email)
4. Google Maps (Location)
5. AWS S3 (Storage)
6. GitHub (Code Management)
7. Slack (Team Communication)
8. Firebase (Backend)
9. OpenAI (AI Services)
10. Zapier (Automation)

Each comes with code examples and pricing info. Save months of development time!

Full breakdown: {url}

#Startup #APIs #Tech #Entrepreneurship #Development`,

    apiSecurity: `🔒 API Security Alert: Are you protecting your data?

Common vulnerabilities I see:
❌ Hardcoded API keys
❌ No rate limiting
❌ Weak authentication
❌ Missing input validation

Our new guide covers 10 essential security practices with real code examples.

Don't wait for a breach - secure your APIs now: {url}

#APISecurity #Cybersecurity #WebDevelopment #Tech`
  },

  twitter: {
    apiIntegration: `🧵 Just published a comprehensive API integration guide for 2024

Perfect for developers building modern applications. Covers authentication, error handling, testing, and best practices.

Thread with key insights 👇

{url}

#API #WebDev #JavaScript #Tech`,

    top10APIs: `🚀 Building a startup? These 10 APIs will save you months of development:

• Stripe (payments)
• Twilio (SMS/calls)
• SendGrid (email)
• Google Maps (location)
• AWS S3 (storage)

Each with code examples and pricing. Full list: {url}

#StartupLife #APIs #Tech #Entrepreneurship`,

    apiSecurity: `🔒 API Security Checklist:

✅ HTTPS enforced
✅ Strong authentication
✅ Rate limiting
✅ Input validation
✅ Error handling
✅ Monitoring

Missing any? Read our security guide: {url}

#APISecurity #Cybersecurity #WebDev`
  },

  reddit: {
    apiIntegration: `**Title:** Complete API Integration Guide for 2024 - Authentication, Error Handling, Testing

**Body:**
Hey r/webdev! I just published a comprehensive guide on API integration that covers everything from authentication methods to security best practices.

The guide includes:
- OAuth 2.0 with PKCE implementation
- JWT token handling
- Error handling patterns
- Testing strategies
- Real code examples

I've been working with APIs for years and wanted to share everything I've learned. The guide is aimed at both beginners and experienced developers.

**Link:** {url}

Would love to hear your thoughts and any additional tips you'd add!

**Flair:** Tutorial`,

    top10APIs: `**Title:** Top 10 APIs Every Startup Should Know (With Code Examples)

**Body:**
As someone who's built multiple startups, I know how crucial it is to choose the right APIs early on. I've compiled a list of the 10 most essential APIs that can save you months of development time.

Each API includes:
- Use cases
- Pricing information
- Code examples
- Difficulty level

The list covers everything from payments (Stripe) to AI (OpenAI) to automation (Zapier).

**Link:** {url}

What APIs have been game-changers for your startup?

**Flair:** Resources`,

    apiSecurity: `**Title:** API Security Best Practices - Protect Your Data

**Body:**
Security is often an afterthought when building APIs, but it shouldn't be. I've created a comprehensive guide covering essential security practices including:

- Authentication methods (OAuth 2.0, JWT)
- Authorization patterns
- Encryption strategies
- Input validation
- Rate limiting
- Monitoring and logging

The guide includes real code examples and a security checklist you can use immediately.

**Link:** {url}

What security practices do you implement in your APIs?

**Flair:** Tutorial`
  }
};

// Create automation files
const createAutomationFiles = () => {
  console.log('📁 Creating automation files...');

  // Create automation directory
  const automationDir = path.join(__dirname, '..', 'automation');
  if (!fs.existsSync(automationDir)) {
    fs.mkdirSync(automationDir, { recursive: true });
  }

  // Create configuration file
  fs.writeFileSync(
    path.join(automationDir, 'config.json'),
    JSON.stringify(automationConfig, null, 2)
  );

  // Create content templates file
  fs.writeFileSync(
    path.join(automationDir, 'templates.json'),
    JSON.stringify(contentTemplates, null, 2)
  );

  // Create automation script
  const automationScript = `#!/usr/bin/env node

const config = require('./config.json');
const templates = require('./templates.json');

class ContentAutomation {
  constructor() {
    this.config = config;
    this.templates = templates;
  }

  // Generate content for a specific day and platform
  generateContent(day, platform, postType) {
    const template = this.templates[platform][postType];
    if (!template) {
      console.error(\`No template found for \${platform} \${postType}\`);
      return null;
    }

    // Replace placeholders with actual URLs
    const url = this.getBlogPostUrl(postType);
    return template.replace('{url}', url);
  }

  // Get blog post URL based on post type
  getBlogPostUrl(postType) {
    const postMap = {
      apiIntegration: 'https://client-g75jef1ib-byronmccluney.vercel.app/blog/api-integration-guide-2024',
      top10APIs: 'https://client-g75jef1ib-byronmccluney.vercel.app/blog/top-10-apis-startup-should-know',
      apiSecurity: 'https://client-g75jef1ib-byronmccluney.vercel.app/blog/api-security-best-practices'
    };

    return postMap[postType] || '';
  }

  // Generate weekly content schedule
  generateWeeklySchedule() {
    const schedule = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    days.forEach(day => {
      schedule[day] = {};
      const dayConfig = this.config.schedule[day];

      Object.keys(dayConfig).forEach(platform => {
        const postType = this.getPostType(dayConfig[platform]);
        schedule[day][platform] = {
          content: this.generateContent(day, platform, postType),
          time: this.config.platforms[platform].postingTime,
          hashtags: this.config.platforms[platform].hashtags
        };
      });
    });

    return schedule;
  }

  // Determine post type based on content description
  getPostType(description) {
    if (description.includes('API Integration')) return 'apiIntegration';
    if (description.includes('Top 10 APIs')) return 'top10APIs';
    if (description.includes('API Security')) return 'apiSecurity';
    return 'apiIntegration'; // Default
  }

  // Print weekly schedule
  printWeeklySchedule() {
    const schedule = this.generateWeeklySchedule();
    
    console.log('📅 Weekly Content Schedule:\\n');
    
    Object.keys(schedule).forEach(day => {
      console.log(\`📅 \${day.toUpperCase()}:\`);
      Object.keys(schedule[day]).forEach(platform => {
        const post = schedule[day][platform];
        console.log(\`  \${platform.toUpperCase()} (\${post.time}):\`);
        console.log(\`    \${post.content.substring(0, 100)}...\`);
        console.log(\`    Hashtags: \${post.hashtags.join(' ')}\`);
        console.log('');
      });
    });
  }
}

// Run automation
const automation = new ContentAutomation();
automation.printWeeklySchedule();
`;

  fs.writeFileSync(
    path.join(automationDir, 'automation.js'),
    automationScript
  );

  // Make script executable
  fs.chmodSync(path.join(automationDir, 'automation.js'), '755');

  console.log('✅ Automation files created successfully!');
};

// Create environment setup
const createEnvironmentSetup = () => {
  console.log('🔧 Creating environment setup...');

  const envExample = `# Social Media Automation
BUFFER_ACCESS_TOKEN=your_buffer_token_here
LINKEDIN_ACCESS_TOKEN=your_linkedin_token_here
TWITTER_BEARER_TOKEN=your_twitter_token_here
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here

# Analytics
GOOGLE_ANALYTICS_ID=G-Y1DM6G1JR1
GOOGLE_TAG_MANAGER_ID=your_gtm_id_here

# Content Management
CANVA_API_KEY=your_canva_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_key_here
`;

  fs.writeFileSync(path.join(__dirname, '..', '.env.automation'), envExample);
  console.log('✅ Environment setup created!');
};

// Create package.json for automation
const createPackageJson = () => {
  console.log('📦 Creating automation package.json...');

  const packageJson = {
    name: 'zanwik-content-automation',
    version: '1.0.0',
    description: 'Content marketing automation for Zanwik',
    main: 'automation/automation.js',
    scripts: {
      'generate-schedule': 'node automation/automation.js',
      'post-linkedin': 'node automation/post-linkedin.js',
      'post-twitter': 'node automation/post-twitter.js',
      'post-reddit': 'node automation/post-reddit.js'
    },
    dependencies: {
      'node-cron': '^3.0.2',
      'axios': '^1.4.0',
      'dotenv': '^16.0.3'
    },
    devDependencies: {
      'nodemon': '^2.0.22'
    }
  };

  fs.writeFileSync(
    path.join(__dirname, '..', 'automation-package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  console.log('✅ Package.json created!');
};

// Main execution
const main = () => {
  try {
    createAutomationFiles();
    createEnvironmentSetup();
    createPackageJson();

    console.log('\n🎉 Automation setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Install dependencies: npm install --package-lock-only automation-package.json');
    console.log('2. Set up environment variables in .env.automation');
    console.log('3. Run: node automation/automation.js');
    console.log('4. Set up social media API keys');
    console.log('5. Schedule automated posting');

    console.log('\n🚀 Ready to automate your content marketing!');
  } catch (error) {
    console.error('❌ Error setting up automation:', error.message);
    process.exit(1);
  }
};

main();
