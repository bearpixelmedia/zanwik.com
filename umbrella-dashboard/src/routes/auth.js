const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authRateLimiter, requireRole } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Register new user
router.post('/register', authRateLimiter, async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }
    
    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role: role || 'viewer'
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    // Update last login
    await user.updateLastLogin(req.ip, req.get('User-Agent'));
    
    logger.logUserAction(user._id, 'register', { email });
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    logger.logError(error, { action: 'register', email: req.body.email });
    res.status(500).json({ message: 'Registration failed.' });
  }
});

// Login user
router.post('/login', authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      await logger.logSecurityEvent('failed_login', { email, ip: req.ip });
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      await logger.logSecurityEvent('login_attempt_deactivated_account', { email, ip: req.ip });
      return res.status(401).json({ message: 'Account is deactivated.' });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.recordFailedLogin(req.ip, req.get('User-Agent'));
      await logger.logSecurityEvent('failed_login', { email, ip: req.ip });
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    // Update last login
    await user.updateLastLogin(req.ip, req.get('User-Agent'));
    
    logger.logUserAction(user._id, 'login', { email });
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        preferences: user.preferences
      }
    });
  } catch (error) {
    logger.logError(error, { action: 'login', email: req.body.email });
    res.status(500).json({ message: 'Login failed.' });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        avatar: user.avatar,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        permissions: user.permissions
      }
    });
  } catch (error) {
    logger.logError(error, { action: 'get_profile', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get profile.' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { firstName, lastName, avatar, preferences } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    
    await user.save();
    
    logger.logUserAction(user._id, 'update_profile');
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        preferences: user.preferences
      }
    });
  } catch (error) {
    logger.logError(error, { action: 'update_profile', userId: req.user.id });
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    logger.logUserAction(user._id, 'change_password');
    
    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    logger.logError(error, { action: 'change_password', userId: req.user.id });
    res.status(500).json({ message: 'Failed to change password.' });
  }
});

// Generate API key
router.post('/api-keys', async (req, res) => {
  try {
    const { name, permissions } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    const apiKey = await user.generateApiKey(name, permissions);
    
    logger.logUserAction(user._id, 'generate_api_key', { name });
    
    res.json({
      message: 'API key generated successfully',
      apiKey,
      name,
      permissions
    });
  } catch (error) {
    logger.logError(error, { action: 'generate_api_key', userId: req.user.id });
    res.status(500).json({ message: 'Failed to generate API key.' });
  }
});

// Get user's API keys
router.get('/api-keys', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('apiKeys');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Don't return the actual keys, just metadata
    const apiKeys = user.apiKeys.map(key => ({
      id: key._id,
      name: key.name,
      permissions: key.permissions,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
      isActive: key.isActive
    }));
    
    res.json({ apiKeys });
  } catch (error) {
    logger.logError(error, { action: 'get_api_keys', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get API keys.' });
  }
});

// Revoke API key
router.delete('/api-keys/:keyId', async (req, res) => {
  try {
    const { keyId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    await user.revokeApiKey(keyId);
    
    logger.logUserAction(user._id, 'revoke_api_key', { keyId });
    
    res.json({ message: 'API key revoked successfully.' });
  } catch (error) {
    logger.logError(error, { action: 'revoke_api_key', userId: req.user.id });
    res.status(500).json({ message: 'Failed to revoke API key.' });
  }
});

// Get login history
router.get('/login-history', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('loginHistory');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json({ loginHistory: user.loginHistory });
  } catch (error) {
    logger.logError(error, { action: 'get_login_history', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get login history.' });
  }
});

// Admin routes
router.get('/users', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.logError(error, { action: 'get_users', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get users.' });
  }
});

// Update user (admin only)
router.put('/users/:userId', requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Update allowed fields
    const allowedFields = ['firstName', 'lastName', 'role', 'isActive', 'isVerified', 'permissions'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    });
    
    await user.save();
    
    logger.logUserAction(req.user.id, 'update_user', { targetUserId: userId });
    
    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    logger.logError(error, { action: 'update_user', userId: req.user.id });
    res.status(500).json({ message: 'Failed to update user.' });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Don't allow admin to delete themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }
    
    await User.findByIdAndDelete(userId);
    
    logger.logUserAction(req.user.id, 'delete_user', { targetUserId: userId });
    
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    logger.logError(error, { action: 'delete_user', userId: req.user.id });
    res.status(500).json({ message: 'Failed to delete user.' });
  }
});

module.exports = router; 