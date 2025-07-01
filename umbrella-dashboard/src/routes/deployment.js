const express = require('express');
const { requirePermission } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Deploy project
router.post('/deploy/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const deploymentConfig = req.body;
    
    const deploymentService = req.app.get('deploymentService');
    const result = await deploymentService.deployProject(projectId, deploymentConfig, req.user.id);
    
    logger.logProjectEvent(projectId, 'deployment_started', { 
      userId: req.user.id, 
      deploymentConfig 
    });
    
    res.json({
      message: 'Deployment started successfully',
      deploymentId: result.deploymentId,
      status: result.status
    });
  } catch (error) {
    logger.logError(error, { action: 'deploy_project', userId: req.user.id, projectId: req.params.projectId });
    res.status(500).json({ message: 'Failed to deploy project.' });
  }
});

// Get deployment status
router.get('/status/:deploymentId', async (req, res) => {
  try {
    const { deploymentId } = req.params;
    const deploymentService = req.app.get('deploymentService');
    const status = await deploymentService.getDeploymentStatus(deploymentId);
    
    res.json({ status });
  } catch (error) {
    logger.logError(error, { action: 'get_deployment_status', userId: req.user.id, deploymentId });
    res.status(500).json({ message: 'Failed to get deployment status.' });
  }
});

// Get deployment history
router.get('/history/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const deploymentService = req.app.get('deploymentService');
    const history = await deploymentService.getDeploymentHistory(projectId, page, limit);
    
    res.json({ history });
  } catch (error) {
    logger.logError(error, { action: 'get_deployment_history', userId: req.user.id, projectId });
    res.status(500).json({ message: 'Failed to get deployment history.' });
  }
});

// Rollback deployment
router.post('/rollback/:deploymentId', async (req, res) => {
  try {
    const { deploymentId } = req.params;
    const deploymentService = req.app.get('deploymentService');
    const result = await deploymentService.rollbackDeployment(deploymentId, req.user.id);
    
    logger.logProjectEvent(result.projectId, 'deployment_rollback', { 
      userId: req.user.id, 
      deploymentId 
    });
    
    res.json({
      message: 'Rollback completed successfully',
      result
    });
  } catch (error) {
    logger.logError(error, { action: 'rollback_deployment', userId: req.user.id, deploymentId: req.params.deploymentId });
    res.status(500).json({ message: 'Failed to rollback deployment.' });
  }
});

// Cancel deployment
router.post('/cancel/:deploymentId', async (req, res) => {
  try {
    const { deploymentId } = req.params;
    const deploymentService = req.app.get('deploymentService');
    const result = await deploymentService.cancelDeployment(deploymentId, req.user.id);
    
    logger.logProjectEvent(result.projectId, 'deployment_cancelled', { 
      userId: req.user.id, 
      deploymentId 
    });
    
    res.json({
      message: 'Deployment cancelled successfully',
      result
    });
  } catch (error) {
    logger.logError(error, { action: 'cancel_deployment', userId: req.user.id, deploymentId: req.params.deploymentId });
    res.status(500).json({ message: 'Failed to cancel deployment.' });
  }
});

// Get deployment logs
router.get('/logs/:deploymentId', async (req, res) => {
  try {
    const { deploymentId } = req.params;
    const { lines = 100 } = req.query;
    
    const deploymentService = req.app.get('deploymentService');
    const logs = await deploymentService.getDeploymentLogs(deploymentId, lines);
    
    res.json({ logs });
  } catch (error) {
    logger.logError(error, { action: 'get_deployment_logs', userId: req.user.id, deploymentId: req.params.deploymentId });
    res.status(500).json({ message: 'Failed to get deployment logs.' });
  }
});

// Get deployment configuration
router.get('/config/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const deploymentService = req.app.get('deploymentService');
    const config = await deploymentService.getDeploymentConfig(projectId);
    
    res.json({ config });
  } catch (error) {
    logger.logError(error, { action: 'get_deployment_config', userId: req.user.id, projectId });
    res.status(500).json({ message: 'Failed to get deployment configuration.' });
  }
});

