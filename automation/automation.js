#!/usr/bin/env node

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
      console.error(`No template found for ${platform} ${postType}`);
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
    
    console.log('📅 Weekly Content Schedule:\n');
    
    Object.keys(schedule).forEach(day => {
      console.log(`📅 ${day.toUpperCase()}:`);
      Object.keys(schedule[day]).forEach(platform => {
        const post = schedule[day][platform];
        console.log(`  ${platform.toUpperCase()} (${post.time}):`);
        console.log(`    ${post.content.substring(0, 100)}...`);
        console.log(`    Hashtags: ${post.hashtags ? post.hashtags.join(' ') : 'N/A'}`);
        console.log('');
      });
    });
  }
}

// Run automation
const automation = new ContentAutomation();
automation.printWeeklySchedule();
