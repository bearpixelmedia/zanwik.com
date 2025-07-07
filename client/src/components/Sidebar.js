import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  Monitor,
  FolderOpen,
  Search,
  Star,
  Clock,
  Plus,
  ChevronDown,
  ChevronRight,
  Zap,
  AlertTriangle,
  Rocket,
  Activity,
  Shield,
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../utils/cn';

const Sidebar = () => {
  const {
    logout,

    getUserRoleInfo,
    hasPermission,
    getSessionInfo,
  } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    main: true,
    development: true,
    monitoring: true,
    admin: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(['/dashboard', '/projects']);
  const [recentItems, setRecentItems] = useState([]);

  // Sample recent items
  useEffect(() => {
    setRecentItems([
      {
        name: 'Dashboard Overview',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: 'Project Analytics',
        path: '/analytics',
        icon: BarChart3,
      },
      {
        name: 'User Management',
        path: '/users',
        icon: Users,
      },
    ]);
  }, []);

  const roleInfo = getUserRoleInfo();
  const sessionInfo = getSessionInfo();

  const navigation = {
    main: {
      title: 'Main',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          description: 'Overview and analytics',
          badge: null,
        },
        {
          name: 'Projects',
          href: '/projects',
          icon: FolderOpen,
          description: 'Manage your projects',
          badge: '12',
        },
      ],
    },
    development: {
      title: 'Development',
      items: [
        {
          name: 'Analytics',
          href: '/analytics',
          icon: BarChart3,
          description: 'Detailed insights',
          badge: null,
        },
        {
          name: 'Infrastructure',
          href: '/infrastructure',
          icon: Building2,
          description: 'System resources',
          badge: null,
        },
        {
          name: 'Deployment',
          href: '/deployment',
          icon: Rocket,
          description: 'CI/CD pipelines',
          badge: '3',
        },
      ],
    },
    monitoring: {
      title: 'Monitoring',
      items: [
        {
          name: 'System Monitoring',
          href: '/monitoring',
          icon: Monitor,
          description: 'Real-time monitoring',
          badge: null,
        },
        {
          name: 'Performance',
          href: '/performance',
          icon: Activity,
          description: 'Performance metrics',
          badge: '98%',
        },
        {
          name: 'Alerts',
          href: '/alerts',
          icon: AlertTriangle,
          description: 'System alerts',
          badge: '2',
        },
      ],
    },
    admin: {
      title: 'Administration',
      items: [
        {
          name: 'Users',
          href: '/users',
          icon: Users,
          description: 'User management',
          badge: null,
          requiresPermission: 'manage_users',
        },
        {
          name: 'Settings',
          href: '/settings',
          icon: Settings,
          description: 'Account settings',
          badge: null,
        },
        {
          name: 'Security',
          href: '/security',
          icon: Shield,
          description: 'Security settings',
          badge: null,
          requiresPermission: 'manage_security',
        },
      ],
    },
  };

  const quickActions = [
    {
      name: 'New Project',
      icon: Plus,
      action: () => {
        // Create new project - removed console.log for lint compliance
      },
      requiresPermission: 'manage_projects',
    },
    {
      name: 'Deploy',
      icon: Rocket,
      action: () => {
        // Deploy project - removed console.log for lint compliance
      },
      requiresPermission: 'deploy',
    },
    {
      name: 'Monitor',
      icon: Activity,
      action: () => {
        // Open monitoring - removed console.log for lint compliance
      },
      requiresPermission: 'view_monitoring',
    },
  ];

  const isActive = path => location.pathname === path;
  const isFavorite = path => favorites.includes(path);

  const toggleSection = section => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleFavorite = path => {
    setFavorites(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path],
    );
  };

  const filteredNavigation = Object.entries(navigation).reduce(
    (acc, [key, section]) => {
      const filteredItems = section.items.filter(item => {
        // Check permissions
        if (
          item.requiresPermission &&
          !hasPermission(item.requiresPermission)
        ) {
          return false;
        }

        // Check search query
        if (searchQuery) {
          return (
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        return true;
      });

      if (filteredItems.length > 0) {
        acc[key] = { ...section, items: filteredItems },
      }

      return acc;
    },
    {}
  );

  const filteredQuickActions = quickActions.filter(
    action =>
      !action.requiresPermission || hasPermission(action.requiresPermission),
  );

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-border'>
        {!isCollapsed && (
          <div className='flex items-center space-x-2'>
            <div className='relative'>
              <img src='/zanwik-icon.svg' alt='Zanwik' className='w-8 h-8' />
              {sessionInfo?.willExpireSoon && (
                <div className='absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-card animate-pulse' />
              )}
            </div>
            <div>
              <span className='font-semibold text-lg text-foreground'>
                Zanwik
              </span>
              {roleInfo && (
                <p className='text-xs text-muted-foreground flex items-center'>
                  <span className='mr-1'>{roleInfo.icon}</span>
                  {roleInfo.name}
                </p>
              )}
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className='flex items-center justify-center w-full'>
            <div className='relative'>
              <img src='/zanwik-icon.svg' alt='Zanwik' className='w-8 h-8' />
              {sessionInfo?.willExpireSoon && (
                <div className='absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-card animate-pulse' />
              )}
            </div>
          </div>
        )}
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='h-8 w-8'
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'},
        >
          {isCollapsed ? (
            <Menu className='h-4 w-4' />
          ) : (
            <X className='h-4 w-4' />
          )}
        </Button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className='p-4 border-b border-border'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <input
              type='text'
              placeholder='Search navigation...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
            />
            {searchQuery && (
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setSearchQuery('')}
                className='absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6'
              >
                <X className='h-3 w-3' />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!isCollapsed && filteredQuickActions.length > 0 && (
        <div className='p-4 border-b border-border'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              Quick Actions
            </h3>
            <Zap className='h-3 w-3 text-muted-foreground' />
          </div>
          <div className='space-y-1'>
            {filteredQuickActions.map(action => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.name}
                  variant='ghost'
                  size='sm'
                  onClick={action.action}
                  className='w-full justify-start text-xs h-8',
                >
                  <Icon className='h-3 w-3 mr-2' />
                  {action.name}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className='flex-1 p-4 space-y-4 overflow-y-auto'>
        {Object.entries(filteredNavigation).map(([sectionKey, section]) => (
          <div key={sectionKey}>
            {/* Section Header */}
            {!isCollapsed && (
              <button
                onClick={() => toggleSection(sectionKey)}
                className='flex items-center justify-between w-full text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 hover:text-foreground transition-colors',
              >
                <span>{section.title}</span>
                {expandedSections[sectionKey] ? (
                  <ChevronDown className='h-3 w-3' />
                ) : (
                  <ChevronRight className='h-3 w-3' />
                )}
              </button>
            )}

            {/* Section Items */}
            {expandedSections[sectionKey] && (
              <div className='space-y-1'>
                {section.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.name} className='relative group',>
                      <Link
                        to={item.href}
                        className={cn(
                          'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground transition-colors',
                          isCollapsed ? 'justify-center' : '',
                          isActive(item.href)
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5 transition-colors',
                            isActive(item.href)
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground group-hover:text-foreground'
                          )}
                        />
                        {!isCollapsed && (
                          <div className='flex-1 flex items-center justify-between'>
                            <div>
                              <span>{item.name}</span>
                              {isActive(item.href) && (
                                <p className='text-xs opacity-80 mt-0.5'>
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className='flex items-center space-x-1'>
                              {item.badge && (
                                <span
                                  className={cn(
                                    'px-2 py-0.5 text-xs rounded-full',
                                    isActive(item.href)
                                      ? 'bg-primary-foreground/20 text-primary-foreground'
                                      : 'bg-muted text-muted-foreground'
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Link>

                      {/* Favorite Button */}
                      {!isCollapsed && (
                        <button
                          onClick={() => toggleFavorite(item.href)}
                          className={cn(
                            'absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity',
                            isFavorite(item.href)
                              ? 'text-yellow-500'
                              : 'text-muted-foreground hover:text-yellow-500'
                          )}
                        >
                          <Star
                            className={cn(
                              'h-3 w-3',
                              isFavorite(item.href) ? 'fill-current' : ''
                            )}
                          />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Recent Items */}
      {!isCollapsed && recentItems.length > 0 && (
        <div className='p-4 border-t border-border'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              Recent
            </h3>
            <Clock className='h-3 w-3 text-muted-foreground' />
          </div>
          <div className='space-y-1'>
            {recentItems.slice(0, 3).map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className='flex items-center space-x-2 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'
                >
                  <Icon className='h-3 w-3' />
                  <span className='truncate'>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className='p-4 border-t border-border space-y-2'>
        {/* Session Status */}
        {!isCollapsed && sessionInfo && (
          <div className='flex items-center justify-between text-xs text-muted-foreground mb-2'>
            <span>Session</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full',
                sessionInfo.willExpireSoon
                  ? 'bg-yellow-500/20 text-yellow-600'
                  : 'bg-green-500/20 text-green-600'
              )}
            >
              {Math.floor(sessionInfo.timeLeft / 60000)}m
            </span>
          </div>
        )}

        {/* Logout Button */}
        <Button
          variant='ghost'
          onClick={logout}
          className={cn(
            'w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className='h-5 w-5' />
          {!isCollapsed && <span className='ml-3'>Sign Out</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
