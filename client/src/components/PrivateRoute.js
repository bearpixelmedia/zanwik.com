import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Lock,
  RefreshCw,
  Zap,
  Users,
  BarChart3,
} from 'lucide-react';

const PrivateRoute = ({
  children,
  requiredRole = null,
  requiredPermissions = [],
}) => {
  const { isAuthenticated, loading, user, userProfile, logout } = useAuth();
  const location = useLocation();
  const [sessionWarning, setSessionWarning] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [securityCheck, setSecurityCheck] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Session timeout configuration (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000;
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];
    events.forEach(event => document.addEventListener(event, updateActivity));

    return () => {
      events.forEach(event =>
        document.removeEventListener(event, updateActivity)
      );
    };
  }, []);

  // Check session timeout
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = () => {
      const timeSinceActivity = Date.now() - lastActivity;

      if (timeSinceActivity >= SESSION_TIMEOUT) {
        setSessionExpired(true);
        logout();
      } else if (timeSinceActivity >= SESSION_TIMEOUT - WARNING_TIME) {
        setSessionWarning(true);
      }
    };

    const interval = setInterval(checkSession, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity, logout]);

  // Security check simulation
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const performSecurityCheck = async () => {
        setSecurityCheck(true);
        // Simulate security validation
        await new Promise(resolve => setTimeout(resolve, 800));
        setSecurityCheck(false);
      };

      performSecurityCheck();
    }
  }, [isAuthenticated, loading]);

  // Enhanced loading component
  const LoadingScreen = () => (
    <div className='min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center'>
      <div className='text-center space-y-6'>
        {/* Logo and Branding */}
        <div className='space-y-4'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl'>
            <Zap className='w-8 h-8 text-primary-foreground' />
          </div>
          <h2 className='text-2xl font-bold text-foreground'>
            Zanwik Dashboard
          </h2>
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
              <CheckCircle className='h-4 w-4 text-green-500' />
              <span className='text-sm text-muted-foreground'>
                Authenticating...
              </span>
            </div>
            <div className='flex items-center justify-center space-x-2'>
              {securityCheck ? (
                <>
                  <div className='h-4 w-4 animate-spin text-primary border-2 border-primary border-t-transparent rounded-full' />
                  <span className='text-sm text-muted-foreground'>
                    Security check...
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                  <span className='text-sm text-muted-foreground'>
                    Security verified
                  </span>
                </>
              )}
            </div>
            <div className='flex items-center justify-center space-x-2'>
              <div className='h-4 w-4 animate-spin text-primary border-2 border-primary border-t-transparent rounded-full' />
              <span className='text-sm text-muted-foreground'>
                Loading dashboard...
              </span>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className='grid grid-cols-3 gap-4 pt-4'>
          <div className='flex flex-col items-center space-y-1'>
            <Shield className='h-5 w-5 text-green-500' />
            <p className='text-xs text-muted-foreground'>Secure</p>
          </div>
          <div className='flex flex-col items-center space-y-1'>
            <Lock className='h-5 w-5 text-blue-500' />
            <p className='text-xs text-muted-foreground'>Protected</p>
          </div>
          <div className='flex flex-col items-center space-y-1'>
            <BarChart3 className='h-5 w-5 text-purple-500' />
            <p className='text-xs text-muted-foreground'>Analytics</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Session warning modal
  const SessionWarningModal = () => (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-card border border-border rounded-lg p-6 max-w-md mx-4'>
        <div className='flex items-center space-x-3 mb-4'>
          <AlertTriangle className='h-6 w-6 text-yellow-500' />
          <h3 className='text-lg font-semibold'>Session Expiring Soon</h3>
        </div>
        <p className='text-muted-foreground mb-4'>
          Your session will expire in 5 minutes due to inactivity. Would you
          like to extend your session?
        </p>
        <div className='flex space-x-3'>
          <button
            onClick={() => {
              setLastActivity(Date.now());
              setSessionWarning(false);
            }}
            className='flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors'
          >
            Extend Session
          </button>
          <button
            onClick={() => {
              setSessionWarning(false);
              logout();
            }}
            className='flex-1 bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors'
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );

  // Session expired modal
  const SessionExpiredModal = () => (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-card border border-border rounded-lg p-6 max-w-md mx-4'>
        <div className='flex items-center space-x-3 mb-4'>
          <Clock className='h-6 w-6 text-red-500' />
          <h3 className='text-lg font-semibold'>Session Expired</h3>
        </div>
        <p className='text-muted-foreground mb-4'>
          Your session has expired due to inactivity. Please log in again to
          continue.
        </p>
        <button
          onClick={() => {
            setSessionExpired(false);
            window.location.href = '/login';
          }}
          className='w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors'
        >
          Go to Login
        </button>
      </div>
    </div>
  );

  // Access denied component
  const AccessDenied = () => (
    <div className='min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4'>
      <div className='text-center space-y-6 max-w-md'>
        <div className='space-y-4'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl'>
            <Lock className='w-8 h-8 text-white' />
          </div>
          <h2 className='text-2xl font-bold text-foreground'>Access Denied</h2>
          <p className='text-muted-foreground'>
            You don't have permission to access this page. Please contact your
            administrator if you believe this is an error.
          </p>
        </div>

        <div className='space-y-3'>
          <button
            onClick={() => window.history.back()}
            className='w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors'
          >
            Go Back
          </button>
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className='w-full bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors'
          >
            Go to Dashboard
          </button>
        </div>

        {requiredRole && (
          <div className='p-4 bg-muted/50 rounded-lg'>
            <p className='text-sm text-muted-foreground'>
              <strong>Required Role:</strong> {requiredRole}
            </p>
            {userProfile?.role && (
              <p className='text-sm text-muted-foreground'>
                <strong>Your Role:</strong> {userProfile?.role || 'Unknown'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Check if user has required role
  const hasRequiredRole = () => {
    if (!requiredRole) return true;
    if (!userProfile?.role) return false;
    return userProfile?.role === requiredRole || userProfile?.role === 'admin';
  };

  // Check if user has required permissions
  const hasRequiredPermissions = () => {
    if (requiredPermissions.length === 0) return true;
    if (!userProfile?.permissions) return false;
    return requiredPermissions.every(permission =>
      userProfile?.permissions?.includes(permission)
    );
  };

  if (loading || securityCheck) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  // If we have a user but no profile, still allow access (profile will be loaded)
  if (!userProfile) {
    return <LoadingScreen />;
  }

  if (!hasRequiredRole() || !hasRequiredPermissions()) {
    return <AccessDenied />;
  }

  if (sessionExpired) {
    return <SessionExpiredModal />;
  }

  return (
    <>
      {sessionWarning && <SessionWarningModal />}
      {children}
    </>
  );
};

export default PrivateRoute;
