// AuthContext loaded
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [sessionTimeout] = useState(30 * 60 * 1000); // 30 minutes
  const [loadingStuck, setLoadingStuck] = useState(false);
  const [error, setError] = useState(null);

  // Default profile for fallback
  const _defaultProfile = {
    id: user?.id || null,
    email: user?.email || '',
    role: 'viewer',
    permissions: ['view_projects', 'view_analytics'],
    preferences: {},
  };

  // Test database connection function
  const _testConnection = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .select('count')
        .limit(1);
      return !error;
    } catch (err) {
      console.warn('Database connection test failed:', err);
      return false;
    }
  }, []);

  // Refs to prevent multiple initializations
  const initializingRef = useRef(false);
  const authListenerRef = useRef(null);
  const mountedRef = useRef(true);
  const loadingRef = useRef(loading);

  // Initialize user data
  const initializeUser = useCallback(async user => {
    if (!mountedRef.current) return;
    try {
      setLoading(true);
      setError(null);

      // Set user immediately
      setUser(user);
      setIsAuthenticated(true);

      // Set default profile immediately to prevent loading stuck
      const userDefaultProfile = {
        id: user.id,
        email: user.email,
        role: 'viewer',
        permissions: ['view_projects', 'view_analytics'],
        preferences: {},
      };

      // Try to fetch profile with shorter timeout
      let profile = null;
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timed out')), 3000),
        );
        const fetchPromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        const result = await Promise.race([fetchPromise, timeoutPromise]);
        if (result.data && !result.error) {
          profile = result.data;
        }
      } catch (err) {
        console.warn('Profile fetch failed, using default:', err.message);
        profile = null;
      }

      // Always set a profile (either fetched or default)
      setUserProfile(profile || userDefaultProfile);
      setLoading(false);
      setLoadingStuck(false);

      // Load additional data in background (non-blocking)
      setTimeout(() => {
        if (!mountedRef.current) return;

        // Load login history
        supabase
          .from('login_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
          .then(({ data }) => {
            if (mountedRef.current && data) {
              setLoginHistory(data);
            }
          })
          .catch(err =>
            console.warn(
              'AuthContext: [initializeUser] Login history load failed:',
              err,
            ),
          );

        // Load security events
        supabase
          .from('security_events')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)
          .then(({ data }) => {
            if (mountedRef.current && data) {
              setSecurityEvents(data);
            }
          })
          .catch(err =>
            console.warn(
              'AuthContext: [initializeUser] Security events load failed:',
              err,
            ),
          );
      }, 100);
    } catch (error) {
      console.error('AuthContext: Error initializing user:', error);
      setError(error.message);
      setUserProfile({
        id: user.id,
        email: user.email,
        role: 'viewer',
        permissions: ['view_projects', 'view_analytics'],
        preferences: {},
      });
      setLoading(false);
      setLoadingStuck(false);
    }
  }, []);

  // Add security event
  const addSecurityEvent = useCallback(
    async (eventType, description) => {
      if (!mountedRef.current) return;

      const event = {
        user_id: user?.id || null,
        event_type: eventType,
        description,
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      try {
        await supabase.from('security_events').insert([event]);
        setSecurityEvents(prev => [event, ...prev.slice(0, 19)]);
      } catch (error) {
        console.warn('Failed to log security event:', error);
      }
    },
    [user?.id],
  );

  // Get session info
  const getSessionInfo = useCallback(() => {
    return {
      user,
      isAuthenticated,
      lastActivity,
      sessionTimeout,
      timeRemaining: sessionTimeout - (Date.now() - lastActivity),
    };
  }, [user, isAuthenticated, lastActivity, sessionTimeout]);

  // Initialize auth state
  useEffect(() => {
    mountedRef.current = true;
    if (initializingRef.current) return;
    initializingRef.current = true;

    const initAuth = async () => {
      try {
        // Get current session
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (currentSession?.user) {
          await initializeUser(currentSession.user);
        } else {
          setUser(null);
          setUserProfile(null);
          setIsAuthenticated(false);
          setLoading(false);
          setLoadingStuck(false);
        }
      } catch (error) {
        console.error('AuthContext: Error initializing auth:', error);
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        setLoading(false);
        setLoadingStuck(false);
      }
    };

    // Set up auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          await initializeUser(session.user);
          addSecurityEvent('SIGNED_IN', 'User signed in successfully');
        } catch (error) {
          console.error('AuthContext: Error in SIGNED_IN handler:', error);
          setUser(null);
          setUserProfile(null);
          setIsAuthenticated(false);
          setLoading(false);
          setLoadingStuck(false);
        }
      } else if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        setLoading(false);
        setLoadingStuck(false);
        addSecurityEvent('SIGNED_OUT', 'User signed out');
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setLastActivity(Date.now());
        addSecurityEvent('TOKEN_REFRESHED', 'Session token refreshed');
      }
    });

    authListenerRef.current = subscription;
    setLoading(true);
    setLoadingStuck(false);
    initAuth();

    // Reduced fallback timeout to 5 seconds
    const fallbackTimeout = setTimeout(() => {
      if (mountedRef.current && loading) {
        console.warn(
          'AuthContext: Fallback timeout reached, forcing loading to complete',
        );
        setLoadingStuck(true);
        setLoading(false);

        // If we have a user but no profile, set a default profile
        if (user && !userProfile) {
          setUserProfile({
            id: user.id,
            email: user.email,
            role: 'viewer',
            permissions: ['view_projects', 'view_analytics'],
            preferences: {},
          });
        }
      }
    }, 5000); // Reduced from 7 to 5 seconds

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
        authListenerRef.current = null;
      }
      clearTimeout(fallbackTimeout);
      mountedRef.current = false;
    };
  }, [initializeUser, addSecurityEvent]);

  // Activity tracking
  useEffect(() => {
    const updateActivity = () => {
      if (mountedRef.current) {
        setLastActivity(Date.now());
      }
    };

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
        document.removeEventListener(event, updateActivity),
      );
    };
  }, []);

  // Session timeout handler
  const handleSessionTimeout = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      await addSecurityEvent(
        'SESSION_TIMEOUT',
        'Session expired due to inactivity',
      );
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Session timeout handling failed:', error);
    }
  }, [addSecurityEvent]);

  // Session timeout check
  useEffect(() => {
    if (!isAuthenticated || !mountedRef.current) return;

    const checkSession = () => {
      if (!mountedRef.current) return;

      const timeSinceActivity = Date.now() - lastActivity;
      if (timeSinceActivity >= sessionTimeout) {
        handleSessionTimeout();
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity, sessionTimeout, handleSessionTimeout]);

  // Debug: Log userProfile changes
  useEffect(() => {
    if (userProfile?.email) {
      // AuthContext: userProfile loaded - removed console.log for lint compliance
    }
  }, [userProfile]);

  // Login function
  const login = useCallback(
    async (email, password) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        await addSecurityEvent('LOGIN_SUCCESS', 'User logged in successfully');
        return { success: true };
      } catch (error) {
        console.error('Login failed:', error);
        await addSecurityEvent(
          'LOGIN_FAILED',
          `Login failed: ${error.message}`,
        );
        throw error;
      }
    },
    [addSecurityEvent],
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      await addSecurityEvent('LOGOUT', 'User logged out');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      if (mountedRef.current) {
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
      }
      localStorage.removeItem('user_preferences');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, [addSecurityEvent]);

  // Permission checks
  const hasPermission = useCallback(
    permission => {
      return (
        userProfile?.permissions?.includes('*') ||
        userProfile?.permissions?.includes(permission)
      );
    },
    [userProfile],
  );

  const hasRole = useCallback(
    roles => {
      return roles.some(role => userProfile?.role === role);
    },
    [userProfile],
  );

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userProfile,
        loginHistory,
        securityEvents,
        isAuthenticated,
        lastActivity,
        sessionTimeout,
        login,
        logout,
        hasPermission,
        hasRole,
        getSessionInfo,
        loadingStuck,
        error,
      }}
    >
      {loadingStuck ? (
        <div style={{ color: 'red', padding: 32, textAlign: 'center' }}>
          <h2>⚠️ Authentication is taking too long</h2>
          <p>
            The app is stuck while checking authentication. This usually means a
            network issue, missing environment variable, or a Supabase config
            problem.
          </p>
          <pre
            style={{
              textAlign: 'left',
              margin: '1em auto',
              maxWidth: 600,
              background: '#fff0f0',
              padding: 16,
              borderRadius: 8,
            }}
          >
            {JSON.stringify(
              { user, isAuthenticated, userProfile, error },
              null,
              2,
            )}
          </pre>
          <p>
            Please check your browser console and network tab for errors, and
            verify your environment variables.
          </p>
        </div>
      ) : userProfile && userProfile.error ? (
        <div style={{ color: 'red', padding: 32, textAlign: 'center' }}>
          <h2>⚠️ Profile Not Found</h2>
          <p>{userProfile.error}</p>
          <p>Please contact support or try logging out and logging in again.</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
