const Project = require('../models/Project');
const logger = require('../utils/logger');
const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

class ProjectService {
  constructor(io, redis) {
    this.io = io;
    this.redis = redis;
    this.isRunning = false;
    this.projects = new Map();
    this.monitoringInterval = null;
  }

  async initialize() {
    try {
      logger.info('Initializing ProjectService...');
      
      // Check if database is connected
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        logger.warn('Database not connected, ProjectService will start without loading projects');
        this.isRunning = true;
        logger.info('ProjectService initialized without database connection');
        return;
      }
      
      // Load all projects from database
      const projects = await Project.find({});
      projects.forEach(project => {
        this.projects.set(project._id.toString(), project);
      });
      
      // Start monitoring
      this.startMonitoring();
      
      this.isRunning = true;
      logger.info(`ProjectService initialized with ${projects.length} projects`);
    } catch (error) {
      logger.error('Failed to initialize ProjectService:', error);
      // Don't throw error, just log it and continue
      this.isRunning = true;
      logger.info('ProjectService initialized with errors (continuing anyway)');
    }
  }

  async shutdown() {
    try {
      logger.info('Shutting down ProjectService...');
      
      this.isRunning = false;
      
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }
      
      logger.info('ProjectService shutdown complete');
    } catch (error) {
      logger.error('Error during ProjectService shutdown:', error);
    }
  }

  startMonitoring() {
    // Monitor projects every 5 minutes
    this.monitoringInterval = setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        await this.checkAllProjects();
      } catch (error) {
        logger.error('Error during project monitoring:', error);
      }
    }, 5 * 60 * 1000);
  }

  async checkAllProjects() {
    try {
      // Check if database is connected
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        logger.warn('Database not connected, skipping project health checks');
        return;
      }
      
      const projects = await Project.find({ 'monitoring.enabled': true });
      
      for (const project of projects) {
        try {
          await this.checkProjectHealth(project);
        } catch (error) {
          logger.error(`Error checking project ${project.name}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error during project health checks:', error);
    }
  }

  async checkProjectHealth(project) {
    if (!project.deployment.url) return;
    
    try {
      const startTime = Date.now();
      const response = await axios.get(project.deployment.url, {
        timeout: 10000,
        validateStatus: () => true
      });
      const responseTime = Date.now() - startTime;
      
      const status = response.status < 400 ? 'up' : 'down';
      
      await project.updateUptimeStatus(status, responseTime);
      
      // Emit real-time update
      this.io.to(`project-${project._id}`).emit('project-health-update', {
        projectId: project._id,
        health: project.health,
        uptime: project.monitoring.uptime.status,
        responseTime
      });
      
      // Check if status changed and send alerts
      if (status === 'down' && project.monitoring.alerts.enabled) {
        await this.sendHealthAlert(project, 'down');
      }
      
    } catch (error) {
      await project.updateUptimeStatus('down', null);
      
      // Emit real-time update
      this.io.to(`project-${project._id}`).emit('project-health-update', {
        projectId: project._id,
        health: 'critical',
        uptime: 'down',
        responseTime: null
      });
      
      // Send alert
      if (project.monitoring.alerts.enabled) {
        await this.sendHealthAlert(project, 'down', error.message);
      }
    }
  }

  async sendHealthAlert(project, status, error = null) {
    const alert = {
      project: project.name,
      status,
      timestamp: new Date(),
      error
    };
    
    // Store alert in Redis for recent alerts
    await this.redis.lpush(`alerts:${project._id}`, JSON.stringify(alert));
    await this.redis.ltrim(`alerts:${project._id}`, 0, 99); // Keep last 100 alerts
    
    // Emit alert to connected clients
    this.io.to(`project-${project._id}`).emit('project-alert', alert);
    
    // Send notifications through configured channels
    for (const channel of project.monitoring.alerts.channels) {
      try {
        await this.sendNotification(channel, alert);
      } catch (error) {
        logger.error(`Failed to send notification through ${channel.type}:`, error);
      }
    }
  }

  async sendNotification(channel, alert) {
    switch (channel.type) {
      case 'email':
        // Implement email notification
        break;
      case 'slack':
        // Implement Slack notification
        break;
      case 'discord':
        // Implement Discord notification
        break;
      case 'telegram':
        // Implement Telegram notification
        break;
    }
  }

  async getAllProjects(userId) {
    try {
      const projects = await Project.find({
        $or: [
          { owner: userId },
          { 'team.user': userId }
        ]
      }).populate('owner', 'firstName lastName email');
      
      return projects;
    } catch (error) {
      logger.error('Error getting projects:', error);
      throw error;
    }
  }

  async getProject(projectId, userId) {
    try {
      const project = await Project.findById(projectId)
        .populate('owner', 'firstName lastName email')
        .populate('team.user', 'firstName lastName email');
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      // Check permissions
      if (!project.hasPermission(userId, 'read')) {
        throw new Error('Access denied');
      }
      
      return project;
    } catch (error) {
      logger.error('Error getting project:', error);
      throw error;
    }
  }

  async createProject(projectData, userId) {
    try {
      const project = new Project({
        ...projectData,
        owner: userId
      });
      
      await project.save();
      
      // Add to local cache
      this.projects.set(project._id.toString(), project);
      
      // Emit real-time update
      this.io.emit('project-created', project);
      
      return project;
    } catch (error) {
      logger.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(projectId, updates, userId) {
    try {
      const project = await Project.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      if (!project.hasPermission(userId, 'write')) {
        throw new Error('Access denied');
      }
      
      Object.assign(project, updates);
      await project.save();
      
      // Update local cache
      this.projects.set(project._id.toString(), project);
      
      // Emit real-time update
      this.io.to(`project-${projectId}`).emit('project-updated', project);
      
      return project;
    } catch (error) {
      logger.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(projectId, userId) {
    try {
      const project = await Project.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      if (!project.hasPermission(userId, 'admin')) {
        throw new Error('Access denied');
      }
      
      await Project.findByIdAndDelete(projectId);
      
      // Remove from local cache
      this.projects.delete(projectId);
      
      // Emit real-time update
      this.io.emit('project-deleted', { projectId });
      
      return { success: true };
    } catch (error) {
      logger.error('Error deleting project:', error);
      throw error;
    }
  }

  async deployProject(projectId, deploymentConfig, userId) {
    try {
      const project = await Project.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      if (!project.hasPermission(userId, 'deploy')) {
        throw new Error('Access denied');
      }
      
      // Update deployment status
      await project.deploy(deploymentConfig.version || '1.0.0');
      
      // Emit deployment started
      this.io.to(`project-${projectId}`).emit('deployment-started', {
        projectId,
        status: 'in_progress'
      });
      
      // Perform deployment based on method
      let success = false;
      let error = null;
      
      try {
        switch (project.deployment.method) {
          case 'docker':
            success = await this.deployWithDocker(project, deploymentConfig);
            break;
          case 'pm2':
            success = await this.deployWithPM2(project, deploymentConfig);
            break;
          case 'manual':
            success = await this.deployManually(project, deploymentConfig);
            break;
          default:
            throw new Error(`Unsupported deployment method: ${project.deployment.method}`);
        }
      } catch (deployError) {
        error = deployError.message;
        success = false;
      }
      
      // Update deployment status
      await project.completeDeployment(success);
      
      // Emit deployment result
      this.io.to(`project-${projectId}`).emit('deployment-completed', {
        projectId,
        success,
        error
      });
      
      return { success, error };
    } catch (error) {
      logger.error('Error deploying project:', error);
      throw error;
    }
  }

  async deployWithDocker(project, config) {
    return new Promise((resolve, reject) => {
      const projectPath = path.join(process.env.PROJECTS_PATH || '../', project.slug);
      
      exec(`cd ${projectPath} && docker build -t ${project.slug} . && docker run -d --name ${project.slug} ${project.slug}`, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Docker deployment failed for ${project.name}:`, error);
          reject(error);
        } else {
          logger.info(`Docker deployment successful for ${project.name}`);
          resolve(true);
        }
      });
    });
  }

  async deployWithPM2(project, config) {
    return new Promise((resolve, reject) => {
      const projectPath = path.join(process.env.PROJECTS_PATH || '../', project.slug);
      
      exec(`cd ${projectPath} && pm2 restart ${project.slug} || pm2 start npm --name ${project.slug} -- start`, (error, stdout, stderr) => {
        if (error) {
          logger.error(`PM2 deployment failed for ${project.name}:`, error);
          reject(error);
        } else {
          logger.info(`PM2 deployment successful for ${project.name}`);
          resolve(true);
        }
      });
    });
  }

  async deployManually(project, config) {
    // Manual deployment - just update status
    logger.info(`Manual deployment for ${project.name}`);
    return true;
  }

  async getProjectLogs(projectId, lines = 100) {
    try {
      const project = await Project.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      // Get logs based on deployment method
      switch (project.deployment.method) {
        case 'docker':
          return await this.getDockerLogs(project, lines);
        case 'pm2':
          return await this.getPM2Logs(project, lines);
        default:
          return await this.getFileLogs(project, lines);
      }
    } catch (error) {
      logger.error('Error getting project logs:', error);
      throw error;
    }
  }

  async getDockerLogs(project, lines) {
    return new Promise((resolve, reject) => {
      exec(`docker logs --tail ${lines} ${project.slug}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  async getPM2Logs(project, lines) {
    return new Promise((resolve, reject) => {
      exec(`pm2 logs ${project.slug} --lines ${lines} --nostream`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  async getFileLogs(project, lines) {
    const logPath = path.join(process.env.PROJECTS_PATH || '../', project.slug, 'logs');
    
    try {
      const files = await fs.readdir(logPath);
      const logFiles = files.filter(file => file.endsWith('.log'));
      
      if (logFiles.length === 0) {
        return 'No log files found';
      }
      
      // Get the most recent log file
      const latestLog = logFiles.sort().reverse()[0];
      const logContent = await fs.readFile(path.join(logPath, latestLog), 'utf8');
      
      // Return last N lines
      const linesArray = logContent.split('\n');
      return linesArray.slice(-lines).join('\n');
    } catch (error) {
      return 'Unable to read log files';
    }
  }

  async getProjectStatistics() {
    try {
      const stats = await Project.getStatistics();
      return stats[0] || {
        totalProjects: 0,
        healthyProjects: 0,
        criticalProjects: 0,
        productionProjects: 0,
        totalRevenue: 0,
        totalUsers: 0
      };
    } catch (error) {
      logger.error('Error getting project statistics:', error);
      throw error;
    }
  }

  async getRecentAlerts(projectId, limit = 10) {
    try {
      const alerts = await this.redis.lrange(`alerts:${projectId}`, 0, limit - 1);
      return alerts.map(alert => JSON.parse(alert));
    } catch (error) {
      logger.error('Error getting recent alerts:', error);
      return [];
    }
  }
}

module.exports = ProjectService; 