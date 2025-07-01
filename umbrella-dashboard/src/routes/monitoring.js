const express = require('express');
const { requirePermission } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get system health
router.get('/health', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const monitoringService = req.app.get('monitoringService');
    const health = await monitoringService.getSystemHealth();
    
    res.json({ health });
  } catch (error) {
    logger.logError(error, { action: 'get_system_health', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get system health.' });
  }
});

// Get monitoring dashboard
router.get('/dashboard', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const monitoringService = req.app.get('monitoringService');
    const dashboard = await monitoringService.getMonitoringDashboard(req.user.id);
    
    res.json({ dashboard });
  } catch (error) {
    logger.logError(error, { action: 'get_monitoring_dashboard', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get monitoring dashboard.' });
  }
});

// Get alerts
router.get('/alerts', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, severity } = req.query;
    const monitoringService = req.app.get('monitoringService');
    const alerts = await monitoringService.getAlerts(page, limit, status, severity);
    
    res.json({ alerts });
  } catch (error) {
    logger.logError(error, { action: 'get_alerts', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get alerts.' });
  }
});

// Acknowledge alert
router.put('/alerts/:alertId/acknowledge', requirePermission('infrastructure', 'manage'), async (req, res) => {
  try {
    const { alertId } = req.params;
    const monitoringService = req.app.get('monitoringService');
    const alert = await monitoringService.acknowledgeAlert(alertId, req.user.id);
    
    res.json({
      message: 'Alert acknowledged successfully',
      alert
    });
  } catch (error) {
    logger.logError(error, { action: 'acknowledge_alert', userId: req.user.id, alertId });
    res.status(500).json({ message: 'Failed to acknowledge alert.' });
  }
});

// Resolve alert
router.put('/alerts/:alertId/resolve', requirePermission('infrastructure', 'manage'), async (req, res) => {
  try {
    const { alertId } = req.params;
    const monitoringService = req.app.get('monitoringService');
    const alert = await monitoringService.resolveAlert(alertId, req.user.id);
    
    res.json({
      message: 'Alert resolved successfully',
      alert
    });
  } catch (error) {
    logger.logError(error, { action: 'resolve_alert', userId: req.user.id, alertId });
    res.status(500).json({ message: 'Failed to resolve alert.' });
  }
});

// Get alert statistics
router.get('/alerts/stats', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const monitoringService = req.app.get('monitoringService');
    const stats = await monitoringService.getAlertStatistics(period);
    
    res.json({ stats });
  } catch (error) {
    logger.logError(error, { action: 'get_alert_stats', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get alert statistics.' });
  }
});

// Get performance metrics
router.get('/performance', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const { period = '24h', metric } = req.query;
    const monitoringService = req.app.get('monitoringService');
    const performance = await monitoringService.getPerformanceMetrics(period, metric);
    
    res.json({ performance });
  } catch (error) {
    logger.logError(error, { action: 'get_performance_metrics', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get performance metrics.' });
  }
});

// Get uptime data
router.get('/uptime', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const monitoringService = req.app.get('monitoringService');
    const uptime = await monitoringService.getUptimeData(period);
    
    res.json({ uptime });
  } catch (error) {
    logger.logError(error, { action: 'get_uptime_data', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get uptime data.' });
  }
});

// Get error logs
router.get('/errors', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 50, level, service } = req.query;
    const monitoringService = req.app.get('monitoringService');
    const errors = await monitoringService.getErrorLogs(page, limit, level, service);
    
    res.json({ errors });
  } catch (error) {
    logger.logError(error, { action: 'get_error_logs', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get error logs.' });
  }
});

// Get monitoring configuration
router.get('/config', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const monitoringService = req.app.get('monitoringService');
    const config = await monitoringService.getMonitoringConfig();
    
    res.json({ config });
  } catch (error) {
    logger.logError(error, { action: 'get_monitoring_config', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get monitoring configuration.' });
  }
});

// Update monitoring configuration
router.put('/config', requirePermission('infrastructure', 'manage'), async (req, res) => {
  try {
    const config = req.body;
    const monitoringService = req.app.get('monitoringService');
    const updated = await monitoringService.updateMonitoringConfig(config, req.user.id);
    
    res.json({
      message: 'Monitoring configuration updated successfully',
      config: updated
    });
  } catch (error) {
    logger.logError(error, { action: 'update_monitoring_config', userId: req.user.id });
    res.status(500).json({ message: 'Failed to update monitoring configuration.' });
  }
});

// Get notification channels
router.get('/notifications', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const monitoringService = req.app.get('monitoringService');
    const notifications = await monitoringService.getNotificationChannels();
    
    res.json({ notifications });
  } catch (error) {
    logger.logError(error, { action: 'get_notification_channels', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get notification channels.' });
  }
});

