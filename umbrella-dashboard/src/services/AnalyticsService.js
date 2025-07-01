const Project = require('../models/Project');
const User = require('../models/User');
const logger = require('../utils/logger');
const moment = require('moment');

class AnalyticsService {
  constructor(io, redis) {
    this.io = io;
    this.redis = redis;
    this.isRunning = false;
  }

  async initialize() {
    try {
      logger.info('Initializing AnalyticsService...');
      this.isRunning = true;
      logger.info('AnalyticsService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AnalyticsService:', error);
      throw error;
    }
  }

  async shutdown() {
    try {
      logger.info('Shutting down AnalyticsService...');
      this.isRunning = false;
      logger.info('AnalyticsService shutdown complete');
    } catch (error) {
      logger.error('Error during AnalyticsService shutdown:', error);
    }
  }

  async getDashboardOverview(userId) {
    try {
      // Get user's projects
      const projects = await Project.find({
        $or: [
          { owner: userId },
          { 'team.user': userId }
        ]
      });

      // Calculate overview metrics
      const totalProjects = projects.length;
      const healthyProjects = projects.filter(p => p.health === 'healthy').length;
      const criticalProjects = projects.filter(p => p.health === 'critical').length;
      const productionProjects = projects.filter(p => p.status === 'production').length;

      // Calculate total revenue
      const totalRevenue = projects.reduce((sum, project) => sum + (project.analytics.revenue.total || 0), 0);
      const monthlyRevenue = projects.reduce((sum, project) => sum + (project.analytics.revenue.monthly || 0), 0);

      // Calculate total users
      const totalUsers = projects.reduce((sum, project) => sum + (project.analytics.users.total || 0), 0);
      const activeUsers = projects.reduce((sum, project) => sum + (project.analytics.users.active || 0), 0);

      // Get recent activity
      const recentActivity = await this.getRecentActivity(userId);

      // Get performance metrics
      const performanceMetrics = await this.getPerformanceMetrics(userId);

      return {
        summary: {
          totalProjects,
          healthyProjects,
          criticalProjects,
          productionProjects,
          totalRevenue,
          monthlyRevenue,
          totalUsers,
          activeUsers
        },
        recentActivity,
        performanceMetrics,
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error getting dashboard overview:', error);
      throw error;
    }
  }

  async getRevenueAnalytics(userId, period = '30d', groupBy = 'day') {
    try {
      const projects = await Project.find({
        $or: [
          { owner: userId },
          { 'team.user': userId }
        ]
      });

      const startDate = moment().subtract(period.replace('d', ''), 'days');
      const analytics = [];

      // Generate date range
      const dates = [];
      let currentDate = moment(startDate);
      const endDate = moment();

      while (currentDate.isBefore(endDate)) {
        dates.push(currentDate.format('YYYY-MM-DD'));
        currentDate.add(1, groupBy === 'day' ? 'day' : 'week');
      }

      // Calculate revenue for each date
      for (const date of dates) {
        const dailyRevenue = projects.reduce((sum, project) => {
          // This would typically come from actual transaction data
          // For now, we'll use a simple calculation
          const baseRevenue = project.analytics.revenue.monthly || 0;
          const dailyEstimate = baseRevenue / 30;
          return sum + dailyEstimate;
        }, 0);

        analytics.push({
          date,
          revenue: Math.round(dailyRevenue * 100) / 100,
          projects: projects.length
        });
      }

      return {
        period,
        groupBy,
        analytics,
        totalRevenue: analytics.reduce((sum, item) => sum + item.revenue, 0),
        averageRevenue: analytics.reduce((sum, item) => sum + item.revenue, 0) / analytics.length
      };
    } catch (error) {
      logger.error('Error getting revenue analytics:', error);
      throw error;
    }
  }

  async getUserAnalytics(userId, period = '30d', groupBy = 'day') {
    try {
      const projects = await Project.find({
        $or: [
          { owner: userId },
          { 'team.user': userId }
        ]
      });

      const startDate = moment().subtract(period.replace('d', ''), 'days');
      const analytics = [];

      // Generate date range
      const dates = [];
      let currentDate = moment(startDate);
      const endDate = moment();

      while (currentDate.isBefore(endDate)) {
        dates.push(currentDate.format('YYYY-MM-DD'));
        currentDate.add(1, groupBy === 'day' ? 'day' : 'week');
      }

      // Calculate user growth for each date
      for (const date of dates) {
        const dailyUsers = projects.reduce((sum, project) => {
          const baseUsers = project.analytics.users.total || 0;
          const growthRate = project.analytics.users.growth || 0;
          const dailyGrowth = (baseUsers * growthRate) / 100 / 30;
          return sum + dailyGrowth;
        }, 0);

        analytics.push({
          date,
          newUsers: Math.round(dailyUsers),
          totalUsers: projects.reduce((sum, project) => sum + (project.analytics.users.total || 0), 0),
          activeUsers: projects.reduce((sum, project) => sum + (project.analytics.users.active || 0), 0)
        });
      }

      return {
        period,
        groupBy,
        analytics,
        totalUsers: analytics[analytics.length - 1]?.totalUsers || 0,
        totalNewUsers: analytics.reduce((sum, item) => sum + item.newUsers, 0)
      };
    } catch (error) {
      logger.error('Error getting user analytics:', error);
      throw error;
    }
  }

  async getPerformanceAnalytics(userId, period = '30d') {
    try {
      const projects = await Project.find({
        $or: [
          { owner: userId },
          { 'team.user': userId }
        ]
      });

      const performanceMetrics = projects.map(project => ({
        projectId: project._id,
        projectName: project.name,
        responseTime: project.analytics.performance.responseTime || 0,
        errorRate: project.analytics.performance.errorRate || 0,
        throughput: project.analytics.performance.throughput || 0,
        uptime: project.monitoring.uptime.uptimePercentage || 0,
        health: project.health
      }));

      const averageResponseTime = performanceMetrics.reduce((sum, metric) => sum + metric.responseTime, 0) / performanceMetrics.length;
      const averageErrorRate = performanceMetrics.reduce((sum, metric) => sum + metric.errorRate, 0) / performanceMetrics.length;
      const averageUptime = performanceMetrics.reduce((sum, metric) => sum + metric.uptime, 0) / performanceMetrics.length;

      return {
        period,
        metrics: performanceMetrics,
        averages: {
          responseTime: averageResponseTime,
          errorRate: averageErrorRate,
          uptime: averageUptime
        },
        summary: {
          totalProjects: performanceMetrics.length,
          healthyProjects: performanceMetrics.filter(m => m.health === 'healthy').length,
          criticalProjects: performanceMetrics.filter(m => m.health === 'critical').length
        }
      };
    } catch (error) {
      logger.error('Error getting performance analytics:', error);
      throw error;
    }
  }

  async getProjectAnalytics(projectId, period = '30d') {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const startDate = moment().subtract(period.replace('d', ''), 'days');
      const analytics = [];

      // Generate daily analytics for the period
      let currentDate = moment(startDate);
      const endDate = moment();

      while (currentDate.isBefore(endDate)) {
        const date = currentDate.format('YYYY-MM-DD');
        
        // Calculate daily metrics (this would come from actual data)
        const dailyRevenue = (project.analytics.revenue.monthly || 0) / 30;
        const dailyUsers = (project.analytics.users.total || 0) * ((project.analytics.users.growth || 0) / 100 / 30);

        analytics.push({
          date,
          revenue: Math.round(dailyRevenue * 100) / 100,
          users: Math.round(dailyUsers),
          responseTime: project.analytics.performance.responseTime || 0,
          errorRate: project.analytics.performance.errorRate || 0,
          uptime: project.monitoring.uptime.uptimePercentage || 0
        });

        currentDate.add(1, 'day');
      }

      return {
        projectId,
        projectName: project.name,
        period,
        analytics,
        summary: {
          totalRevenue: analytics.reduce((sum, item) => sum + item.revenue, 0),
          totalUsers: analytics.reduce((sum, item) => sum + item.users, 0),
          averageResponseTime: analytics.reduce((sum, item) => sum + item.responseTime, 0) / analytics.length,
          averageErrorRate: analytics.reduce((sum, item) => sum + item.errorRate, 0) / analytics.length,
          averageUptime: analytics.reduce((sum, item) => sum + item.uptime, 0) / analytics.length
        }
      };
    } catch (error) {
      logger.error('Error getting project analytics:', error);
      throw error;
    }
  }

