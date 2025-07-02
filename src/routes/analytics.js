const express = require('express');
const { requirePermission } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get dashboard overview analytics
router.get('/overview', requirePermission('analytics', 'read'), async (req, res) => {
  try {
    const analyticsService = req.app.get('analyticsService');
    const overview = await analyticsService.getDashboardOverview(req.user.id);
    
    res.json({ overview });
  } catch (error) {
    logger.logError(error, { action: 'get_dashboard_overview', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get dashboard overview.' });
  }
});

// Get revenue analytics
router.get('/revenue', requirePermission('analytics', 'read'), async (req, res) => {
  try {
    const { period = '30d', groupBy = 'day' } = req.query;
    const analyticsService = req.app.get('analyticsService');
    const revenue = await analyticsService.getRevenueAnalytics(req.user.id, period, groupBy);
    
    res.json({ revenue });
  } catch (error) {
    logger.logError(error, { action: 'get_revenue_analytics', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get revenue analytics.' });
  }
});

// Get user analytics
router.get('/users', requirePermission('analytics', 'read'), async (req, res) => {
  try {
    const { period = '30d', groupBy = 'day' } = req.query;
    const analyticsService = req.app.get('analyticsService');
    const users = await analyticsService.getUserAnalytics(req.user.id, period, groupBy);
    
    res.json({ users });
  } catch (error) {
    logger.logError(error, { action: 'get_user_analytics', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get user analytics.' });
  }
});

// Get performance analytics
router.get('/performance', requirePermission('analytics', 'read'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const analyticsService = req.app.get('analyticsService');
    const performance = await analyticsService.getPerformanceAnalytics(req.user.id, period);
    
    res.json({ performance });
  } catch (error) {
    logger.logError(error, { action: 'get_performance_analytics', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get performance analytics.' });
  }
});

// Get project-specific analytics
router.get('/projects/:projectId', requirePermission('analytics', 'read'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { period = '30d' } = req.query;
    const analyticsService = req.app.get('analyticsService');
    const analytics = await analyticsService.getProjectAnalytics(projectId, period);
    
    res.json({ analytics });
  } catch (error) {
    logger.logError(error, { action: 'get_project_analytics', userId: req.user.id, projectId: req.params.projectId });
    res.status(500).json({ message: 'Failed to get project analytics.' });
  }
});

// Get infrastructure analytics
router.get('/infrastructure', requirePermission('analytics', 'read'), async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    const analyticsService = req.app.get('analyticsService');
    const infrastructure = await analyticsService.getInfrastructureAnalytics(req.user.id, period);
    
    res.json({ infrastructure });
  } catch (error) {
    logger.logError(error, { action: 'get_infrastructure_analytics', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get infrastructure analytics.' });
  }
});

// Export analytics data
router.post('/export', requirePermission('analytics', 'export'), async (req, res) => {
  try {
    const { type, period, format = 'csv' } = req.body;
    const analyticsService = req.app.get('analyticsService');
    const exportData = await analyticsService.exportAnalytics(req.user.id, type, period, format);
    
    res.json({
      message: 'Export completed successfully',
      downloadUrl: exportData.downloadUrl,
      expiresAt: exportData.expiresAt
    });
  } catch (error) {
    logger.logError(error, { action: 'export_analytics', userId: req.user.id });
    res.status(500).json({ message: 'Failed to export analytics.' });
  }
});

// Get custom reports
router.get('/reports', requirePermission('analytics', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const analyticsService = req.app.get('analyticsService');
    const reports = await analyticsService.getCustomReports(req.user.id, page, limit);
    
    res.json({ reports });
  } catch (error) {
    logger.logError(error, { action: 'get_custom_reports', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get custom reports.' });
  }
});

// Create custom report
router.post('/reports', requirePermission('analytics', 'export'), async (req, res) => {
  try {
    const { name, description, query, schedule } = req.body;
    const analyticsService = req.app.get('analyticsService');
    const report = await analyticsService.createCustomReport(req.user.id, {
      name,
      description,
      query,
      schedule
    });
    
    res.status(201).json({
      message: 'Custom report created successfully',
      report
    });
  } catch (error) {
    logger.logError(error, { action: 'create_custom_report', userId: req.user.id });
    res.status(500).json({ message: 'Failed to create custom report.' });
  }
});

// Get real-time metrics
router.get('/realtime', requirePermission('analytics', 'read'), async (req, res) => {
  try {
    const analyticsService = req.app.get('analyticsService');
    const realtime = await analyticsService.getRealtimeMetrics(req.user.id);
    
    res.json({ realtime });
  } catch (error) {
    logger.logError(error, { action: 'get_realtime_metrics', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get real-time metrics.' });
  }
});

// Get trend analysis
router.get('/trends', requirePermission('analytics', 'read'), async (req, res) => {
  try {
    const { metric, period = '90d' } = req.query;
    const analyticsService = req.app.get('analyticsService');
    const trends = await analyticsService.getTrendAnalysis(req.user.id, metric, period);
    
    res.json({ trends });
  } catch (error) {
    logger.logError(error, { action: 'get_trend_analysis', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get trend analysis.' });
  }
});

// Get comparative analytics
router.get('/compare', requirePermission('analytics', 'read'), async (req, res) => {
  try {
    const { metric, period1, period2 } = req.query;
    const analyticsService = req.app.get('analyticsService');
    const comparison = await analyticsService.getComparativeAnalytics(req.user.id, metric, period1, period2);
    
    res.json({ comparison });
  } catch (error) {
    logger.logError(error, { action: 'get_comparative_analytics', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get comparative analytics.' });
  }
});

// Get predictive analytics
router.get('/predictions', requirePermission('analytics', 'read'), async (req, res) => {
  try {
    const { metric, horizon = '30d' } = req.query;
    const analyticsService = req.app.get('analyticsService');
    const predictions = await analyticsService.getPredictiveAnalytics(req.user.id, metric, horizon);
    
    res.json({ predictions });
  } catch (error) {
    logger.logError(error, { action: 'get_predictive_analytics', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get predictive analytics.' });
  }
});

// Get alert analytics
router.get('/alerts', requirePermission('analytics', 'read'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const analyticsService = req.app.get('analyticsService');
    const alerts = await analyticsService.getAlertAnalytics(req.user.id, period);
    
    res.json({ alerts });
  } catch (error) {
    logger.logError(error, { action: 'get_alert_analytics', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get alert analytics.' });
  }
});

// Get cost analytics
router.get('/costs', requirePermission('analytics', 'read'), async (req, res) => {
  try {
    const { period = '30d', groupBy = 'service' } = req.query;
    const analyticsService = req.app.get('analyticsService');
    const costs = await analyticsService.getCostAnalytics(req.user.id, period, groupBy);
    
    res.json({ costs });
  } catch (error) {
    logger.logError(error, { action: 'get_cost_analytics', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get cost analytics.' });
  }
});

// Get ROI analytics
router.get('/roi', requirePermission('analytics', 'read'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const analyticsService = req.app.get('analyticsService');
    const roi = await analyticsService.getROIAnalytics(req.user.id, period);
    
    res.json({ roi });
  } catch (error) {
    logger.logError(error, { action: 'get_roi_analytics', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get ROI analytics.' });
  }
});

module.exports = router; 