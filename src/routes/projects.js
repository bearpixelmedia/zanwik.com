const express = require('express');
const Project = require('../models/Project');
const { requirePermission } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, health, type, search } = req.query;
    
    const query = {
      $or: [
        { owner: req.user.id },
        { 'team.user': req.user.id }
      ]
    };
    
    if (status) query.status = status;
    if (health) query.health = health;
    if (type) query.type = type;
    if (search) {
      query.$and = [{
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      }];
    }
    
    const projects = await Project.find(query)
      .populate('owner', 'firstName lastName email')
      .populate('team.user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Project.countDocuments(query);
    
    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    logger.logError(error, { action: 'get_projects', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get projects.' });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'firstName lastName email')
      .populate('team.user', 'firstName lastName email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    
    // Check permissions
    if (!project.hasPermission(req.user.id, 'read')) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    res.json({ project });
  } catch (error) {
    logger.logError(error, { action: 'get_project', userId: req.user.id, projectId: req.params.id });
    res.status(500).json({ message: 'Failed to get project.' });
  }
});

// Create new project
router.post('/', requirePermission('projects', 'create'), async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      owner: req.user.id
    };
    
    const project = new Project(projectData);
    await project.save();
    
    // Populate owner and team data
    await project.populate('owner', 'firstName lastName email');
    
    logger.logProjectEvent(project._id, 'created', { userId: req.user.id });
    
    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    logger.logError(error, { action: 'create_project', userId: req.user.id });
    res.status(500).json({ message: 'Failed to create project.' });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    
    if (!project.hasPermission(req.user.id, 'write')) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    // Update project fields
    Object.assign(project, req.body);
    await project.save();
    
    // Populate owner and team data
    await project.populate('owner', 'firstName lastName email');
    await project.populate('team.user', 'firstName lastName email');
    
    logger.logProjectEvent(project._id, 'updated', { userId: req.user.id });
    
    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    logger.logError(error, { action: 'update_project', userId: req.user.id, projectId: req.params.id });
    res.status(500).json({ message: 'Failed to update project.' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    
    if (!project.hasPermission(req.user.id, 'admin')) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    await Project.findByIdAndDelete(req.params.id);
    
    logger.logProjectEvent(project._id, 'deleted', { userId: req.user.id });
    
    res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    logger.logError(error, { action: 'delete_project', userId: req.user.id, projectId: req.params.id });
    res.status(500).json({ message: 'Failed to delete project.' });
  }
});

// Deploy project
router.post('/:id/deploy', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    
    if (!project.hasPermission(req.user.id, 'deploy')) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    const deploymentService = req.app.get('deploymentService');
    const result = await deploymentService.deployProject(project._id, req.body, req.user.id);
    
    logger.logProjectEvent(project._id, 'deployment_started', { 
      userId: req.user.id, 
      deploymentConfig: req.body 
    });
    
    res.json({
      message: 'Deployment started',
      result
    });
  } catch (error) {
    logger.logError(error, { action: 'deploy_project', userId: req.user.id, projectId: req.params.id });
    res.status(500).json({ message: 'Failed to deploy project.' });
  }
});

// Restart project
router.post('/:id/restart', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    
    if (!project.hasPermission(req.user.id, 'deploy')) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    const deploymentService = req.app.get('deploymentService');
    const result = await deploymentService.restartProject(project._id, req.user.id);
    
    logger.logProjectEvent(project._id, 'restarted', { userId: req.user.id });
    
    res.json({
      message: 'Project restarted successfully',
      result
    });
  } catch (error) {
    logger.logError(error, { action: 'restart_project', userId: req.user.id, projectId: req.params.id });
    res.status(500).json({ message: 'Failed to restart project.' });
  }
});

// Get project logs
router.get('/:id/logs', async (req, res) => {
  try {
    const { lines = 100 } = req.query;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    
    if (!project.hasPermission(req.user.id, 'read')) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    const projectService = req.app.get('projectService');
    const logs = await projectService.getProjectLogs(project._id, parseInt(lines));
    
    res.json({ logs });
  } catch (error) {
    logger.logError(error, { action: 'get_project_logs', userId: req.user.id, projectId: req.params.id });
    res.status(500).json({ message: 'Failed to get project logs.' });
  }
});

// Get project analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    
    if (!project.hasPermission(req.user.id, 'read')) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    const analyticsService = req.app.get('analyticsService');
    const analytics = await analyticsService.getProjectAnalytics(project._id, period);
    
    res.json({ analytics });
  } catch (error) {
    logger.logError(error, { action: 'get_project_analytics', userId: req.user.id, projectId: req.params.id });
    res.status(500).json({ message: 'Failed to get project analytics.' });
  }
});

// Add team member
router.post('/:id/team', async (req, res) => {
  try {
    const { userId, role, permissions } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    
    if (!project.hasPermission(req.user.id, 'admin')) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    await project.addTeamMember(userId, role, permissions);
    
    // Populate team data
    await project.populate('team.user', 'firstName lastName email');
    
    logger.logProjectEvent(project._id, 'team_member_added', { 
      userId: req.user.id, 
      addedUserId: userId, 
      role 
    });
    
    res.json({
      message: 'Team member added successfully',
      project
    });
  } catch (error) {
    logger.logError(error, { action: 'add_team_member', userId: req.user.id, projectId: req.params.id });
    res.status(500).json({ message: 'Failed to add team member.' });
  }
});

// Remove team member
router.delete('/:id/team/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    
    if (!project.hasPermission(req.user.id, 'admin')) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    await project.removeTeamMember(userId);
    
    // Populate team data
    await project.populate('team.user', 'firstName lastName email');
    
    logger.logProjectEvent(project._id, 'team_member_removed', { 
      userId: req.user.id, 
      removedUserId: userId 
    });
    
    res.json({
      message: 'Team member removed successfully',
      project
    });
  } catch (error) {
    logger.logError(error, { action: 'remove_team_member', userId: req.user.id, projectId: req.params.id });
    res.status(500).json({ message: 'Failed to remove team member.' });
  }
});

// Get project statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const projectService = req.app.get('projectService');
    const stats = await projectService.getProjectStatistics();
    
    res.json({ stats });
  } catch (error) {
    logger.logError(error, { action: 'get_project_stats', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get project statistics.' });
  }
});

// Get recent alerts
router.get('/:id/alerts', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    
    if (!project.hasPermission(req.user.id, 'read')) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    const projectService = req.app.get('projectService');
    const alerts = await projectService.getRecentAlerts(project._id, parseInt(limit));
    
    res.json({ alerts });
  } catch (error) {
    logger.logError(error, { action: 'get_project_alerts', userId: req.user.id, projectId: req.params.id });
    res.status(500).json({ message: 'Failed to get project alerts.' });
  }
});

module.exports = router; 