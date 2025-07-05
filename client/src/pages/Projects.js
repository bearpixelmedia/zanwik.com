import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  DollarSign,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Star,
  Clock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
const Projects = () => {
  console.log('Rendering Projects');
  const { user: _user } = useAuth(); // eslint-disable-line no-unused-vars
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60); // seconds
  const [creatingProject, setCreatingProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    category: 'web',
    budget: '',
    deadline: '',
  });

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchProjects();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Refetch when filters change
  useEffect(() => {
    fetchProjects();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterCategory !== 'all') params.category = filterCategory;
      if (sortBy) params.sortBy = sortBy;

      console.log('Fetching projects with params:', params);
      const response = await api.projects.getProjects(params);
      console.log('Projects response:', response);

      setProjects(response.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);

      // Provide more specific error messages
      let errorMessage = 'Failed to load projects. Please try again.';

      if (err.message.includes('Failed to fetch')) {
        errorMessage =
          'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (err.message.includes('401')) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err.message.includes('403')) {
        errorMessage = "You don't have permission to view projects.";
      } else if (err.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      }

      setError(errorMessage);

      // Fallback to mock data for demo
      setProjects([
        {
          id: 1,
          name: 'AI Content Generator',
          description: 'Automated content creation tool with AI',
          status: 'active',
          revenue: 2450,
          users: 156,
          category: 'SaaS',
          created: '2024-01-15',
          lastUpdated: '2024-01-20',
          priority: 'high',
          progress: 85,
        },
        {
          id: 2,
          name: 'Digital Product Marketplace',
          description: 'Platform for selling digital products',
          status: 'development',
          revenue: 890,
          users: 89,
          category: 'Marketplace',
          created: '2024-01-10',
          lastUpdated: '2024-01-18',
          priority: 'medium',
          progress: 60,
        },
        {
          id: 3,
          name: 'Freelance Service Hub',
          description: 'Connecting freelancers with clients',
          status: 'planning',
          revenue: 0,
          users: 0,
          category: 'Platform',
          created: '2024-01-25',
          lastUpdated: '2024-01-25',
          priority: 'low',
          progress: 20,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      setCreatingProject(true);
      const createdProject = await api.createProject({
        ...newProject,
        status: 'planning',
      });
      setProjects(prev => [...prev, createdProject]);
      setShowCreateModal(false);
      setNewProject({
        name: '',
        description: '',
        category: 'web',
        budget: '',
        deadline: '',
      });
    } catch (err) {
      console.error('Failed to create project:', err);
      alert('Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleUpdateProject = async (projectId, updatedData) => {
    try {
      setEditingProject(projectId);
      const updatedProject = await api.updateProject(projectId, updatedData);
      setProjects(prev =>
        prev.map(p => (p.id === projectId ? updatedProject : p)),
      );
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update project:', err);
      alert('Failed to update project');
    } finally {
      setEditingProject(null);
    }
  };

  const handleDeleteProject = async projectId => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await api.deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } catch (err) {
        console.error('Failed to delete project:', err);
        alert('Failed to delete project');
      }
    }
  };

  const handleViewAnalytics = async projectId => {
    try {
      const analytics = await api.projects.getProjectAnalytics(projectId);
      setSelectedProject({ id: projectId, analytics });
      setShowAnalyticsModal(true);
    } catch (err) {
      console.error('Error fetching project analytics:', err);
      alert('Failed to load project analytics. Please try again.');
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'development':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = priority => {
    switch (priority) {
      case 'high':
        return <Star className='h-4 w-4 text-red-500' />;
      case 'medium':
        return <Star className='h-4 w-4 text-yellow-500' />;
      case 'low':
        return <Star className='h-4 w-4 text-gray-400' />;
      default:
        return <Star className='h-4 w-4 text-gray-400' />;
    }
  };

  const getProgressColor = progress => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || project.status === filterStatus;
    const matchesCategory =
      filterCategory === 'all' || project.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='h-8 w-8 mx-auto mb-4 animate-spin border-4 border-primary border-t-transparent rounded-full' />
          <p className='text-muted-foreground'>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Projects</h1>
          <p className='text-muted-foreground'>
            Manage your money-making projects and track their performance.
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          {/* Auto-refresh controls */}
          <div className='flex items-center space-x-2 mr-4'>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size='sm'
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`}
              />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={e => setRefreshInterval(Number(e.target.value))}
                className='px-2 py-1 text-sm border border-border rounded bg-background'
              >
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
                <option value={900}>15m</option>
              </select>
            )}
          </div>

          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className='h-4 w-4 mr-2' />
            Create Project
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <p className='text-red-800'>
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <input
            type='text'
            placeholder='Search projects...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className='px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
        >
          <option value='all'>All Status</option>
          <option value='active'>Active</option>
          <option value='development'>Development</option>
          <option value='planning'>Planning</option>
          <option value='paused'>Paused</option>
        </select>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className='px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
        >
          <option value='all'>All Categories</option>
          <option value='SaaS'>SaaS</option>
          <option value='Marketplace'>Marketplace</option>
          <option value='Platform'>Platform</option>
          <option value='Service'>Service</option>
          <option value='Product'>Product</option>
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className='px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
        >
          <option value='created'>Date Created</option>
          <option value='updated'>Last Updated</option>
          <option value='revenue'>Revenue</option>
          <option value='users'>Users</option>
          <option value='name'>Name</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredProjects.map(project => (
          <Card key={project.id} className='hover:shadow-md transition-shadow'>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <CardTitle className='text-lg'>{project.name}</CardTitle>
                    {getPriorityIcon(project.priority)}
                  </div>
                  <CardDescription className='mt-2'>
                    {project.description}
                  </CardDescription>
                </div>
                <div className='relative'>
                  <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {/* Status and Progress */}
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Status</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      project.status,
                    )}`}
                  >
                    {project.status.charAt(0).toUpperCase() +
                      project.status.slice(1)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Progress</span>
                    <span className='font-medium'>
                      {project.progress || 0}%
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                        project.progress || 0,
                      )}`}
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className='grid grid-cols-3 gap-4'>
                  <div className='text-center'>
                    <div className='flex items-center justify-center mb-1'>
                      <DollarSign className='h-4 w-4 text-green-500 mr-1' />
                    </div>
                    <p className='text-sm font-medium'>
                      ${project.revenue?.toLocaleString() || '0'}
                    </p>
                    <p className='text-xs text-muted-foreground'>Revenue</p>
                  </div>
                  <div className='text-center'>
                    <div className='flex items-center justify-center mb-1'>
                      <Users className='h-4 w-4 text-blue-500 mr-1' />
                    </div>
                    <p className='text-sm font-medium'>
                      {project.users?.toLocaleString() || '0'}
                    </p>
                    <p className='text-xs text-muted-foreground'>Users</p>
                  </div>
                  <div className='text-center'>
                    <div className='flex items-center justify-center mb-1'>
                      <Target className='h-4 w-4 text-purple-500 mr-1' />
                    </div>
                    <p className='text-sm font-medium'>{project.category}</p>
                    <p className='text-xs text-muted-foreground'>Category</p>
                  </div>
                </div>

                {/* Last Updated */}
                <div className='flex items-center text-xs text-muted-foreground'>
                  <Clock className='h-3 w-3 mr-1' />
                  Updated {new Date(project.lastUpdated).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className='flex space-x-2 pt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1'
                    onClick={() => handleViewAnalytics(project.id)}
                  >
                    <BarChart3 className='h-4 w-4 mr-1' />
                    Analytics
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1'
                    onClick={() => {
                      setEditingProject(project);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit className='h-4 w-4 mr-1' />
                    Edit
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1 text-red-600 hover:text-red-700'
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 className='h-4 w-4 mr-1' />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && !loading && (
        <Card className='text-center py-12'>
          <CardContent>
            <Target className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-medium text-foreground mb-2'>
              No projects found
            </h3>
            <p className='text-muted-foreground mb-4'>
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first project'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className='h-4 w-4 mr-2' />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <Card className='w-full max-w-md mx-4'>
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
              <CardDescription>
                Add a new money-making project to your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label htmlFor="-project-name-">
                  Project Name
                </label>
                <input
                  type='text'
                  placeholder='Enter project name'
                  value={newProject.name}
                  onChange={e =>
                    setNewProject(prev => ({ ...prev, name: e.target.value }))
                  }
                  className='w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>
              <div>
                <label htmlFor="-description-">
                  Description
                </label>
                <textarea
                  placeholder='Describe your project'
                  rows={3}
                  value={newProject.description}
                  onChange={e =>
                    setNewProject(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className='w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>
              <div>
                <label htmlFor="-category-">
                  Category
                </label>
                <select
                  value={newProject.category}
                  onChange={e =>
                    setNewProject(prev => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className='w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                >
                  <option value='SaaS'>SaaS</option>
                  <option value='Marketplace'>Marketplace</option>
                  <option value='Platform'>Platform</option>
                  <option value='Service'>Service</option>
                  <option value='Product'>Product</option>
                </select>
              </div>
              <div className='flex space-x-2 pt-4'>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={() => setShowCreateModal(false)}
                  disabled={creatingProject}
                >
                  Cancel
                </Button>
                <Button
                  className='flex-1'
                  onClick={handleCreateProject}
                  disabled={creatingProject}
                >
                  {creatingProject ? (
                    <>
                      <div className='h-4 w-4 mr-2 animate-spin border-2 border-current border-t-transparent rounded-full' />
                      Creating...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && editingProject && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <Card className='w-full max-w-md mx-4'>
            <CardHeader>
              <CardTitle>Edit Project</CardTitle>
              <CardDescription>
                Update project details and settings
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label htmlFor="-project-name-">
                  Project Name
                </label>
                <input
                  type='text'
                  placeholder='Enter project name'
                  value={editingProject.name}
                  onChange={e =>
                    setEditingProject(prev => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className='w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>
              <div>
                <label htmlFor="-description-">
                  Description
                </label>
                <textarea
                  placeholder='Describe your project'
                  rows={3}
                  value={editingProject.description}
                  onChange={e =>
                    setEditingProject(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className='w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label htmlFor="-category-">
                    Category
                  </label>
                  <select
                    value={editingProject.category}
                    onChange={e =>
                      setEditingProject(prev => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className='w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                  >
                    <option value='SaaS'>SaaS</option>
                    <option value='Marketplace'>Marketplace</option>
                    <option value='Platform'>Platform</option>
                    <option value='Service'>Service</option>
                    <option value='Product'>Product</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="-status-">
                    Status
                  </label>
                  <select
                    value={editingProject.status}
                    onChange={e =>
                      setEditingProject(prev => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className='w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                  >
                    <option value='planning'>Planning</option>
                    <option value='development'>Development</option>
                    <option value='active'>Active</option>
                    <option value='paused'>Paused</option>
                  </select>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label htmlFor="-progress--">
                    Progress (%)
                  </label>
                  <input
                    type='number'
                    min='0'
                    max='100'
                    value={editingProject.progress || 0}
                    onChange={e =>
                      setEditingProject(prev => ({
                        ...prev,
                        progress: parseInt(e.target.value) || 0,
                      }))
                    }
                    className='w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                  />
                </div>
                <div>
                  <label htmlFor="-priority-">
                    Priority
                  </label>
                  <select
                    value={editingProject.priority || 'medium'}
                    onChange={e =>
                      setEditingProject(prev => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                    className='w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                  >
                    <option value='low'>Low</option>
                    <option value='medium'>Medium</option>
                    <option value='high'>High</option>
                  </select>
                </div>
              </div>
              <div className='flex space-x-2 pt-4'>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProject(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className='flex-1'
                  onClick={() =>
                    handleUpdateProject(editingProject.id, editingProject)
                  }
                >
                  Update Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedProject && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <Card className='w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Project Analytics</CardTitle>
                  <CardDescription>
                    Detailed performance metrics and insights
                  </CardDescription>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setShowAnalyticsModal(false);
                    setSelectedProject(null);
                  }}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Analytics content would go here */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex items-center space-x-2'>
                      <TrendingUp className='h-5 w-5 text-green-500' />
                      <span className='font-medium'>Revenue Growth</span>
                    </div>
                    <p className='text-2xl font-bold mt-2'>+15.2%</p>
                    <p className='text-sm text-muted-foreground'>
                      vs last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex items-center space-x-2'>
                      <Users className='h-5 w-5 text-blue-500' />
                      <span className='font-medium'>User Growth</span>
                    </div>
                    <p className='text-2xl font-bold mt-2'>+8.7%</p>
                    <p className='text-sm text-muted-foreground'>
                      vs last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex items-center space-x-2'>
                      <Target className='h-5 w-5 text-purple-500' />
                      <span className='font-medium'>Conversion</span>
                    </div>
                    <p className='text-2xl font-bold mt-2'>3.2%</p>
                    <p className='text-sm text-muted-foreground'>
                      current rate
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className='text-center py-8 text-muted-foreground'>
                <BarChart3 className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>Detailed analytics coming soon...</p>
                <p className='text-sm'>
                  This will include charts, trends, and actionable insights.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Projects;