  async getInfrastructureAnalytics(userId, period = '24h') {
    try {
      const projects = await Project.find({
        $or: [
          { owner: userId },
          { 'team.user': userId }
        ]
      });

      const infrastructureMetrics = projects.map(project => ({
        projectId: project._id,
        projectName: project.name,
        server: {
          host: project.infrastructure.server.host,
          type: project.infrastructure.server.type,
          region: project.infrastructure.server.region
        },
        database: {
          type: project.infrastructure.database.type,
          size: project.infrastructure.database.size || 0,
          lastBackup: project.infrastructure.database.lastBackup
        },
        storage: {
          type: project.infrastructure.storage.type,
          used: project.infrastructure.storage.used || 0,
          limit: project.infrastructure.storage.limit || 0
        },
        ssl: {
          enabled: project.security.ssl.enabled,
          expiry: project.security.ssl.expiry
        }
      }));

      return {
        period,
        metrics: infrastructureMetrics,
        summary: {
          totalProjects: infrastructureMetrics.length,
          sslEnabled: infrastructureMetrics.filter(m => m.ssl.enabled).length,
          backupEnabled: infrastructureMetrics.filter(m => m.database.lastBackup).length
        }
      };
    } catch (error) {
      logger.error('Error getting infrastructure analytics:', error);
      throw error;
    }
  }

