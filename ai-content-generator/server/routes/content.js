const express = require('express');
const OpenAI = require('openai');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Content = require('../models/Content');

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate blog post
router.post('/blog-post', auth, async (req, res) => {
  try {
    const { topic, tone, length, keywords } = req.body;
    const user = await User.findById(req.user.id);

    // Check user's subscription and usage limits
    if (!user.subscription || user.subscription.status !== 'active') {
      return res.status(403).json({ error: 'Active subscription required' });
    }

    const usageLimit = user.subscription.plan === 'premium' ? 100 : 
                      user.subscription.plan === 'pro' ? 50 : 10;
    
    if (user.usageCount >= usageLimit) {
      return res.status(403).json({ error: 'Usage limit reached. Upgrade your plan.' });
    }

    const prompt = `Write a ${tone} blog post about "${topic}" with approximately ${length} words. 
    Include these keywords naturally: ${keywords.join(', ')}. 
    Structure: Introduction, 3-4 main points, conclusion. 
    Make it engaging and SEO-friendly.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.7
    });

    const content = completion.choices[0].message.content;

    // Save content to database
    const newContent = new Content({
      userId: req.user.id,
      type: 'blog-post',
      topic,
      content,
      metadata: { tone, length, keywords }
    });
    await newContent.save();

    // Update user usage count
    user.usageCount += 1;
    await user.save();

    res.json({
      content,
      usageCount: user.usageCount,
      usageLimit
    });

  } catch (error) {
    console.error('Blog post generation error:', error);
    res.status(500).json({ error: 'Failed to generate blog post' });
  }
});

// Generate social media content
router.post('/social-media', auth, async (req, res) => {
  try {
    const { platform, topic, tone, postType } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.subscription || user.subscription.status !== 'active') {
      return res.status(403).json({ error: 'Active subscription required' });
    }

    const platformPrompts = {
      'instagram': 'Create an Instagram post with hashtags and emojis',
      'twitter': 'Create a Twitter thread (3-5 tweets)',
      'linkedin': 'Create a professional LinkedIn post',
      'facebook': 'Create an engaging Facebook post'
    };

    const prompt = `${platformPrompts[platform]} about "${topic}" in a ${tone} tone. 
    Post type: ${postType}. Make it viral-worthy and engaging.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.8
    });

    const content = completion.choices[0].message.content;

    // Save content
    const newContent = new Content({
      userId: req.user.id,
      type: 'social-media',
      topic,
      content,
      metadata: { platform, tone, postType }
    });
    await newContent.save();

    // Update usage
    user.usageCount += 1;
    await user.save();

    res.json({ content, usageCount: user.usageCount });

  } catch (error) {
    console.error('Social media generation error:', error);
    res.status(500).json({ error: 'Failed to generate social media content' });
  }
});

// Generate marketing copy
router.post('/marketing-copy', auth, async (req, res) => {
  try {
    const { product, targetAudience, copyType, tone } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.subscription || user.subscription.status !== 'active') {
      return res.status(403).json({ error: 'Active subscription required' });
    }

    const copyTypes = {
      'email': 'Create a compelling email marketing copy',
      'ad': 'Create a persuasive ad copy for social media',
      'landing': 'Create a landing page copy',
      'product': 'Create product description copy'
    };

    const prompt = `${copyTypes[copyType]} for "${product}" targeting ${targetAudience} in a ${tone} tone. 
    Focus on benefits, include a call-to-action, and make it conversion-focused.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.7
    });

    const content = completion.choices[0].message.content;

    // Save content
    const newContent = new Content({
      userId: req.user.id,
      type: 'marketing-copy',
      topic: product,
      content,
      metadata: { targetAudience, copyType, tone }
    });
    await newContent.save();

    // Update usage
    user.usageCount += 1;
    await user.save();

    res.json({ content, usageCount: user.usageCount });

  } catch (error) {
    console.error('Marketing copy generation error:', error);
    res.status(500).json({ error: 'Failed to generate marketing copy' });
  }
});

// Get user's content history
router.get('/history', auth, async (req, res) => {
  try {
    const content = await Content.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(content);
  } catch (error) {
    console.error('Content history error:', error);
    res.status(500).json({ error: 'Failed to fetch content history' });
  }
});

// Delete content
router.delete('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Content deletion error:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

module.exports = router; 