const express = require('express');
const User = require('../models/User');
const { requireRole, requirePermission } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all users (admin/manager only)
router.get('/', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, isActive } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
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
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    logger.logError(error, { action: 'get_users', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get users.' });
  }
});

// Get user by ID
router.get('/:userId', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json({ user });
  } catch (error) {
    logger.logError(error, { action: 'get_user', userId: req.user.id, targetUserId: req.params.userId });
    res.status(500).json({ message: 'Failed to get user.' });
  }
});

// Create new user (admin only)
router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, permissions } = req.body;
    
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
      role: role || 'viewer',
      permissions: permissions || {},
      isVerified: true
    });
    
    await user.save();
    
    logger.logUserAction(req.user.id, 'create_user', { targetUserId: user._id, email });
    
    res.status(201).json({
      message: 'User created successfully',
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
    logger.logError(error, { action: 'create_user', userId: req.user.id });
    res.status(500).json({ message: 'Failed to create user.' });
  }
});

// Update user (admin only)
router.put('/:userId', requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Don't allow admin to deactivate themselves
    if (userId === req.user.id && updates.isActive === false) {
      return res.status(400).json({ message: 'Cannot deactivate your own account.' });
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
    logger.logError(error, { action: 'update_user', userId: req.user.id, targetUserId: req.params.userId });
    res.status(500).json({ message: 'Failed to update user.' });
  }
});

// Delete user (admin only)
router.delete('/:userId', requireRole('admin'), async (req, res) => {
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
    logger.logError(error, { action: 'delete_user', userId: req.user.id, targetUserId: req.params.userId });
    res.status(500).json({ message: 'Failed to delete user.' });
  }
});

// Get user statistics
router.get('/stats/overview', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const stats = await User.getStatistics();
    
    res.json({ stats: stats[0] || {
      totalUsers: 0,
      activeUsers: 0,
      verifiedUsers: 0,
      adminUsers: 0,
      managerUsers: 0,
      developerUsers: 0,
      viewerUsers: 0
    }});
  } catch (error) {
    logger.logError(error, { action: 'get_user_stats', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get user statistics.' });
  }
});

// Get user activity
router.get('/:userId/activity', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('loginHistory');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json({ activity: user.loginHistory });
  } catch (error) {
    logger.logError(error, { action: 'get_user_activity', userId: req.user.id, targetUserId: req.params.userId });
    res.status(500).json({ message: 'Failed to get user activity.' });
  }
});

// Get user permissions
router.get('/:userId/permissions', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('permissions role');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json({ 
      permissions: user.permissions,
      role: user.role
    });
  } catch (error) {
    logger.logError(error, { action: 'get_user_permissions', userId: req.user.id, targetUserId: req.params.userId });
    res.status(500).json({ message: 'Failed to get user permissions.' });
  }
});

// Update user permissions
router.put('/:userId/permissions', requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    user.permissions = permissions;
    await user.save();
    
    logger.logUserAction(req.user.id, 'update_user_permissions', { targetUserId: userId });
    
    res.json({
      message: 'User permissions updated successfully',
      permissions: user.permissions
    });
  } catch (error) {
    logger.logError(error, { action: 'update_user_permissions', userId: req.user.id, targetUserId: req.params.userId });
    res.status(500).json({ message: 'Failed to update user permissions.' });
  }
});

// Get user API keys
router.get('/:userId/api-keys', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('apiKeys');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
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
    logger.logError(error, { action: 'get_user_api_keys', userId: req.user.id, targetUserId: req.params.userId });
    res.status(500).json({ message: 'Failed to get user API keys.' });
  }
});