  async getRecentActivity(userId) {
    try {
      // Get recent project updates, deployments, and alerts
      const projects = await Project.find({
        $or: [
          { owner: userId },
          { 'team.user': userId }
        ]
      }).sort({ updatedAt: -1 }).limit(10);

      const activities = projects.map(project => ({
        type: 'project_update',
        projectId: project._id,
        projectName: project.name,
        timestamp: project.updatedAt,
        details: {
          health: project.health,
          status: project.status,
          lastDeployed: project.deployment.lastDeployed
        }
      }));

      return activities;
    } catch (error) {
      logger.error('Error getting recent activity:', error);
      return [];
    }
  }

  async getPerformanceMetrics(userId) {
    try {
      const projects = await Project.find({
        $or: [
          { owner: userId },
          { 'team.user': userId }
        ]
      });

      const metrics = {
        averageResponseTime: 0,
        averageErrorRate: 0,
        averageUptime: 0,
        totalThroughput: 0
      };

      if (projects.length > 0) {
        metrics.averageResponseTime = projects.reduce((sum, p) => sum + (p.analytics.performance.responseTime || 0), 0) / projects.length;
        metrics.averageErrorRate = projects.reduce((sum, p) => sum + (p.analytics.performance.errorRate || 0), 0) / projects.length;
        metrics.averageUptime = projects.reduce((sum, p) => sum + (p.monitoring.uptime.uptimePercentage || 0), 0) / projects.length;
        metrics.totalThroughput = projects.reduce((sum, p) => sum + (p.analytics.performance.throughput || 0), 0);
      }

      return metrics;
    } catch (error) {
      logger.error('Error getting performance metrics:', error);
      return {
        averageResponseTime: 0,
        averageErrorRate: 0,
        averageUptime: 0,
        totalThroughput: 0
      };
    }
  }

  async exportAnalytics(userId, type, period, format = 'csv') {
    try {
      let data;
      
      switch (type) {
        case 'revenue':
          data = await this.getRevenueAnalytics(userId, period);
          break;
        case 'users':
          data = await this.getUserAnalytics(userId, period);
          break;
        case 'performance':
          data = await this.getPerformanceAnalytics(userId, period);
          break;
        default:
          throw new Error('Invalid export type');
      }

      // Generate export file
      const fileName = `${type}_analytics_${moment().format('YYYY-MM-DD_HH-mm-ss')}.${format}`;
      const downloadUrl = `/exports/${fileName}`;
      const expiresAt = moment().add(24, 'hours').toDate();

      // Store export data in Redis
      await this.redis.setex(`export:${fileName}`, 86400, JSON.stringify(data));

      return {
        downloadUrl,
        expiresAt,
        fileName
      };
    } catch (error) {
      logger.error('Error exporting analytics:', error);
      throw error;
    }
  }

