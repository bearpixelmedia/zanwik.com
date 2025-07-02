const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use.' });
      }
      updates.email = email;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile.' });
  }
});

// Get usage statistics
router.get('/usage', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      usageCount: user.usageCount,
      usageLimit: user.getUsageLimit(),
      canGenerate: user.canGenerateContent(),
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Reset usage count (for testing/admin purposes)
router.post('/reset-usage', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { usageCount: 0 },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Usage count reset successfully.',
      usageCount: user.usageCount
    });
  } catch (error) {
    console.error('Reset usage error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router; 