// Update deployment configuration
router.put('/config/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const config = req.body;
    
    const deploymentService = req.app.get('deploymentService');
    const updated = await deploymentService.updateDeploymentConfig(projectId, config, req.user.id);
    
    logger.logProjectEvent(projectId, 'deployment_config_updated', { 
      userId: req.user.id, 
      config 
    });
    
    res.json({
      message: 'Deployment configuration updated successfully',
      config: updated
    });
  } catch (error) {
    logger.logError(error, { action: 'update_deployment_config', userId: req.user.id, projectId });
    res.status(500).json({ message: 'Failed to update deployment configuration.' });
  }
});

// Get deployment environments
router.get('/environments', async (req, res) => {
  try {
    const deploymentService = req.app.get('deploymentService');
    const environments = await deploymentService.getDeploymentEnvironments();
    
    res.json({ environments });
  } catch (error) {
    logger.logError(error, { action: 'get_deployment_environments', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get deployment environments.' });
  }
});

// Create deployment environment
router.post('/environments', requirePermission('projects', 'deploy'), async (req, res) => {
  try {
    const environment = req.body;
    const deploymentService = req.app.get('deploymentService');
    const created = await deploymentService.createDeploymentEnvironment(environment, req.user.id);
    
    res.status(201).json({
      message: 'Deployment environment created successfully',
      environment: created
    });
  } catch (error) {
    logger.logError(error, { action: 'create_deployment_environment', userId: req.user.id });
    res.status(500).json({ message: 'Failed to create deployment environment.' });
  }
});

// Get deployment statistics
router.get('/stats', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const deploymentService = req.app.get('deploymentService');
    const stats = await deploymentService.getDeploymentStatistics(period);
    
    res.json({ stats });
  } catch (error) {
    logger.logError(error, { action: 'get_deployment_stats', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get deployment statistics.' });
  }
});

// Get deployment performance
router.get('/performance', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const deploymentService = req.app.get('deploymentService');
    const performance = await deploymentService.getDeploymentPerformance(period);
    
    res.json({ performance });
  } catch (error) {
    logger.logError(error, { action: 'get_deployment_performance', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get deployment performance.' });
  }
});

// Get deployment alerts
router.get('/alerts', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const deploymentService = req.app.get('deploymentService');
    const alerts = await deploymentService.getDeploymentAlerts(page, limit);
    
    res.json({ alerts });
  } catch (error) {
    logger.logError(error, { action: 'get_deployment_alerts', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get deployment alerts.' });
  }
});

// Get deployment templates
router.get('/templates', async (req, res) => {
  try {
    const deploymentService = req.app.get('deploymentService');
    const templates = await deploymentService.getDeploymentTemplates();
    
    res.json({ templates });
  } catch (error) {
    logger.logError(error, { action: 'get_deployment_templates', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get deployment templates.' });
  }
});

// Create deployment template
router.post('/templates', requirePermission('projects', 'deploy'), async (req, res) => {
  try {
    const template = req.body;
    const deploymentService = req.app.get('deploymentService');
    const created = await deploymentService.createDeploymentTemplate(template, req.user.id);
    
    res.status(201).json({
      message: 'Deployment template created successfully',
      template: created
    });
  } catch (error) {
    logger.logError(error, { action: 'create_deployment_template', userId: req.user.id });
    res.status(500).json({ message: 'Failed to create deployment template.' });
  }
});

// Get deployment health
router.get('/health', async (req, res) => {
  try {
    const deploymentService = req.app.get('deploymentService');
    const health = await deploymentService.getDeploymentHealth();
    
    res.json({ health });
  } catch (error) {
    logger.logError(error, { action: 'get_deployment_health', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get deployment health.' });
  }
});

// Get deployment costs
router.get('/costs', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const deploymentService = req.app.get('deploymentService');
    const costs = await deploymentService.getDeploymentCosts(period);
    
    res.json({ costs });
  } catch (error) {
    logger.logError(error, { action: 'get_deployment_costs', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get deployment costs.' });
  }
});

module.exports = router; 