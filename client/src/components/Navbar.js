import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  X,
  RefreshCw,
  Zap,
  Globe,
  BarChart3,
  Plus,
  Filter,
  HelpCircle,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Eye,
  EyeOff,
  Lock,
  Key,
  Activity,
  TrendingUp,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Button } from './ui/button';

const Navbar = () => {
  const {
    user,

    logout,
    getUserRoleInfo,
    getSessionInfo,
    refreshSession,
    hasPermission,
  } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sessionWarning, setSessionWarning] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Sample notifications data
  useEffect(() => {
    const sampleNotifications = [
      {
        id: 1,
        type: 'success',
        title: 'Deployment Successful',
        message:
          'Project "E-commerce App" has been deployed successfully to production.',
        time: '2 minutes ago',
        read: false,
        icon: CheckCircle,
      },
      {
        id: 2,
        type: 'warning',
        title: 'High CPU Usage',
        message:
          'Server CPU usage is at 85%. Consider scaling your infrastructure.',
        time: '15 minutes ago',
        read: false,
        icon: AlertTriangle,
      },
      {
        id: 3,
        type: 'info',
        title: 'New User Registration',
        message: 'John Doe has joined your team as a Developer.',
        time: '1 hour ago',
        read: true,
        icon: User,
      },
      {
        id: 4,
        type: 'error',
        title: 'Database Connection Failed',
        message:
          'Unable to connect to the primary database. Check your configuration.',
        time: '2 hours ago',
        read: false,
        icon: AlertCircle,
      },
    ];

    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.read).length);
  }, []);

  // Check session status
  useEffect(() => {
    const checkSession = () => {
      const sessionInfo = getSessionInfo();
      if (sessionInfo?.willExpireSoon && !sessionInfo?.isExpired) {
        setSessionWarning(true);
      } else {
        setSessionWarning(false);
      }
    };

    const interval = setInterval(checkSession, 30000); // Check every 30 seconds
    checkSession(); // Initial check

    return () => clearInterval(interval);
  }, [getSessionInfo]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = event => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = event => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            setIsSearchOpen(true);
            searchRef.current?.focus();
            break;
          case 'n':
            event.preventDefault();
            setIsNotificationsOpen(!isNotificationsOpen);
            break;
          case 'p':
            event.preventDefault();
            setIsProfileOpen(!isProfileOpen);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isNotificationsOpen, isProfileOpen]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSearch = e => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
    setIsSearchOpen(false);
  };

  const markNotificationAsRead = notificationId => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = type => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return AlertCircle;
      case 'info':
        return Info;
      default:
        return Bell;
    }
  };

  const getNotificationColor = type => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const roleInfo = getUserRoleInfo();
  const sessionInfo = getSessionInfo();

  return (
    <div className='bg-card border-b border-border px-4 py-3'>
      <div className='flex items-center justify-between'>
        {/* Left side - Quick Actions */}
        <div className='flex items-center space-x-3'>
          {/* Quick Add Button */}
          {hasPermission('manage_projects') && (
            <Button
              variant='outline'
              size='sm'
              className='flex items-center space-x-2'
            >
              <Plus className='h-4 w-4' />
              <span className='hidden sm:block'>New Project</span>
            </Button>
          )}

          {/* Session Status */}
          {sessionWarning && (
            <div className='flex items-center space-x-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg'>
              <Clock className='h-4 w-4 text-yellow-500' />
              <span className='text-xs text-yellow-600 font-medium'>
                Session expires soon
              </span>
              <Button
                variant='ghost'
                size='sm'
                onClick={refreshSession}
                className='h-6 w-6 p-0'
              >
                <RefreshCw className='h-3 w-3' />
              </Button>
            </div>
          )}
        </div>

        {/* Center - Search */}
        <div className='relative max-w-md w-full mx-4'>
          <form onSubmit={handleSearch} className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <input
              ref={searchRef}
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Search projects, users, analytics... (Ctrl+K)'
              className='w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
              onFocus={() => setIsSearchOpen(true)}
            />
            <div className='absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1'>
              <kbd className='hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs font-mono bg-muted rounded border'>
                ⌘K
              </kbd>
            </div>
          </form>

          {/* Search Results Dropdown */}
          {isSearchOpen && searchQuery && (
            <div className='absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto'>
              <div className='p-3 border-b border-border'>
                <p className='text-sm text-muted-foreground'>
                  Search results for "{searchQuery}"
                </p>
              </div>
              <div className='p-2'>
                <div className='text-sm text-muted-foreground p-2'>
                  No results found
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className='flex items-center space-x-3'>
          {/* Dark mode toggle */}
          <Button
            variant='ghost'
            size='icon'
            onClick={toggleDarkMode}
            className='h-9 w-9'
            title='Toggle dark mode'
          >
            {isDarkMode ? (
              <Sun className='h-4 w-4' />
            ) : (
              <Moon className='h-4 w-4' />
            )}
          </Button>

          {/* Notifications */}
          <div className='relative' ref={notificationsRef}>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className='h-9 w-9 relative'
              title='Notifications (Ctrl+N)'
            >
              <Bell className='h-4 w-4' />
              {unreadCount > 0 && (
                <span className='absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center font-medium'>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className='absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50'>
                <div className='p-4 border-b border-border'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-sm font-semibold'>Notifications</h3>
                    {unreadCount > 0 && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={markAllAsRead}
                        className='text-xs'
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                </div>
                <div className='max-h-96 overflow-y-auto'>
                  {notifications.length > 0 ? (
                    notifications.map(notification => {
                      const IconComponent = getNotificationIcon(
                        notification.type
                      );
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer ${
                            !notification.read ? 'bg-blue-50/50' : ''
                          }`}
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }
                        >
                          <div className='flex items-start space-x-3'>
                            <IconComponent
                              className={`h-5 w-5 mt-0.5 ${getNotificationColor(
                                notification.type
                              )}`}
                            />
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm font-medium text-foreground'>
                                {notification.title}
                              </p>
                              <p className='text-xs text-muted-foreground mt-1'>
                                {notification.message}
                              </p>
                              <p className='text-xs text-muted-foreground mt-2'>
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className='h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-2' />
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className='p-4 text-center text-muted-foreground'>
                      <Bell className='h-8 w-8 mx-auto mb-2 opacity-50' />
                      <p className='text-sm'>No notifications</p>
                    </div>
                  )}
                </div>
                <div className='p-3 border-t border-border'>
                  <Button variant='ghost' size='sm' className='w-full text-xs'>
                    View all notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* User profile */}
          <div className='relative' ref={profileRef}>
            <Button
              variant='ghost'
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className='flex items-center space-x-2 h-9 px-3'
              title='User profile (Ctrl+P)'
            >
              <div className='relative'>
                <div className='w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center'>
                  <span className='text-xs font-medium text-primary-foreground'>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                {roleInfo && (
                  <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card' />
                )}
              </div>
              <div className='hidden sm:block text-left'>
                <p className='text-sm font-medium text-foreground truncate max-w-32'>
                  {user?.email || 'User'}
                </p>
                {roleInfo && (
                  <p className='text-xs text-muted-foreground flex items-center'>
                    <span className='mr-1'>{roleInfo.icon}</span>
                    {roleInfo.name}
                  </p>
                )}
              </div>
              <ChevronDown className='h-4 w-4' />
            </Button>

            {/* Profile dropdown */}
            {isProfileOpen && (
              <div className='absolute right-0 mt-2 w-72 bg-card border border-border rounded-lg shadow-lg z-50'>
                {/* User Info */}
                <div className='p-4 border-b border-border'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center'>
                      <span className='text-sm font-medium text-primary-foreground'>
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-foreground truncate'>
                        {user?.email || 'User'}
                      </p>
                      {roleInfo && (
                        <p className='text-xs text-muted-foreground flex items-center'>
                          <span className='mr-1'>{roleInfo.icon}</span>
                          {roleInfo.name}
                        </p>
                      )}
                      {sessionInfo && (
                        <p className='text-xs text-muted-foreground mt-1'>
                          Session expires in{' '}
                          {Math.floor(sessionInfo.timeLeft / 60000)}m
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className='p-4 border-b border-border'>
                  <div className='grid grid-cols-3 gap-4 text-center'>
                    <div>
                      <p className='text-lg font-semibold text-foreground'>
                        12
                      </p>
                      <p className='text-xs text-muted-foreground'>Projects</p>
                    </div>
                    <div>
                      <p className='text-lg font-semibold text-foreground'>5</p>
                      <p className='text-xs text-muted-foreground'>
                        Deployments
                      </p>
                    </div>
                    <div>
                      <p className='text-lg font-semibold text-foreground'>
                        98%
                      </p>
                      <p className='text-xs text-muted-foreground'>Uptime</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className='p-2'>
                  <Button
                    variant='ghost'
                    className='w-full justify-start text-sm'
                    onClick={() => {
                      /* Navigate to profile */
                    }}
                  >
                    <User className='h-4 w-4 mr-2' />
                    Profile
                  </Button>
                  <Button
                    variant='ghost'
                    className='w-full justify-start text-sm'
                    onClick={() => {
                      /* Navigate to settings */
                    }}
                  >
                    <Settings className='h-4 w-4 mr-2' />
                    Settings
                  </Button>
                  <Button
                    variant='ghost'
                    className='w-full justify-start text-sm'
                    onClick={() => {
                      /* Navigate to help */
                    }}
                  >
                    <HelpCircle className='h-4 w-4 mr-2' />
                    Help & Support
                  </Button>
                  <div className='border-t border-border my-2' />
                  <Button
                    variant='ghost'
                    className='w-full justify-start text-sm text-destructive hover:text-destructive'
                    onClick={logout}
                  >
                    <LogOut className='h-4 w-4 mr-2' />
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(isProfileOpen || isNotificationsOpen) && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => {
            setIsProfileOpen(false);
            setIsNotificationsOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Navbar;