  async getCustomReports(userId, page = 1, limit = 10) {
    try {
      // This would typically query a reports collection
      // For now, return empty array
      return {
        reports: [],
        totalPages: 0,
        currentPage: page,
        total: 0
      };
    } catch (error) {
      logger.error('Error getting custom reports:', error);
      throw error;
    }
  }

  async createCustomReport(userId, reportData) {
    try {
      // This would typically save to a reports collection
      const report = {
        id: Date.now().toString(),
        userId,
        ...reportData,
        createdAt: new Date()
      };

      return report;
    } catch (error) {
      logger.error('Error creating custom report:', error);
      throw error;
    }
  }

  async getRealtimeMetrics(userId) {
    try {
      const projects = await Project.find({
        $or: [
          { owner: userId },
          { 'team.user': userId }
        ]
      });

      const realtime = {
        activeProjects: projects.filter(p => p.health === 'healthy').length,
        criticalProjects: projects.filter(p => p.health === 'critical').length,
        totalRevenue: projects.reduce((sum, p) => sum + (p.analytics.revenue.total || 0), 0),
        totalUsers: projects.reduce((sum, p) => sum + (p.analytics.users.total || 0), 0),
        averageResponseTime: projects.reduce((sum, p) => sum + (p.analytics.performance.responseTime || 0), 0) / projects.length,
        timestamp: new Date()
      };

      return realtime;
    } catch (error) {
      logger.error('Error getting real-time metrics:', error);
      throw error;
    }
  }

  async getTrendAnalysis(userId, metric, period = '90d') {
    try {
      // This would analyze trends for the specified metric
      const trends = {
        metric,
        period,
        trend: 'increasing', // or 'decreasing', 'stable'
        change: 15.5, // percentage change
        data: [] // historical data points
      };

      return trends;
    } catch (error) {
      logger.error('Error getting trend analysis:', error);
      throw error;
    }
  }

  async getComparativeAnalytics(userId, metric, period1, period2) {
    try {
      // This would compare metrics between two periods
      const comparison = {
        metric,
        period1,
        period2,
        difference: 12.5, // percentage difference
        period1Value: 100,
        period2Value: 112.5
      };

      return comparison;
    } catch (error) {
      logger.error('Error getting comparative analytics:', error);
      throw error;
    }
  }

  async getPredictiveAnalytics(userId, metric, horizon = '30d') {
    try {
      // This would provide predictions for the specified metric
      const predictions = {
        metric,
        horizon,
        currentValue: 100,
        predictedValue: 115,
        confidence: 0.85,
        factors: ['user growth', 'seasonal trends', 'market conditions']
      };

      return predictions;
    } catch (error) {
      logger.error('Error getting predictive analytics:', error);
      throw error;
    }
  }

  async getAlertAnalytics(userId, period = '30d') {
    try {
      const projects = await Project.find({
        $or: [
          { owner: userId },
          { 'team.user': userId }
        ]
      });

      const alerts = {
        period,
        totalAlerts: 0,
        criticalAlerts: 0,
        warningAlerts: 0,
        resolvedAlerts: 0,
        averageResolutionTime: 0
      };

      return alerts;
    } catch (error) {
      logger.error('Error getting alert analytics:', error);
      throw error;
    }
  }

  async getCostAnalytics(userId, period = '30d', groupBy = 'service') {
    try {
      const costs = {
        period,
        groupBy,
        totalCost: 0,
        breakdown: [],
        trends: []
      };

      return costs;
    } catch (error) {
      logger.error('Error getting cost analytics:', error);
      throw error;
    }
  }

  async getROIAnalytics(userId, period = '30d') {
    try {
      const roi = {
        period,
        totalInvestment: 0,
        totalRevenue: 0,
        roi: 0,
        paybackPeriod: 0,
        breakdown: []
      };

      return roi;
    } catch (error) {
      logger.error('Error getting ROI analytics:', error);
      throw error;
    }
  }
}

module.exports = AnalyticsService; 