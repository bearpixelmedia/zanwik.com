const express = require('express');
const Project = require('../models/Project');
const { requirePermission } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all projects with pagination and filtering
router.get('/', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { userId: req.user.id };
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const projects = await Project.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    logger.error('Error fetching project:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const { name, description, category, status = 'planning', revenue = 0, users = 0 } = req.body;
    
    const project = new Project({
      userId: req.user.id,
      name,
      description,
      category,
      status,
      revenue,
      users,
      created: new Date(),
      lastUpdated: new Date()
    });
    
    await project.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${req.user.id}`).emit('project-created', project);
    
    res.status(201).json(project);
  } catch (error) {
    logger.error('Error creating project:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const { name, description, category, status, revenue, users } = req.body;
    
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        name,
        description,
        category,
        status,
        revenue,
        users,
        lastUpdated: new Date()
      },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${req.user.id}`).emit('project-updated', project);
    
    res.json(project);
  } catch (error) {
    logger.error('Error updating project:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const project = await Project.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${req.user.id}`).emit('project-deleted', { id: req.params.id });
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    logger.error('Error deleting project:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

// Deploy project
router.post('/:id/deploy', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
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
    const project = await Project.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Mock analytics data - in real app, this would come from analytics service
    const analytics = {
      revenue: {
        current: project.revenue,
        growth: Math.random() * 20 - 5, // Random growth between -5% and 15%
        trend: 'up'
      },
      users: {
        current: project.users,
        growth: Math.random() * 30 - 10,
        trend: 'up'
      },
      performance: {
        uptime: 99.5 + Math.random() * 0.5,
        responseTime: 200 + Math.random() * 100,
        errorRate: Math.random() * 2
      }
    };
    
    res.json(analytics);
  } catch (error) {
    logger.error('Error fetching project analytics:', error);
    res.status(500).json({ message: 'Failed to fetch project analytics' });
  }
});

// Get project categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Project.distinct('category', { userId: req.user.id });
    res.json(categories);
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Get project statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Project.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          totalRevenue: { $sum: '$revenue' },
          totalUsers: { $sum: '$users' },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          developmentProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'development'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalProjects: 0,
      totalRevenue: 0,
      totalUsers: 0,
      activeProjects: 0,
      developmentProjects: 0
    };
    
    res.json(result);
  } catch (error) {
    logger.error('Error fetching project stats:', error);
    res.status(500).json({ message: 'Failed to fetch project statistics' });
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

module.exports = router; 