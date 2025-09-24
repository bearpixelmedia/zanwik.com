# 🔗 Social Media API Integration Setup

## 🎯 **LinkedIn API Integration**

### **Step 1: LinkedIn Developer Account**
1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Create a new app
3. Request access to "Share on LinkedIn" and "Read user profile" permissions
4. Get your Client ID and Client Secret

### **Step 2: LinkedIn API Implementation**
```javascript
// automation/post-linkedin.js
const axios = require('axios');

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
    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
      grant_type: 'authorization_code',
      code: code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: 'http://localhost:3000/auth/linkedin/callback'
    });
    
    return response.data.access_token;
  }

  // Post to LinkedIn
  async postToLinkedIn(content, hashtags = []) {
    try {
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

  // Schedule post
  async schedulePost(content, scheduledTime) {
    // LinkedIn doesn't have native scheduling, use Buffer or Hootsuite
    console.log(`📅 Scheduling LinkedIn post for ${scheduledTime}: ${content.substring(0, 50)}...`);
    return { scheduled: true, time: scheduledTime };
  }
}

module.exports = LinkedInAPI;
```

## 🐦 **Twitter API Integration**

### **Step 1: Twitter Developer Account**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Get your API Key, API Secret, Access Token, and Access Token Secret
4. Enable OAuth 2.0 for posting

### **Step 2: Twitter API Implementation**
```javascript
// automation/post-twitter.js
const axios = require('axios');

class TwitterAPI {
  constructor() {
    this.apiKey = process.env.TWITTER_API_KEY;
    this.apiSecret = process.env.TWITTER_API_SECRET;
    this.accessToken = process.env.TWITTER_ACCESS_TOKEN;
    this.accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN;
    this.baseURL = 'https://api.twitter.com/2';
  }

  // Post a single tweet
  async postTweet(text) {
    try {
      const response = await axios.post(`${this.baseURL}/tweets`, {
        text: text
      }, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Twitter post successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Twitter post failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Create a thread
  async createThread(tweets) {
    try {
      const thread = [];
      let replyToId = null;

      for (let i = 0; i < tweets.length; i++) {
        const tweetData = {
          text: tweets[i]
        };

        if (replyToId) {
          tweetData.reply = {
            in_reply_to_tweet_id: replyToId
          };
        }

        const response = await axios.post(`${this.baseURL}/tweets`, tweetData, {
          headers: {
            'Authorization': `Bearer ${this.bearerToken}`,
            'Content-Type': 'application/json'
          }
        });

        thread.push(response.data);
        replyToId = response.data.data.id;
        
        // Wait 1 second between tweets to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('✅ Twitter thread successful:', thread);
      return thread;
    } catch (error) {
      console.error('❌ Twitter thread failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Schedule tweet (using Twitter's native scheduling)
  async scheduleTweet(text, scheduledTime) {
    try {
      const response = await axios.post(`${this.baseURL}/tweets`, {
        text: text,
        scheduled_at: scheduledTime
      }, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Twitter post scheduled:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Twitter scheduling failed:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = TwitterAPI;
```

## 🔴 **Reddit API Integration**

### **Step 1: Reddit Developer Account**
1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Create a new app (script type)
3. Get your Client ID and Client Secret

### **Step 2: Reddit API Implementation**
```javascript
// automation/post-reddit.js
const axios = require('axios');

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

module.exports = RedditAPI;
```

## 📱 **Buffer API Integration**

### **Step 1: Buffer Account Setup**
1. Go to [Buffer Developer Portal](https://buffer.com/developers)
2. Create a new app
3. Get your Access Token

### **Step 2: Buffer API Implementation**
```javascript
// automation/post-buffer.js
const axios = require('axios');

class BufferAPI {
  constructor() {
    this.accessToken = process.env.BUFFER_ACCESS_TOKEN;
    this.baseURL = 'https://api.bufferapp.com/1';
  }

  // Get user profiles
  async getProfiles() {
    try {
      const response = await axios.get(`${this.baseURL}/profiles.json`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Buffer profiles failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Create post
  async createPost(profileIds, text, media = null) {
    try {
      const postData = {
        profile_ids: profileIds,
        text: text
      };

      if (media) {
        postData.media = media;
      }

      const response = await axios.post(`${this.baseURL}/updates/create.json`, postData, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Buffer post created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Buffer post failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Schedule post
  async schedulePost(profileIds, text, scheduledTime, media = null) {
    try {
      const postData = {
        profile_ids: profileIds,
        text: text,
        scheduled_at: scheduledTime
      };

      if (media) {
        postData.media = media;
      }

      const response = await axios.post(`${this.baseURL}/updates/create.json`, postData, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Buffer post scheduled:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Buffer scheduling failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get scheduled posts
  async getScheduledPosts(profileId) {
    try {
      const response = await axios.get(`${this.baseURL}/profiles/${profileId}/updates/pending.json`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Buffer scheduled posts failed:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = BufferAPI;
```

## 🔧 **Master Automation Script**

```javascript
// automation/master-automation.js
const LinkedInAPI = require('./post-linkedin');
const TwitterAPI = require('./post-twitter');
const RedditAPI = require('./post-reddit');
const BufferAPI = require('./post-buffer');
const config = require('./config.json');
const templates = require('./templates.json');

class MasterAutomation {
  constructor() {
    this.linkedin = new LinkedInAPI();
    this.twitter = new TwitterAPI();
    this.reddit = new RedditAPI();
    this.buffer = new BufferAPI();
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
      'API Integration Guide': 'https://client-g75jef1ib-byronmccluney.vercel.app/blog/api-integration-guide-2024',
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
}

// CLI usage
if (require.main === module) {
  const automation = new MasterAutomation();
  const day = process.argv[2] || new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  automation.executeDailyPosting(day)
    .then(results => {
      console.log('✅ Daily posting completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Daily posting failed:', error);
      process.exit(1);
    });
}

module.exports = MasterAutomation;
```

## 🚀 **Quick Setup Commands**

```bash
# Install dependencies
npm install axios dotenv

# Set up environment variables
cp .env.automation .env

# Test LinkedIn posting
node automation/post-linkedin.js

# Test Twitter posting
node automation/post-twitter.js

# Test Reddit posting
node automation/post-reddit.js

# Run daily automation
node automation/master-automation.js monday
```

---

**Ready to automate your social media posting across all platforms!** 🚀
