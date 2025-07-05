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
    if (!mountedRef.current) return;

    try {
      console.log('AuthContext: Initializing user', user?.email);
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

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error || !profile) {
          console.warn('Profile not found, using default');
          setUserProfile(defaultProfile);
        } else {
          setUserProfile(profile);
        }
      } catch (error) {
        console.warn('Profile load failed, using default:', error);
        setUserProfile(defaultProfile);
      }

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
          .catch(err => console.warn('Login history load failed:', err));

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
          .catch(err => console.warn('Security events load failed:', err));
      }, 100);
    } catch (error) {
      console.error('User initialization failed:', error);
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

  // Initialize auth - only runs once
  useEffect(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    console.log('AuthContext: Starting initialization');

    const initAuth = async () => {
      try {
        console.log('AuthContext: Getting initial session');

        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 3000),
        );

        const {
          data: { session },
        } = await Promise.race([sessionPromise, timeoutPromise]);

        console.log('AuthContext: Session check completed', !!session);

        if (session?.user && mountedRef.current) {
          console.log('AuthContext: User found, initializing');
          await initializeUser(session.user, session);
        } else if (mountedRef.current) {
          console.log(
            'AuthContext: No user found, setting unauthenticated state',
          );
          setUser(null);
          setSession(null);
          setUserProfile(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mountedRef.current) {
          setUser(null);
          setSession(null);
          setUserProfile(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mountedRef.current) {
          console.log('AuthContext: Setting loading to false');
          setLoading(false);
        }
      }
    };

    // Add a fallback timeout to ensure loading is always set to false
    const fallbackTimeout = setTimeout(() => {
      if (mountedRef.current && loading) {
        console.log('AuthContext: Fallback timeout - setting loading to false');
        setLoading(false);
      }
    }, 5000);

    initAuth();

    return () => {
      clearTimeout(fallbackTimeout);
    };

    // Set up auth listener - only once
      console.log('AuthContext: Setting up auth listener');
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mountedRef.current) return;

        console.log('AuthContext: Auth state changed:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          await initializeUser(session.user, session);
          addSecurityEvent('SIGNED_IN', 'User signed in successfully');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setUserProfile(null);
          setIsAuthenticated(false);
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

    }

      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
        authListenerRef.current = null;
      }
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
  }, [isAuthenticated, lastActivity, sessionTimeout]);

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
    [userProfile],
  );

  // Get project permissions
  const getProjectPermissions = useCallback(
    

      if (userProfile.role === 'admin') {
        return { read: true, write: true, deploy: true, admin: true };
      }

      return {
        read: hasPermission('view_projects'),
        write: hasPermission('edit_projects'),
        deploy: hasPermission('deploy'),
        admin: hasPermission('manage_projects'),
      };
    },
    [userProfile, hasPermission],
  );

  // Update preferences
  const updatePreferences = useCallback(
    async preferences => {
      try {
        const updatedPreferences = {
          ...userProfile?.preferences,
        const updatedPreferences = {
          ...userProfile?.preferences,
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
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      throw error;
    }
  }, [addSecurityEvent]);

  // Get session info
  const getSessionInfo = useCallback(() => {,
    if (!session) return null;

    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const timeLeft = expiresAt - now;

    return {
      expiresAt,
      timeLeft,
      isExpired: timeLeft <= 0,
      willExpireSoon: timeLeft <= 5 * 60 * 1000, // 5 minutes,
    };
  }, [session]);

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
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
