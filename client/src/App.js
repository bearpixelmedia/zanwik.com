import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Zap,
  Shield,
  BarChart3,
  Globe,
  Activity,
  TrendingUp,
} from 'lucide-react';
import './App.css';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Infrastructure = lazy(() => import('./pages/Infrastructure'));
const Monitoring = lazy(() => import('./pages/Monitoring'));
const Users = lazy(() => import('./pages/Users'));
const Settings = lazy(() => import('./pages/Settings'));
const Deployment = lazy(() => import('./pages/Deployment'));

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error to console in all environments
    console.error('Error caught by boundary:', error, errorInfo);

    // Optionally send error to a remote logging service
    if (window && window.fetch) {
      try {
        fetch('/error-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: error.toString(),
            errorInfo: errorInfo?.componentStack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (e) {
        // Ignore logging errors
      }
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, color: 'red', background: '#fff0f0' }}>
          <h2>Something went wrong.</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error && this.state.error.toString()}
            {'\n'}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <p>Please contact support with the above error message.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Enhanced Loading Component
const LoadingScreen = ({ message = 'Loading...' }) => (
  <div className='min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center'>
    <div className='text-center space-y-6'>
      {/* Logo and Branding */}
      <div className='space-y-4'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl'>
          <img src="/zanwik-icon.svg" alt="Zanwik" className="w-8 h-8" />
        </div>
        <h2 className='text-2xl font-bold text-foreground'>Zanwik Dashboard</h2>
      </div>

      {/* Loading Animation */}
      <div className='space-y-4'>
        <div className='relative'>
          <div className='h-12 w-12 animate-spin text-primary mx-auto border-4 border-primary border-t-transparent rounded-full' />
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='w-8 h-8 bg-background rounded-full' />
          </div>
        </div>

        {/* Loading Steps */}
        <div className='space-y-2'>
          <div className='flex items-center justify-center space-x-2'>
            <div className='h-2 w-2 bg-green-500 rounded-full animate-pulse' />
            <span className='text-sm text-muted-foreground'>
              Initializing...
            </span>
          </div>
          <div className='flex items-center justify-center space-x-2'>
            <div className='h-2 w-2 bg-blue-500 rounded-full animate-pulse' />
            <span className='text-sm text-muted-foreground'>
              Loading components...
            </span>
          </div>
          <div className='flex items-center justify-center space-x-2'>
            <div className='h-2 w-2 bg-purple-500 rounded-full animate-pulse' />
            <span className='text-sm text-muted-foreground'>{message}</span>
          </div>
        </div>
      </div>

      {/* Feature Indicators */}
      <div className='grid grid-cols-3 gap-4 text-center'>
        <div className='flex flex-col items-center space-y-1'>
          <Shield className='h-5 w-5 text-green-500' />
          <p className='text-xs text-muted-foreground'>Secure</p>
        </div>
        <div className='flex flex-col items-center space-y-1'>
          <BarChart3 className='h-5 w-5 text-blue-500' />
          <p className='text-xs text-muted-foreground'>Analytics</p>
        </div>
        <div className='flex flex-col items-center space-y-1'>
          <Activity className='h-5 w-5 text-purple-500' />
          <p className='text-xs text-muted-foreground'>Real-time</p>
        </div>
      </div>
    </div>
  </div>
);

// Route Transition Component
const RouteTransition = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 150);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      className={`
      transition-opacity duration-150 ease-in-out
      ${isTransitioning ? 'opacity-0' : 'opacity-100'}
    `}
    >
      {children}
    </div>
  );
};

