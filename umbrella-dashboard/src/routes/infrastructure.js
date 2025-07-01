const express = require('express');
const { requirePermission } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get server status
router.get('/servers', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const infrastructureService = req.app.get('infrastructureService');
    const servers = await infrastructureService.getServerStatus();
    
    res.json({ servers });
  } catch (error) {
    logger.logError(error, { action: 'get_server_status', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get server status.' });
  }
});

// Get database status
router.get('/databases', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const infrastructureService = req.app.get('infrastructureService');
    const databases = await infrastructureService.getDatabaseStatus();
    
    res.json({ databases });
  } catch (error) {
    logger.logError(error, { action: 'get_database_status', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get database status.' });
  }
});

// Get SSL certificate status
router.get('/ssl', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const infrastructureService = req.app.get('infrastructureService');
    const ssl = await infrastructureService.getSSLStatus();
    
    res.json({ ssl });
  } catch (error) {
    logger.logError(error, { action: 'get_ssl_status', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get SSL certificate status.' });
  }
});

// Create backup
router.post('/backup', requirePermission('infrastructure', 'manage'), async (req, res) => {
  try {
    const { type = 'full', projects = [] } = req.body;
    const infrastructureService = req.app.get('infrastructureService');
    const backup = await infrastructureService.createBackup(type, projects);
    
    res.json({
      message: 'Backup created successfully',
      backup
    });
  } catch (error) {
    logger.logError(error, { action: 'create_backup', userId: req.user.id });
    res.status(500).json({ message: 'Failed to create backup.' });
  }
});

// Get backup history
router.get('/backups', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const infrastructureService = req.app.get('infrastructureService');
    const backups = await infrastructureService.getBackupHistory(page, limit);
    
    res.json({ backups });
  } catch (error) {
    logger.logError(error, { action: 'get_backup_history', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get backup history.' });
  }
});

// Restore from backup
router.post('/restore/:backupId', requirePermission('infrastructure', 'manage'), async (req, res) => {
  try {
    const { backupId } = req.params;
    const infrastructureService = req.app.get('infrastructureService');
    const restore = await infrastructureService.restoreFromBackup(backupId);
    
    res.json({
      message: 'Restore completed successfully',
      restore
    });
  } catch (error) {
    logger.logError(error, { action: 'restore_backup', userId: req.user.id, backupId });
    res.status(500).json({ message: 'Failed to restore from backup.' });
  }
});

// Get storage usage
router.get('/storage', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const infrastructureService = req.app.get('infrastructureService');
    const storage = await infrastructureService.getStorageUsage();
    
    res.json({ storage });
  } catch (error) {
    logger.logError(error, { action: 'get_storage_usage', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get storage usage.' });
  }
});

// Get network status
router.get('/network', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const infrastructureService = req.app.get('infrastructureService');
    const network = await infrastructureService.getNetworkStatus();
    
    res.json({ network });
  } catch (error) {
    logger.logError(error, { action: 'get_network_status', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get network status.' });
  }
});

// Get security status
router.get('/security', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const infrastructureService = req.app.get('infrastructureService');
    const security = await infrastructureService.getSecurityStatus();
    
    res.json({ security });
  } catch (error) {
    logger.logError(error, { action: 'get_security_status', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get security status.' });
  }
});

// Update SSL certificate
router.put('/ssl/:projectId', requirePermission('infrastructure', 'manage'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { provider, domain } = req.body;
    const infrastructureService = req.app.get('infrastructureService');
    const ssl = await infrastructureService.updateSSLCertificate(projectId, provider, domain);
    
    res.json({
      message: 'SSL certificate updated successfully',
      ssl
    });
  } catch (error) {
    logger.logError(error, { action: 'update_ssl_certificate', userId: req.user.id, projectId });
    res.status(500).json({ message: 'Failed to update SSL certificate.' });
  }
});

