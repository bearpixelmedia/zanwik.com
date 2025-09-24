#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

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
      if (!this.bearerToken) {
        throw new Error('Twitter bearer token not found. Please set TWITTER_BEARER_TOKEN in your .env file');
      }

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
      if (!this.bearerToken) {
        throw new Error('Twitter bearer token not found. Please set TWITTER_BEARER_TOKEN in your .env file');
      }

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
      if (!this.bearerToken) {
        throw new Error('Twitter bearer token not found. Please set TWITTER_BEARER_TOKEN in your .env file');
      }

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

// CLI usage
if (require.main === module) {
  const twitter = new TwitterAPI();
  
  // Test posting
  const testContent = `🧵 Just published a comprehensive API integration guide for 2024

Perfect for developers building modern applications. Covers authentication, error handling, testing, and best practices.

Thread with key insights 👇

https://client-g75jef1ib-byronmccluney.vercel.app/blog/api-integration-guide-2024

#API #WebDev #JavaScript #Tech`;

  twitter.postTweet(testContent)
    .then(result => {
      console.log('✅ Twitter test post successful');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Twitter test post failed:', error.message);
      process.exit(1);
    });
}

module.exports = TwitterAPI;