// Enhanced Private Route with better loading and error handling
const PrivateRoute = ({
  children,
  requiredRole = null,
  requiredPermissions = [],
}) => {
  const { user, loading, hasPermission, hasRole } = useAuth();

  console.log('PrivateRoute: Checking auth', {
    user: !!user,
    loading,
    hasUser: !!user,
  });

  if (loading) {
    console.log('PrivateRoute: Still loading, showing loading screen');
    return <LoadingScreen message='Authenticating...' />;
  }

  if (!user) {
    console.log('PrivateRoute: No user found, redirecting to login');
    return <Navigate to='/login' replace />;
  }

  console.log('PrivateRoute: User authenticated, checking permissions');

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center p-4'>
        <div className='text-center space-y-6 max-w-md'>
          <div className='space-y-4'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl'>
              <Shield className='w-8 h-8 text-white' />
            </div>
            <h2 className='text-2xl font-bold text-foreground'>
              Access Restricted
            </h2>
            <p className='text-muted-foreground'>
              You don't have permission to access this page. Required role:{' '}
              {requiredRole}
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className='w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors'
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check permission requirements
  if (
    requiredPermissions.length > 0 &&
    !requiredPermissions.every(permission => hasPermission(permission))
  ) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center p-4'>
        <div className='text-center space-y-6 max-w-md'>
          <div className='space-y-4'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl'>
              <Shield className='w-8 h-8 text-white' />
            </div>
            <h2 className='text-2xl font-bold text-foreground'>
              Insufficient Permissions
            </h2>
            <p className='text-muted-foreground'>
              You don't have the required permissions to access this page.
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className='w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors'
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  console.log('PrivateRoute: All checks passed, rendering children');
  return children;
};

// Enhanced App Layout with better structure
const AppLayout = ({ children }) => {
  const { getSessionInfo } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sessionInfo = getSessionInfo();

  return (
    <div className='flex h-screen bg-background overflow-hidden'>
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className='flex-1 flex flex-col overflow-hidden'>
        <Navbar
          sidebarCollapsed={sidebarCollapsed}
          onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className='flex-1 overflow-y-auto bg-muted/20'>
          <div className='container mx-auto p-6'>
            <RouteTransition>
              <Suspense fallback={<LoadingScreen message='Loading page...' />}>
                {children}
              </Suspense>
            </RouteTransition>
          </div>
        </main>

        {/* Session Warning */}
        {sessionInfo?.willExpireSoon && (
          <div className='fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse'>
            <div className='flex items-center space-x-2'>
              <AlertTriangle className='h-4 w-4' />
              <span className='text-sm'>
                Session expires in {Math.floor(sessionInfo.timeLeft / 60000)}m
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Performance monitoring hook
const usePerformanceMonitoring = () => {
  console.log('usePerformanceMonitoring: Starting');
  useEffect(() => {
    console.log('usePerformanceMonitoring: Setting up observer');
    // Monitor page load performance
    if ('performance' in window) {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            console.log(
              'Page load time:',
              entry.loadEventEnd - entry.loadEventStart,
              'ms',
            );
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });

      return () => observer.disconnect();
    }
  }, []);
};

// Analytics tracking hook
const useAnalytics = () => {
  console.log('useAnalytics: Starting');
  const location = useLocation();

  useEffect(() => {
    console.log('useAnalytics: Setting up analytics');
    // Track page views
    if (process.env.NODE_ENV === 'production') {
      // Example: Google Analytics
      // gtag('config', 'GA_MEASUREMENT_ID', { page_path: location.pathname });
      console.log('Page view:', location.pathname);
    }
  }, [location.pathname]);
};

// Analytics wrapper component
const AnalyticsWrapper = () => {
  useAnalytics();
  return null;
};

// Main App Component
const App = () => {
  console.log('App: Component starting');

  usePerformanceMonitoring();

  console.log('App: About to render');

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AnalyticsWrapper />
          <div className='App'>
            <Routes>
              {/* Public Routes */}
              <Route path='/login' element={<Login />} />

              {/* Protected Routes */}
              <Route
                path='/'
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path='/dashboard'
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path='/projects'
                element={
                  <PrivateRoute requiredPermissions={['view_projects']}>
                    <AppLayout>
                      <Projects />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path='/analytics'
                element={
                  <PrivateRoute requiredPermissions={['view_analytics']}>
                    <AppLayout>
                      <Analytics />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path='/infrastructure'
                element={
                  <PrivateRoute requiredPermissions={['view_infrastructure']}>
                    <AppLayout>
                      <Infrastructure />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path='/monitoring'
                element={
                  <PrivateRoute requiredPermissions={['view_monitoring']}>
                    <AppLayout>
                      <Monitoring />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path='/deployment'
                element={
                  <PrivateRoute requiredPermissions={['deploy']}>
                    <AppLayout>
                      <Deployment />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path='/users'
                element={
                  <PrivateRoute requiredRole='admin'>
                    <AppLayout>
                      <Users />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path='/settings'
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Settings />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              {/* 404 Route */}
              <Route path='*' element={<Navigate to='/login' replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
