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
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [sessionTimeout] = useState(30 * 60 * 1000); // 30 minutes

  // Refs to prevent multiple initializations
  const initializingRef = useRef(false);
  const authListenerRef = useRef(null);
  const mountedRef = useRef(true);
  const loadingRef = useRef(loading);

  // User roles and permissions mapping
  const userRoles = {
    admin: {
      name: 'Administrator',
      permissions: ['*'],
      color: 'red',
      icon: '👑',
    },
    manager: {
      name: 'Manager',
      permissions: [
        'manage_projects',
        'view_analytics',
        'manage_users',
        'deploy',
      ],
      color: 'blue',
      icon: '👔',
    },
    developer: {
      name: 'Developer',
      permissions: [
        'view_projects',
        'edit_projects',
        'deploy',
        'view_analytics',
      ],
      color: 'green',
      icon: '💻',
    },
    viewer: {
      name: 'Viewer',
      permissions: ['view_projects', 'view_analytics'],
      color: 'gray',
      icon: '👁️',
    },
  };

  // Initialize user data
  const initializeUser = useCallback(async (user, session) => {
    console.log(
      'AuthContext: [initializeUser] called, mountedRef.current:',
      mountedRef.current
    );
    if (!mountedRef.current) return;
    try {
      console.log('AuthContext: [initializeUser] START', user?.email);
      setUser(user);
      setSession(session);
      setIsAuthenticated(true);
      setLastActivity(Date.now());

      // Set default profile if database operations fail
      const defaultProfile = {
        id: user.id,
        email: user.email,
        role: 'viewer',
        permissions: ['view_projects', 'view_analytics'],
        preferences: {},
      };

      // Test database connection first
      try {
        console.log(
          'AuthContext: [initializeUser] Testing database connection...'
        );
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        console.log('AuthContext: [initializeUser] Database connection test:', {
          testData,
          testError,
        });
      } catch (testErr) {
        console.warn(
          'AuthContext: [initializeUser] Database connection test failed:',
          testErr
        );
      }

      // Fetch profile with manual timeout
      try {
        console.log('AuthContext: [initializeUser] Fetching profile...');
        let profile = null;
        let error = null;
        try {
          console.log(
            'AuthContext: [initializeUser] Starting profile fetch for user ID:',
            user.id
          );
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Profile fetch timed out')), 5000)
          );
          const fetchPromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          console.log(
            'AuthContext: [initializeUser] Profile fetch promise created'
          );
          const result = await Promise.race([fetchPromise, timeoutPromise]);
          console.log(
            'AuthContext: [initializeUser] Profile fetch completed:',
            result
          );
          // If fetchPromise resolves, result is { data, error }
          // If timeoutPromise rejects, it throws and is caught below
          profile = result.data;
          error = result.error;
        } catch (err) {
          // This will catch the timeout or any thrown error
          console.warn(
            'AuthContext: [initializeUser] Profile fetch timed out or errored:',
            err
          );
          error = err;
          profile = null;
        }
        console.log('AuthContext: [initializeUser] Profile fetch result:', {
          profile,
          error,
        });
        if (error || !profile) {
          console.warn(
            'AuthContext: [initializeUser] Profile not found, using default',
            error
          );
          setUserProfile(defaultProfile);
        } else {
          console.log(
            'AuthContext: [initializeUser] Profile set successfully:',
            profile
          );
          setUserProfile(profile);
        }
      } catch (error) {
        console.warn(
          'AuthContext: [initializeUser] Profile load failed, using default:',
          error
        );
        setUserProfile(defaultProfile);
      }
      console.log('AuthContext: [initializeUser] END', user?.email);
      console.log('AuthContext: [initializeUser] Setting loading to false');
      setLoading(false);

      // Load additional data in background (non-blocking)
      setTimeout(() => {
        if (!mountedRef.current) return;
        // Load login history
        try {
          console.log(
            'AuthContext: [initializeUser] Fetching login history...'
          );
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
                err
              ),
            );
        } catch (err) {
          console.warn(
            'AuthContext: [initializeUser] Login history fetch error:',
            err
          );
        }
        // Load security events
        try {
          console.log(
            'AuthContext: [initializeUser] Fetching security events...'
          );
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
                err
              ),
            );
        } catch (err) {
          console.warn(
            'AuthContext: [initializeUser] Security events fetch error:',
            err
          );
        }
      }, 100);
    } catch (error) {
      console.error(
        'AuthContext: [initializeUser] User initialization failed:',
        error
      );
      if (mountedRef.current) {
        setUser(null);
        setSession(null);
        setUserProfile(null);
        setIsAuthenticated(false);
      }
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

      setSecurityEvents(prev => [event, ...prev.slice(0, 49)]);

      try {
        await supabase.from('security_events').insert([event]);
      } catch (error) {
        console.error('Security event logging failed:', error);
      }
    },
    [user?.id]
  );

  // Get session info
  const getSessionInfo = useCallback(() => {
    if (!session) return null;

    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const timeLeft = expiresAt - now;

    return {
      expiresAt,
      timeLeft,
      isExpired: timeLeft <= 0,
      willExpireSoon: timeLeft <= 5 * 60 * 1000, // 5 minutes
    };
  }, [session]);

  // Initialize auth state and set up listeners
  useEffect(() => {
    mountedRef.current = true; // Ensure this is set at the very start
    if (initializingRef.current) return;
    initializingRef.current = true;

    const initAuth = async () => {
      try {
        console.log('AuthContext: Initializing auth state');
        // Get current session
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        if (currentSession?.user) {
          console.log(
            'AuthContext: Found existing session for user:',
            currentSession.user.email
          );
          try {
            await initializeUser(currentSession.user, currentSession);
          } finally {
            setLoading(false);
            console.log(
              'AuthContext: Loading set to false after user init (initAuth/finally)'
            );
          }
        } else {
          setUser(null);
          setLoading(false);
          console.log(
            'AuthContext: No existing session found, user set to null'
          );
        }
      } catch (error) {
        console.error('AuthContext: Error initializing auth:', error);
        setLoading(false);
      }
    };

    // Set up auth listener - only once
    console.log('AuthContext: Setting up auth listener');
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;
      console.log('AuthContext: Auth state changed:', event);
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          console.log('AuthContext: SIGNED_IN event, initializing user...');
          await initializeUser(session.user, session);
          addSecurityEvent('SIGNED_IN', 'User signed in successfully');
        } catch (error) {
          console.error('AuthContext: Error in SIGNED_IN handler:', error);
          setUser(null);
          setSession(null);
          setUserProfile(null);
          setIsAuthenticated(false);
        } finally {
          setLoading(false);
          console.log(
            'AuthContext: Loading set to false after user init (onAuthStateChange/finally)'
          );
        }
      } else if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setSession(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        setLoading(false);
        console.log(
          'AuthContext: Signed out or no session.user, user set to null'
        );
        addSecurityEvent('SIGNED_OUT', 'User signed out');
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setSession(session);
        setLastActivity(Date.now());
        addSecurityEvent('TOKEN_REFRESHED', 'Session token refreshed');
      }
      if (mountedRef.current) {
        setLoading(false);
      }
    });

    authListenerRef.current = subscription;
    setLoading(true); // Always set loading to true at the start
    initAuth();

    // Set up fallback timeout
    const fallbackTimeout = setTimeout(() => {
      if (mountedRef.current && loadingRef.current) {
        console.log('AuthContext: Fallback timeout reached, stopping loading');
        console.log('AuthContext: Fallback debug:', {
          user,
          session,
          isAuthenticated,
          userProfile,
        });
        setLoading(false);
        // If we have a user but no profile, set a default profile
        if (user && !userProfile) {
          console.log('AuthContext: Setting default profile due to timeout');
          setUserProfile({
            id: user.id,
            email: user.email,
            role: 'viewer',
            permissions: ['view_projects', 'view_analytics'],
            preferences: {},
          });
        }
      }
    }, 5000); // Reduce timeout to 5s for faster recovery

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
        document.removeEventListener(event, updateActivity)
      );
    };
  }, []);

  // Session timeout handler
  const handleSessionTimeout = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      await addSecurityEvent(
        'SESSION_TIMEOUT',
        'Session expired due to inactivity'
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

  // Debug userProfile state changes - reduce logging
  useEffect(() => {
    if (userProfile) {
      console.log('AuthContext: userProfile loaded:', userProfile.email);
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
          `Login failed: ${error.message}`
        );
        throw error;
      }
    },
    [addSecurityEvent]
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      await addSecurityEvent('LOGOUT', 'User logged out');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      if (mountedRef.current) {
        setUser(null);
        setSession(null);
        setUserProfile(null);
        setIsAuthenticated(false);
      }
      localStorage.removeItem('user_preferences');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, [addSecurityEvent]);

  // Register function
  const register = useCallback(
    async userData => {
      try {
        const { error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              full_name: userData.fullName,
              role: userData.role || 'developer',
            },
          },
        });
        if (error) throw error;
        await addSecurityEvent('REGISTRATION_SUCCESS', 'New user registered');
        return { success: true };
      } catch (error) {
        await addSecurityEvent(
          'REGISTRATION_FAILED',
          `Registration failed: ${error.message}`
        );
        throw error;
      }
    },
    [addSecurityEvent]
  );

  // Update profile
  const updateProfile = useCallback(
    async profileData => {
      try {
        const { data, error } = await supabase.auth.updateUser(profileData);
        if (error) throw error;
        await addSecurityEvent('PROFILE_UPDATED', 'User profile updated');
        return data;
      } catch (error) {
        await addSecurityEvent(
          'PROFILE_UPDATE_FAILED',
          `Profile update failed: ${error.message}`
        );
        throw error;
      }
    },
    [addSecurityEvent]
  );

  // Change password
  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) throw error;
        await addSecurityEvent('PASSWORD_CHANGED', 'User password changed');
        return true;
      } catch (error) {
        await addSecurityEvent(
          'PASSWORD_CHANGE_FAILED',
          `Password change failed: ${error.message}`
        );
        throw error;
      }
    },
    [addSecurityEvent]
  );

  // Permission checks
  const hasPermission = useCallback(
    permission => {
      if (!userProfile) return false;
      return (
        userProfile.permissions?.includes('*') ||
        userProfile.permissions?.includes(permission)
      );
    },
    [userProfile]
  );

  const hasRole = useCallback(
    roles => {
      if (!userProfile) return false;
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      return (
        allowedRoles.includes(userProfile.role) || userProfile.role === 'admin'
      );
    },
    [userProfile]
  );

  // Get project permissions
  const getProjectPermissions = useCallback(() => {
    if (!userProfile)
      return { read: false, write: false, deploy: false, admin: false };

    if (userProfile.role === 'admin') {
      return { read: true, write: true, deploy: true, admin: true };
    }

    return {
      read:
        userProfile.permissions?.includes('*') ||
        userProfile.permissions?.includes('view_projects'),
      write:
        userProfile.permissions?.includes('*') ||
        userProfile.permissions?.includes('edit_projects'),
      deploy:
        userProfile.permissions?.includes('*') ||
        userProfile.permissions?.includes('deploy'),
      admin:
        userProfile.permissions?.includes('*') ||
        userProfile.permissions?.includes('manage_projects'),
    };
  }, [userProfile]);

  // Update preferences
  const updatePreferences = useCallback(
    async preferences => {
      try {
        const updatedPreferences = {
          ...userProfile?.preferences,
          ...preferences,
        };

        const { error } = await supabase
          .from('user_profiles')
          .update({ preferences: updatedPreferences })
          .eq('user_id', user?.id);

        if (error) throw error;

        setUserProfile(prev => ({
          ...prev,
          preferences: updatedPreferences,
        }));

        await addSecurityEvent(
          'PREFERENCES_UPDATED',
          'User preferences updated'
        );
        return { success: true };
      } catch (error) {
        await addSecurityEvent(
          'PREFERENCES_UPDATE_FAILED',
          `Preferences update failed: ${error.message}`
        );
        throw error;
      }
    },
    [userProfile, user?.id, addSecurityEvent]
  );

  // Get user role info
  const getUserRoleInfo = useCallback(() => {
    if (!userProfile) return null;
    return userRoles[userProfile.role] || userRoles.viewer;
  }, [userProfile]);

  // Get security events
  const getSecurityEvents = useCallback(() => {
    return securityEvents;
  }, [securityEvents]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        setLastActivity(Date.now());
        await addSecurityEvent(
          'SESSION_REFRESHED',
          'Session refreshed successfully'
        );
      }

      return data;
    } catch (error) {
      await addSecurityEvent(
        'SESSION_REFRESH_FAILED',
        `Session refresh failed: ${error.message}`
      );
      throw error;
    }
  }, [addSecurityEvent]);

  // Memoize context value
  const contextValue = React.useMemo(
    () => ({
      user,
      session,
      userProfile,
      loading,
      isAuthenticated,
      loginHistory,
      securityEvents,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      hasPermission,
      hasRole,
      getProjectPermissions,
      updatePreferences,
      getUserRoleInfo,
      getSecurityEvents,
      refreshSession,
      getSessionInfo,
      lastActivity,
      sessionTimeout,
    }),
    [
      user,
      session,
      userProfile,
      loading,
      isAuthenticated,
      loginHistory,
      securityEvents,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      hasPermission,
      hasRole,
      getProjectPermissions,
      updatePreferences,
      getUserRoleInfo,
      getSecurityEvents,
      refreshSession,
      getSessionInfo,
      lastActivity,
      sessionTimeout,
    ]
  );

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