// Revoke user API key
router.delete('/:userId/api-keys/:keyId', requireRole('admin'), async (req, res) => {
  try {
    const { userId, keyId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    await user.revokeApiKey(keyId);
    
    logger.logUserAction(req.user.id, 'revoke_user_api_key', { targetUserId: userId, keyId });
    
    res.json({ message: 'API key revoked successfully.' });
  } catch (error) {
    logger.logError(error, { action: 'revoke_user_api_key', userId: req.user.id, targetUserId: req.params.userId });
    res.status(500).json({ message: 'Failed to revoke API key.' });
  }
});

// Get user preferences
router.get('/:userId/preferences', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('preferences');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json({ preferences: user.preferences });
  } catch (error) {
    logger.logError(error, { action: 'get_user_preferences', userId: req.user.id, targetUserId: req.params.userId });
    res.status(500).json({ message: 'Failed to get user preferences.' });
  }
});

// Update user preferences
router.put('/:userId/preferences', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    user.preferences = { ...user.preferences, ...preferences };
    await user.save();
    
    logger.logUserAction(req.user.id, 'update_user_preferences', { targetUserId: userId });
    
    res.json({
      message: 'User preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    logger.logError(error, { action: 'update_user_preferences', userId: req.user.id, targetUserId: req.params.userId });
    res.status(500).json({ message: 'Failed to update user preferences.' });
  }
});

// Get team members for a project
router.get('/team/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const Project = require('../models/Project');
    
    const project = await Project.findById(projectId)
      .populate('team.user', 'firstName lastName email role isActive')
      .populate('owner', 'firstName lastName email role');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    
    // Check if user has access to this project
    if (!project.hasPermission(req.user.id, 'read')) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    const team = [
      {
        user: project.owner,
        role: 'owner',
        permissions: ['read', 'write', 'deploy', 'admin']
      },
      ...project.team
    ];
    
    res.json({ team });
  } catch (error) {
    logger.logError(error, { action: 'get_project_team', userId: req.user.id, projectId: req.params.projectId });
    res.status(500).json({ message: 'Failed to get project team.' });
  }
});

// Add team member to project
router.post('/team/:projectId', requirePermission('projects', 'admin'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role, permissions } = req.body;
    
    const Project = require('../models/Project');
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    
    await project.addTeamMember(userId, role, permissions);
    
    // Populate team data
    await project.populate('team.user', 'firstName lastName email role');
    
    logger.logUserAction(req.user.id, 'add_team_member', { projectId, targetUserId: userId, role });
    
    res.json({
      message: 'Team member added successfully',
      project
    });
  } catch (error) {
    logger.logError(error, { action: 'add_team_member', userId: req.user.id, projectId: req.params.projectId });
    res.status(500).json({ message: 'Failed to add team member.' });
  }
});

// Remove team member from project
router.delete('/team/:projectId/:userId', requirePermission('projects', 'admin'), async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    
    const Project = require('../models/Project');
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    
    await project.removeTeamMember(userId);
    
    // Populate team data
    await project.populate('team.user', 'firstName lastName email role');
    
    logger.logUserAction(req.user.id, 'remove_team_member', { projectId, targetUserId: userId });
    
    res.json({
      message: 'Team member removed successfully',
      project
    });
  } catch (error) {
    logger.logError(error, { action: 'remove_team_member', userId: req.user.id, projectId: req.params.projectId });
    res.status(500).json({ message: 'Failed to remove team member.' });
  }
});

// Bulk user operations
router.post('/bulk', requireRole('admin'), async (req, res) => {
  try {
    const { action, userIds, data } = req.body;
    
    let result;
    
    switch (action) {
      case 'activate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { isActive: true }
        );
        break;
      case 'deactivate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { isActive: false }
        );
        break;
      case 'delete':
        result = await User.deleteMany({ _id: { $in: userIds } });
        break;
      case 'update_role':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { role: data.role }
        );
        break;
      default:
        return res.status(400).json({ message: 'Invalid action.' });
    }
    
    logger.logUserAction(req.user.id, 'bulk_user_operation', { action, userIds, result });
    
    res.json({
      message: `Bulk operation '${action}' completed successfully`,
      result
    });
  } catch (error) {
    logger.logError(error, { action: 'bulk_user_operation', userId: req.user.id });
    res.status(500).json({ message: 'Failed to perform bulk operation.' });
  }
});

module.exports = router; 