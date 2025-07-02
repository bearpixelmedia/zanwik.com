import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI, freelancersAPI } from '../utils/api';
import { 
  Search, 
  Briefcase, 
  Users, 
  Star, 
  DollarSign, 
  Clock,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, freelancersRes] = await Promise.all([
        projectsAPI.getAll({ limit: 6, sort: 'applications' }),
        freelancersAPI.getTopFreelancers()
      ]);

      setFeaturedProjects(projectsRes.data.projects);
      setTopFreelancers(freelancersRes.data.freelancers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/projects?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'web-development': '💻',
      'mobile-development': '📱',
      'design': '🎨',
      'writing': '✍️',
      'marketing': '📈',
      'data-science': '📊',
      'ai-ml': '🤖',
      'consulting': '💼',
      'translation': '🌐',
      'other': '🔧'
    };
    return icons[category] || '🔧';
  };

  const formatBudget = (budget) => {
    if (budget.type === 'fixed') {
      return `$${budget.amount.toLocaleString()}`;
    }
    return `$${budget.amount}/hr`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find the Perfect Freelancer
              <br />
              <span className="text-yellow-300">for Your Project</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100">
              Connect with talented professionals worldwide. Post projects, hire experts, and get work done.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                <input
                  type="text"
                  placeholder="Search for projects or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/projects"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
                  >
                    Browse Projects
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/create-project"
                    className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Post a Project
                  </Link>
                  <Link
                    to="/projects"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
                  >
                    Find Work
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">10,000+</div>
              <div className="text-gray-600">Active Freelancers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">5,000+</div>
              <div className="text-gray-600">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">$2M+</div>
              <div className="text-gray-600">Total Paid</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">4.9/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Projects</h2>
            <Link
              to="/projects"
              className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center"
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border animate-pulse">
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <div key={project._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{getCategoryIcon(project.category)}</span>
                      <span className="text-sm text-gray-500">{project.applications} proposals</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {project.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-indigo-600">
                        {formatBudget(project.budget)}
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        {project.experience} level
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {project.duration.replace('-', ' ')}
                      </div>
                      <Link
                        to={`/projects/${project._id}`}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Freelancers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Top Freelancers</h2>
            <Link
              to="/freelancers"
              className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center"
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topFreelancers.slice(0, 8).map((freelancer) => (
              <div key={freelancer._id} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                  {freelancer.avatar ? (
                    <img
                      src={freelancer.avatar}
                      alt={freelancer.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-indigo-600">
                      {freelancer.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1">{freelancer.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{freelancer.skills?.slice(0, 2).join(', ')}</p>
                
                <div className="flex items-center justify-center mb-3">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">
                    {freelancer.rating?.average?.toFixed(1) || '0.0'} ({freelancer.rating?.count || 0})
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 mb-3">
                  ${freelancer.hourlyRate}/hr
                </div>
                
                <Link
                  to={`/freelancers/${freelancer._id}`}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Post a Project</h3>
              <p className="text-gray-600">
                Describe your project, set your budget, and get proposals from talented freelancers.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose a Freelancer</h3>
              <p className="text-gray-600">
                Review proposals, portfolios, and ratings to find the perfect match for your project.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Work Done</h3>
              <p className="text-gray-600">
                Collaborate securely, track progress, and pay only when you're satisfied.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-indigo-100">
            Join thousands of clients and freelancers who trust our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign Up Now
            </Link>
            <Link
              to="/projects"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Browse Projects
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 