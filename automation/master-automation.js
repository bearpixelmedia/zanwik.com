#!/usr/bin/env node

const LinkedInAPI = require('./post-linkedin');
const TwitterAPI = require('./post-twitter');
const RedditAPI = require('./post-reddit');
const config = require('./config.json');
const templates = require('./templates.json');
require('dotenv').config();

class MasterAutomation {
  constructor() {
    this.linkedin = new LinkedInAPI();
    this.twitter = new TwitterAPI();
    this.reddit = new RedditAPI();
    this.config = config;
    this.templates = templates;
  }

  // Execute daily posting
  async executeDailyPosting(day) {
    console.log(`🚀 Executing daily posting for ${day}...`);
    
    const dayConfig = this.config.schedule[day];
    if (!dayConfig) {
      console.log(`❌ No configuration found for ${day}`);
      return;
    }

    const results = {};

    // LinkedIn posting
    if (dayConfig.linkedin) {
      try {
        const content = this.generateContent('linkedin', dayConfig.linkedin);
        const result = await this.linkedin.postToLinkedIn(content);
        results.linkedin = { success: true, data: result };
      } catch (error) {
        results.linkedin = { success: false, error: error.message };
      }
    }

    // Twitter posting
    if (dayConfig.twitter) {
      try {
        const content = this.generateContent('twitter', dayConfig.twitter);
        const result = await this.twitter.postTweet(content);
        results.twitter = { success: true, data: result };
      } catch (error) {
        results.twitter = { success: false, error: error.message };
      }
    }

    // Reddit posting
    if (dayConfig.reddit) {
      try {
        const content = this.generateContent('reddit', dayConfig.reddit);
        const subreddit = this.getSubredditForContent(dayConfig.reddit);
        const result = await this.reddit.postToSubreddit(subreddit, content.title, content.text);
        results.reddit = { success: true, data: result };
      } catch (error) {
        results.reddit = { success: false, error: error.message };
      }
    }

    console.log('📊 Daily posting results:', results);
    return results;
  }

  // Generate content for platform
  generateContent(platform, postType) {
    const template = this.templates[platform][postType];
    if (!template) {
      throw new Error(`No template found for ${platform} ${postType}`);
    }

    const url = this.getBlogPostUrl(postType);
    return template.replace('{url}', url);
  }

  // Get blog post URL
  getBlogPostUrl(postType) {
    const urlMap = {
      'API Integration Guide post': 'https://client-g75jef1ib-byronmccluney.vercel.app/blog/api-integration-guide-2024',
      'Top 10 APIs for Startups': 'https://client-g75jef1ib-byronmccluney.vercel.app/blog/top-10-apis-startup-should-know',
      'API Security post': 'https://client-g75jef1ib-byronmccluney.vercel.app/blog/api-security-best-practices'
    };

    return urlMap[postType] || '';
  }

  // Get subreddit for content
  getSubredditForContent(content) {
    if (content.includes('API Integration')) return 'webdev';
    if (content.includes('Top 10 APIs')) return 'startups';
    if (content.includes('API Security')) return 'programming';
    return 'webdev';
  }

  // Test all platforms
  async testAllPlatforms() {
    console.log('🧪 Testing all platforms...');
    
    const results = {};
    
    // Test LinkedIn
    try {
      const linkedinContent = this.generateContent('linkedin', 'API Integration Guide post');
      const linkedinResult = await this.linkedin.postToLinkedIn(linkedinContent);
      results.linkedin = { success: true, data: linkedinResult };
    } catch (error) {
      results.linkedin = { success: false, error: error.message };
    }

    // Test Twitter
    try {
      const twitterContent = this.generateContent('twitter', 'Thread starter');
      const twitterResult = await this.twitter.postTweet(twitterContent);
      results.twitter = { success: true, data: twitterResult };
    } catch (error) {
      results.twitter = { success: false, error: error.message };
    }

    // Test Reddit
    try {
      const redditContent = this.generateContent('reddit', 'r/webdev post');
      const subreddit = this.getSubredditForContent('r/webdev post');
      const redditResult = await this.reddit.postToSubreddit(subreddit, redditContent.title, redditContent.text);
      results.reddit = { success: true, data: redditResult };
    } catch (error) {
      results.reddit = { success: false, error: error.message };
    }

    console.log('📊 Platform test results:', results);
    return results;
  }
}

// CLI usage
if (require.main === module) {
  const automation = new MasterAutomation();
  const command = process.argv[2];
  const day = process.argv[3] || new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  switch (command) {
    case 'test':
      automation.testAllPlatforms()
        .then(results => {
          console.log('✅ Platform testing completed');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Platform testing failed:', error);
          process.exit(1);
        });
      break;
      
    case 'post':
      automation.executeDailyPosting(day)
        .then(results => {
          console.log('✅ Daily posting completed');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Daily posting failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node master-automation.js [test|post] [day]');
      console.log('Examples:');
      console.log('  node master-automation.js test');
      console.log('  node master-automation.js post monday');
      process.exit(1);
  }
}

module.exports = MasterAutomation;
