/**
 * Business Projects Routes
 * Routes for managing business projects that use APIs
 */

const express = require('express');
const router = express.Router();
const businessProjectService = require('../services/businessProjectService');

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = businessProjectService.getAllProjects();
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get projects'
    });
  }
});

// Get project by ID
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = businessProjectService.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get project'
    });
  }
});

// Create new project
router.post('/', async (req, res) => {
  try {
    const projectData = req.body;
    
    if (!projectData.name) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }
    
    const project = businessProjectService.createProject(projectData);
    
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    });
  }
});

// Update project
router.put('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const updates = req.body;
    
    const project = businessProjectService.updateProject(projectId, updates);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update project'
    });
  }
});

// Delete project
router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const success = businessProjectService.deleteProject(projectId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    });
  }
});

// Add API to project
router.post('/:projectId/apis', async (req, res) => {
  try {
    const { projectId } = req.params;
    const apiData = req.body;
    
    if (!apiData.id || !apiData.name) {
      return res.status(400).json({
        success: false,
        error: 'API ID and name are required'
      });
    }
    
    const project = businessProjectService.addApiToProject(projectId, apiData);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add API to project'
    });
  }
});

// Track API usage
router.post('/:projectId/apis/:apiId/usage', async (req, res) => {
  try {
    const { projectId, apiId } = req.params;
    const usageData = req.body;
    
    businessProjectService.trackApiUsage(projectId, apiId, usageData);
    
    res.json({
      success: true,
      message: 'API usage tracked'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to track API usage'
    });
  }
});

// Update project revenue
router.post('/:projectId/revenue', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { amount, period } = req.body;
    
    if (typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a number'
      });
    }
    
    businessProjectService.updateRevenue(projectId, amount, period);
    
    res.json({
      success: true,
      message: 'Revenue updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update revenue'
    });
  }
});

// Get project analytics
router.get('/:projectId/analytics', async (req, res) => {
  try {
    const { projectId } = req.params;
    const analytics = businessProjectService.getProjectAnalytics(projectId);
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get project analytics'
    });
  }
});

// Get revenue projections
router.get('/:projectId/revenue/projections', async (req, res) => {
  try {
    const { projectId } = req.params;
    const projections = businessProjectService.getRevenueProjections(projectId);
    
    if (!projections) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: projections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get revenue projections'
    });
  }
});

// Get projects by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const projects = businessProjectService.getProjectsByCategory(category);
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get projects by category'
    });
  }
});

// Get projects by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const projects = businessProjectService.getProjectsByStatus(status);
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get projects by status'
    });
  }
});

// Get business dashboard data
router.get('/dashboard/overview', async (req, res) => {
  try {
    const dashboardData = businessProjectService.getDashboardData();
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data'
    });
  }
});

module.exports = router;
