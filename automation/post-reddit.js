#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

class RedditAPI {
  constructor() {
    this.clientId = process.env.REDDIT_CLIENT_ID;
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET;
    this.username = process.env.REDDIT_USERNAME;
    this.password = process.env.REDDIT_PASSWORD;
    this.userAgent = 'ZanwikBot/1.0';
    this.baseURL = 'https://oauth.reddit.com';
    this.accessToken = null;
  }

  // Get access token
  async getAccessToken() {
    try {
      if (!this.clientId || !this.clientSecret || !this.username || !this.password) {
        throw new Error('Reddit credentials not found. Please set REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, and REDDIT_PASSWORD in your .env file');
      }

      const response = await axios.post('https://www.reddit.com/api/v1/access_token', 
        new URLSearchParams({
          grant_type: 'password',
          username: this.username,
          password: this.password
        }), {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
            'User-Agent': this.userAgent,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('❌ Reddit auth failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Post to subreddit
  async postToSubreddit(subreddit, title, text, kind = 'self') {
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      const response = await axios.post(`${this.baseURL}/api/submit`, {
        sr: subreddit,
        kind: kind,
        title: title,
        text: text,
        api_type: 'json'
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'User-Agent': this.userAgent,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('✅ Reddit post successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Reddit post failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Post link to subreddit
  async postLinkToSubreddit(subreddit, title, url) {
    return this.postToSubreddit(subreddit, title, '', 'link');
  }

  // Get subreddit info
  async getSubredditInfo(subreddit) {
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      const response = await axios.get(`${this.baseURL}/r/${subreddit}/about`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'User-Agent': this.userAgent
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Reddit subreddit info failed:', error.response?.data || error.message);
      throw error;
    }
  }
}

// CLI usage
if (require.main === module) {
  const reddit = new RedditAPI();
  
  // Test posting
  const testTitle = 'Complete API Integration Guide for 2024 - Authentication, Error Handling, Testing';
  const testText = `Hey r/webdev! I just published a comprehensive guide on API integration that covers everything from authentication methods to security best practices.

The guide includes:
- OAuth 2.0 with PKCE implementation
- JWT token handling
- Error handling patterns
- Testing strategies
- Real code examples

I've been working with APIs for years and wanted to share everything I've learned. The guide is aimed at both beginners and experienced developers.

**Link:** https://client-g75jef1ib-byronmccluney.vercel.app/blog/api-integration-guide-2024

Would love to hear your thoughts and any additional tips you'd add!`;

  reddit.postToSubreddit('webdev', testTitle, testText)
    .then(result => {
      console.log('✅ Reddit test post successful');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Reddit test post failed:', error.message);
      process.exit(1);
    });
}

module.exports = RedditAPI;
