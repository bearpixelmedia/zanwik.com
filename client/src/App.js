import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.js';
import Sidebar from './components/Sidebar.js';
import Navbar from './components/Navbar.js';
import Login from './pages/Login.js';
import { AlertTriangle, Shield, BarChart3, Activity } from 'lucide-react';
import './App.css';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard.js'));
const Projects = lazy(() => import('./pages/Projects.js'));
const Analytics = lazy(() => import('./pages/Analytics.js'));
const Infrastructure = lazy(() => import('./pages/Infrastructure.js'));
const Monitoring = lazy(() => import('./pages/Monitoring.js'));
const Users = lazy(() => import('./pages/Users.js'));
const Settings = lazy(() => import('./pages/Settings.js'));
const Deployment = lazy(() => import('./pages/Deployment.js'));
const Security = lazy(() => import('./pages/Security.js'));
const Performance = lazy(() => import('./pages/Performance.js'));
const Alerts = lazy(() => import('./pages/Alerts.js'));

// Enhanced Loading Component
const LoadingScreen = ({ message = 'Loading...' }) => (
  <div className='min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center'>
    <div className='text-center space-y-6'>
      {/* Logo and Branding */}
      <div className='space-y-4'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl'>
          <img src='/zanwik-icon.svg' alt='Zanwik' className='w-8 h-8' />
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

// Redirect authenticated users away from login page
const AuthenticatedRedirect = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message='Checking authentication...' />;
  }

  if (user) {
    return <Navigate to='/dashboard' replace />;
  }

  return children;
};

// Enhanced Private Route with better loading and error handling
const PrivateRoute = ({
  children,
  requiredRole = null,
  requiredPermissions = [],
}) => {
  const { user, loading, hasPermission, hasRole } = useAuth();

  if (loading) {
    return <LoadingScreen message='Authenticating...' />;
  }

  if (!user) {
    return <Navigate to='/login' replace />;
  }

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
  useEffect(() => {
    // Monitor page load performance
    if ('performance' in window) {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            // Page load time monitoring - removed console.log for lint compliance
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
  const location = useLocation();

  useEffect(() => {
    // Track page views
    if (process.env.NODE_ENV === 'production') {
      // Example: Google Analytics
      // gtag('config', 'GA_MEASUREMENT_ID', { page_path: location.pathname });
      // Page view tracking - removed console.log for lint compliance
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
  usePerformanceMonitoring();

  return (
    <AuthProvider>
      <Router>
        <AnalyticsWrapper />
        <div className='App'>
          <Routes>
            {/* Public Routes */}
            <Route
              path='/login'
              element={
                <AuthenticatedRedirect>
                  <Login />
                </AuthenticatedRedirect>
              }
            />

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

            <Route
              path='/security'
              element={
                <PrivateRoute requiredPermissions={['view_security']}>
                  <AppLayout>
                    <Security />
                  </AppLayout>
                </PrivateRoute>
              }
            />

            <Route
              path='/performance'
              element={
                <PrivateRoute requiredPermissions={['view_performance']}>
                  <AppLayout>
                    <Performance />
                  </AppLayout>
                </PrivateRoute>
              }
            />

            <Route
              path='/alerts'
              element={
                <PrivateRoute requiredPermissions={['view_alerts']}>
                  <AppLayout>
                    <Alerts />
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
  );
};

export default App;
