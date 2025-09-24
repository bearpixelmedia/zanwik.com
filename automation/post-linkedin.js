#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

class LinkedInAPI {
  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID;
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    this.baseURL = 'https://api.linkedin.com/v2';
  }

  // Get authorization URL
  getAuthURL() {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: 'http://localhost:3000/auth/linkedin/callback',
      scope: 'r_liteprofile r_emailaddress w_member_social',
      state: 'random_state_string'
    });
    
    return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  }

  // Exchange code for access token
  async getAccessToken(code) {
    try {
      const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
        grant_type: 'authorization_code',
        code: code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: 'http://localhost:3000/auth/linkedin/callback'
      });
      
      return response.data.access_token;
    } catch (error) {
      console.error('❌ LinkedIn token exchange failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Post to LinkedIn
  async postToLinkedIn(content, hashtags = []) {
    try {
      if (!this.accessToken) {
        throw new Error('LinkedIn access token not found. Please set LINKEDIN_ACCESS_TOKEN in your .env file');
      }

      // Get user profile
      const profileResponse = await axios.get(`${this.baseURL}/people/~`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      const personUrn = profileResponse.data.id;
      
      // Create post
      const postData = {
        author: `urn:li:person:${personUrn}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      const response = await axios.post(`${this.baseURL}/ugcPosts`, postData, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      console.log('✅ LinkedIn post successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ LinkedIn post failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Schedule post (LinkedIn doesn't have native scheduling)
  async schedulePost(content, scheduledTime) {
    console.log(`📅 LinkedIn scheduling not supported natively. Consider using Buffer or Hootsuite.`);
    console.log(`📝 Post content: ${content.substring(0, 100)}...`);
    console.log(`⏰ Scheduled for: ${scheduledTime}`);
    return { scheduled: false, reason: 'LinkedIn does not support native scheduling' };
  }
}

// CLI usage
if (require.main === module) {
  const linkedin = new LinkedInAPI();
  
  // Test posting
  const testContent = `🔧 Just published: "How to Integrate APIs in 2024: Complete Developer Guide"

This comprehensive 12-minute read covers:
✅ Authentication methods (OAuth 2.0, JWT, API Keys)
✅ Error handling best practices
✅ Testing strategies
✅ Real code examples you can use today

Perfect for developers, entrepreneurs, and anyone building modern applications.

Read the full guide: https://client-g75jef1ib-byronmccluney.vercel.app/blog/api-integration-guide-2024

#API #WebDevelopment #Tech #Entrepreneurship #Programming`;

  linkedin.postToLinkedIn(testContent)
    .then(result => {
      console.log('✅ LinkedIn test post successful');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ LinkedIn test post failed:', error.message);
      process.exit(1);
    });
}

module.exports = LinkedInAPI;