// Scale infrastructure
router.post('/scale', requirePermission('infrastructure', 'manage'), async (req, res) => {
  try {
    const { projectId, resource, action, value } = req.body;
    const infrastructureService = req.app.get('infrastructureService');
    const scale = await infrastructureService.scaleInfrastructure(projectId, resource, action, value);
    
    res.json({
      message: 'Infrastructure scaled successfully',
      scale
    });
  } catch (error) {
    logger.logError(error, { action: 'scale_infrastructure', userId: req.user.id, projectId });
    res.status(500).json({ message: 'Failed to scale infrastructure.' });
  }
});

// Get monitoring metrics
router.get('/monitoring', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    const infrastructureService = req.app.get('infrastructureService');
    const monitoring = await infrastructureService.getMonitoringMetrics(period);
    
    res.json({ monitoring });
  } catch (error) {
    logger.logError(error, { action: 'get_monitoring_metrics', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get monitoring metrics.' });
  }
});

// Get infrastructure costs
router.get('/costs', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const infrastructureService = req.app.get('infrastructureService');
    const costs = await infrastructureService.getInfrastructureCosts(period);
    
    res.json({ costs });
  } catch (error) {
    logger.logError(error, { action: 'get_infrastructure_costs', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get infrastructure costs.' });
  }
});

// Get infrastructure alerts
router.get('/alerts', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const infrastructureService = req.app.get('infrastructureService');
    const alerts = await infrastructureService.getInfrastructureAlerts(page, limit);
    
    res.json({ alerts });
  } catch (error) {
    logger.logError(error, { action: 'get_infrastructure_alerts', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get infrastructure alerts.' });
  }
});

// Update infrastructure configuration
router.put('/config/:projectId', requirePermission('infrastructure', 'manage'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const config = req.body;
    const infrastructureService = req.app.get('infrastructureService');
    const updated = await infrastructureService.updateConfiguration(projectId, config);
    
    res.json({
      message: 'Infrastructure configuration updated successfully',
      config: updated
    });
  } catch (error) {
    logger.logError(error, { action: 'update_infrastructure_config', userId: req.user.id, projectId });
    res.status(500).json({ message: 'Failed to update infrastructure configuration.' });
  }
});

// Get infrastructure health
router.get('/health', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const infrastructureService = req.app.get('infrastructureService');
    const health = await infrastructureService.getInfrastructureHealth();
    
    res.json({ health });
  } catch (error) {
    logger.logError(error, { action: 'get_infrastructure_health', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get infrastructure health.' });
  }
});

// Get infrastructure logs
router.get('/logs', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const { service, lines = 100 } = req.query;
    const infrastructureService = req.app.get('infrastructureService');
    const logs = await infrastructureService.getInfrastructureLogs(service, lines);
    
    res.json({ logs });
  } catch (error) {
    logger.logError(error, { action: 'get_infrastructure_logs', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get infrastructure logs.' });
  }
});

// Restart infrastructure service
router.post('/restart/:service', requirePermission('infrastructure', 'manage'), async (req, res) => {
  try {
    const { service } = req.params;
    const infrastructureService = req.app.get('infrastructureService');
    const result = await infrastructureService.restartService(service);
    
    res.json({
      message: 'Service restarted successfully',
      result
    });
  } catch (error) {
    logger.logError(error, { action: 'restart_infrastructure_service', userId: req.user.id, service });
    res.status(500).json({ message: 'Failed to restart service.' });
  }
});

// Get infrastructure performance
router.get('/performance', requirePermission('infrastructure', 'read'), async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    const infrastructureService = req.app.get('infrastructureService');
    const performance = await infrastructureService.getInfrastructurePerformance(period);
    
    res.json({ performance });
  } catch (error) {
    logger.logError(error, { action: 'get_infrastructure_performance', userId: req.user.id });
    res.status(500).json({ message: 'Failed to get infrastructure performance.' });
  }
});

module.exports = router; 