// Add notification channel
router.post('/notifications', requirePermission('infrastructure', 'manage'), async (req, res) => {
  try {
    const channel = req.body;
    const monitoringService = req.app.get('monitoringService');
    const created = await monitoringService.addNotificationChannel(channel, req.user.id);
    
    res.status(201).json({
      message: 'Notification channel added successfully',
      channel: created
    });
  } catch (error) {
    logger.logError(error, { action: 'add_notification_channel', userId: req.user.id });
    res.status(500).json({ message: 'Failed to add notification channel.' });
  }
});

// Test notification channel
router.post('/notifications/:channelId/test', requirePermission('infrastructure', 'manage'), async (req, res) => {
  try {
    const { channelId } = req.params;
    const monitoringService = req.app.get('monitoringService');
    const result = await monitoringService.testNotificationChannel(channelId);
    
    res.json({
      message: 'Test notification sent successfully',
      result
    });
  } catch (error) {
    logger.logError(error, { action: 'test_notification_channel', userId: req.user.id, channelId });
    res.status(500).json({ message: 'Failed to test notification channel.' });
  }
});

// Get monitoring schedules
router.get('/schedules', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const monitoringService = req.app.get('monitoringService');
    const schedules = await monitoringService.getMonitoringSchedules();
    
    res.json({ schedules });
  } catch (error) {
    logger.logError(error, { action: 'get_monitoring_schedules', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get monitoring schedules.' });
  }
});

// Create monitoring schedule
router.post('/schedules', requirePermission('infrastructure', 'manage'), async (req, res) => {
  try {
    const schedule = req.body;
    const monitoringService = req.app.get('monitoringService');
    const created = await monitoringService.createMonitoringSchedule(schedule, req.user.id);
    
    res.status(201).json({
      message: 'Monitoring schedule created successfully',
      schedule: created
    });
  } catch (error) {
    logger.logError(error, { action: 'create_monitoring_schedule', userId: req.user.id });
    res.status(500).json({ message: 'Failed to create monitoring schedule.' });
  }
});

// Get monitoring reports
router.get('/reports', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const { type, period = '30d' } = req.query;
    const monitoringService = req.app.get('monitoringService');
    const reports = await monitoringService.getMonitoringReports(type, period);
    
    res.json({ reports });
  } catch (error) {
    logger.logError(error, { action: 'get_monitoring_reports', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get monitoring reports.' });
  }
});

// Get monitoring trends
router.get('/trends', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const { metric, period = '30d' } = req.query;
    const monitoringService = req.app.get('monitoringService');
    const trends = await monitoringService.getMonitoringTrends(metric, period);
    
    res.json({ trends });
  } catch (error) {
    logger.logError(error, { action: 'get_monitoring_trends', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get monitoring trends.' });
  }
});

// Get monitoring thresholds
router.get('/thresholds', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const monitoringService = req.app.get('monitoringService');
    const thresholds = await monitoringService.getMonitoringThresholds();
    
    res.json({ thresholds });
  } catch (error) {
    logger.logError(error, { action: 'get_monitoring_thresholds', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get monitoring thresholds.' });
  }
});

// Update monitoring threshold
router.put('/thresholds/:thresholdId', requirePermission('infrastructure', 'manage'), async (req, res) => {
  try {
    const { thresholdId } = req.params;
    const threshold = req.body;
    const monitoringService = req.app.get('monitoringService');
    const updated = await monitoringService.updateMonitoringThreshold(thresholdId, threshold, req.user.id);
    
    res.json({
      message: 'Monitoring threshold updated successfully',
      threshold: updated
    });
  } catch (error) {
    logger.logError(error, { action: 'update_monitoring_threshold', userId: req.user.id, thresholdId });
    res.status(500).json({ message: 'Failed to update monitoring threshold.' });
  }
});

// Get monitoring status
router.get('/status', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const monitoringService = req.app.get('monitoringService');
    const status = await monitoringService.getMonitoringStatus();
    
    res.json({ status });
  } catch (error) {
    logger.logError(error, { action: 'get_monitoring_status', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get monitoring status.' });
  }
});

// Restart monitoring service
router.post('/restart', requirePermission('infrastructure', 'manage'), async (req, res) => {
  try {
    const monitoringService = req.app.get('monitoringService');
    const result = await monitoringService.restartMonitoringService(req.user.id);
    
    res.json({
      message: 'Monitoring service restarted successfully',
      result
    });
  } catch (error) {
    logger.logError(error, { action: 'restart_monitoring_service', userId: req.user.id });
    res.status(500).json({ message: 'Failed to restart monitoring service.' });
  }
});

module.exports = router; 