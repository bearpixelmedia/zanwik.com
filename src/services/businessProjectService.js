/**
 * Business Project Management Service
 * Manages business projects that use APIs for revenue generation
 */

class BusinessProjectService {
  constructor() {
    this.projects = new Map();
    this.revenueTracking = new Map();
    this.apiUsage = new Map();
  }

  /**
   * Create a new business project
   * @param {Object} projectData - Project information
   * @returns {Object} Created project
   */
  createProject(projectData) {
    const projectId = this.generateProjectId();
    const project = {
      id: projectId,
      name: projectData.name,
      description: projectData.description,
      category: projectData.category,
      status: 'planning', // planning, development, testing, live, paused
      apis: projectData.apis || [],
      revenue: {
        target: projectData.revenueTarget || 0,
        current: 0,
        monthly: 0
      },
      timeline: {
        startDate: new Date().toISOString(),
        targetLaunch: projectData.targetLaunch,
        milestones: []
      },
      metrics: {
        apiCalls: 0,
        users: 0,
        conversions: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.projects.set(projectId, project);
    return project;
  }

  /**
   * Get all projects
   * @returns {Array} All projects
   */
  getAllProjects() {
    return Array.from(this.projects.values());
  }

  /**
   * Get project by ID
   * @param {string} projectId - Project ID
   * @returns {Object|null} Project or null
   */
  getProject(projectId) {
    return this.projects.get(projectId) || null;
  }

  /**
   * Update project
   * @param {string} projectId - Project ID
   * @param {Object} updates - Updates to apply
   * @returns {Object|null} Updated project or null
   */
  updateProject(projectId, updates) {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.projects.set(projectId, updatedProject);
    return updatedProject;
  }

  /**
   * Add API to project
   * @param {string} projectId - Project ID
   * @param {Object} apiData - API information
   * @returns {Object|null} Updated project or null
   */
  addApiToProject(projectId, apiData) {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const apiUsage = {
      id: apiData.id,
      name: apiData.name,
      category: apiData.category,
      addedAt: new Date().toISOString(),
      usage: {
        calls: 0,
        lastUsed: null,
        cost: 0
      }
    };

    project.apis.push(apiUsage);
    project.updatedAt = new Date().toISOString();

    this.projects.set(projectId, project);
    return project;
  }

  /**
   * Track API usage
   * @param {string} projectId - Project ID
   * @param {string} apiId - API ID
   * @param {Object} usageData - Usage data
   */
  trackApiUsage(projectId, apiId, usageData) {
    const project = this.projects.get(projectId);
    if (!project) return;

    const api = project.apis.find(a => a.id === apiId);
    if (!api) return;

    api.usage.calls += 1;
    api.usage.lastUsed = new Date().toISOString();
    api.usage.cost += usageData.cost || 0;

    project.metrics.apiCalls += 1;
    project.updatedAt = new Date().toISOString();

    this.projects.set(projectId, project);
  }

  /**
   * Update project revenue
   * @param {string} projectId - Project ID
   * @param {number} amount - Revenue amount
   * @param {string} period - monthly, daily, total
   */
  updateRevenue(projectId, amount, period = 'total') {
    const project = this.projects.get(projectId);
    if (!project) return;

    if (period === 'monthly') {
      project.revenue.monthly = amount;
    } else {
      project.revenue.current = amount;
    }

    project.updatedAt = new Date().toISOString();
    this.projects.set(projectId, project);
  }

  /**
   * Get project analytics
   * @param {string} projectId - Project ID
   * @returns {Object} Project analytics
   */
  getProjectAnalytics(projectId) {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const totalApiCalls = project.apis.reduce((sum, api) => sum + api.usage.calls, 0);
    const totalApiCost = project.apis.reduce((sum, api) => sum + api.usage.cost, 0);
    const revenueProgress = project.revenue.target > 0 
      ? (project.revenue.current / project.revenue.target) * 100 
      : 0;

    return {
      projectId,
      name: project.name,
      status: project.status,
      revenue: {
        current: project.revenue.current,
        target: project.revenue.target,
        monthly: project.revenue.monthly,
        progress: revenueProgress
      },
      apis: {
        total: project.apis.length,
        calls: totalApiCalls,
        cost: totalApiCost
      },
      metrics: project.metrics,
      timeline: project.timeline
    };
  }

  /**
   * Get business dashboard data
   * @returns {Object} Dashboard data
   */
  getDashboardData() {
    const allProjects = this.getAllProjects();
    const totalProjects = allProjects.length;
    const activeProjects = allProjects.filter(p => p.status === 'live').length;
    const totalRevenue = allProjects.reduce((sum, p) => sum + p.revenue.current, 0);
    const monthlyRevenue = allProjects.reduce((sum, p) => sum + p.revenue.monthly, 0);
    const totalApiCalls = allProjects.reduce((sum, p) => 
      sum + p.apis.reduce((apiSum, api) => apiSum + api.usage.calls, 0), 0);

    const projectsByStatus = allProjects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});

    const projectsByCategory = allProjects.reduce((acc, project) => {
      acc[project.category] = (acc[project.category] || 0) + 1;
      return acc;
    }, {});

    return {
      overview: {
        totalProjects,
        activeProjects,
        totalRevenue,
        monthlyRevenue,
        totalApiCalls
      },
      projectsByStatus,
      projectsByCategory,
      recentProjects: allProjects
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
    };
  }

  /**
   * Get revenue projections
   * @param {string} projectId - Project ID
   * @returns {Object} Revenue projections
   */
  getRevenueProjections(projectId) {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const currentRevenue = project.revenue.current;
    const monthlyRevenue = project.revenue.monthly;
    const targetRevenue = project.revenue.target;

    // Simple linear projection based on current monthly revenue
    const monthsToTarget = targetRevenue > monthlyRevenue && monthlyRevenue > 0
      ? Math.ceil((targetRevenue - currentRevenue) / monthlyRevenue)
      : null;

    return {
      current: currentRevenue,
      monthly: monthlyRevenue,
      target: targetRevenue,
      monthsToTarget,
      projectedAnnual: monthlyRevenue * 12
    };
  }

  /**
   * Generate project ID
   * @returns {string} Project ID
   */
  generateProjectId() {
    return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delete project
   * @param {string} projectId - Project ID
   * @returns {boolean} Success status
   */
  deleteProject(projectId) {
    return this.projects.delete(projectId);
  }

  /**
   * Get projects by category
   * @param {string} category - Category name
   * @returns {Array} Projects in category
   */
  getProjectsByCategory(category) {
    return this.getAllProjects().filter(p => p.category === category);
  }

  /**
   * Get projects by status
   * @param {string} status - Project status
   * @returns {Array} Projects with status
   */
  getProjectsByStatus(status) {
    return this.getAllProjects().filter(p => p.status === status);
  }
}

// Create singleton instance
const businessProjectService = new BusinessProjectService();

module.exports = businessProjectService;
