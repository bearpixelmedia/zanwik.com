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
  console.log('AuthProvider: Initializing');
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [sessionTimeout, setSessionTimeout] = useState(30 * 60 * 1000); // 30 minutes

  // Use refs to prevent infinite loops
  const initializedRef = useRef(false);
  const authListenerRef = useRef(null);
  const mountedRef = useRef(false);

  console.log('AuthProvider: State initialized');

  // User roles and permissions mapping
  const userRoles = {
    admin: {
      name: 'Administrator',
      permissions: ['*'], // All permissions
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

  console.log('AuthProvider: User roles defined');

  // Update last activity on user interaction
  useEffect(() => {
    console.log('AuthProvider: Setting up activity listeners');
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
    console.log('AuthProvider: Setting up session timeout check');
    if (!isAuthenticated) return;

    const checkSession = () => {
      const timeSinceActivity = Date.now() - lastActivity;
      if (timeSinceActivity >= sessionTimeout) {
        handleSessionTimeout();
      }
    };

    const interval = setInterval(checkSession, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity, sessionTimeout]);

  // Initialize user data - memoized to prevent recreation
  const initializeUser = useCallback(async (user, session) => {
    try {
      console.log('AuthProvider: Initializing user data');
      
      // Check if component is still mounted
      if (!mountedRef.current) {
        console.log('AuthProvider: Component unmounted, skipping user initialization');
        return;
      }
      
      setUser(user);
      setSession(session);
      setIsAuthenticated(true);
      setLastActivity(Date.now());

      // Load user profile (don't block on this)
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.warn('Profile load failed:', profileError);
          // Set default profile
          setUserProfile({
            id: user.id,
            email: user.email,
            role: 'viewer',
            permissions: ['view_projects', 'view_analytics'],
            preferences: {},
          });
        } else {
          setUserProfile(profile);
        }
      } catch (profileError) {
        console.warn('Profile load error:', profileError);
        // Set default profile
        setUserProfile({
          id: user.id,
          email: user.email,
          role: 'viewer',
          permissions: ['view_projects', 'view_analytics'],
          preferences: {},
        });
      }

      // Load login history (don't block on this)
      try {
        const { data: history, error: historyError } = await supabase
          .from('login_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!historyError && history) {
          setLoginHistory(history);
        }
      } catch (historyError) {
        console.warn('Login history load error:', historyError);
      }

      // Load security events (don't block on this)
      try {
        const { data: events, error: eventsError } = await supabase
          .from('security_events')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!eventsError && events) {
          setSecurityEvents(events);
        }
      } catch (eventsError) {
        console.warn('Security events load error:', eventsError);
      }

      console.log('AuthProvider: User initialization complete');
    } catch (error) {
      console.error('User initialization failed:', error);
      
      // Check if component is still mounted before updating state
      if (mountedRef.current) {
        setUser(null);
        setSession(null);
        setUserProfile(null);
        setIsAuthenticated(false);
      }
    }
  }, []);

  // Check if user is authenticated on mount - only run once
  useEffect(() => {
    if (initializedRef.current || mountedRef.current) {
      console.log('AuthProvider: Already initialized or mounted, skipping');
      return;
    }

    console.log('AuthProvider: Starting auth check');
    initializedRef.current = true;
    mountedRef.current = true;

    const checkAuth = async () => {
      try {
        console.log('AuthProvider: Getting user and session');
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth check timeout')), 10000)
        );
        
        const authPromise = Promise.all([
          supabase.auth.getUser(),
          supabase.auth.getSession()
        ]);
        
        const [userResult, sessionResult] = await Promise.race([
          authPromise,
          timeoutPromise
        ]);
        
        const { data: { user } } = userResult;
        const { data: { session } } = sessionResult;

        console.log('AuthProvider: User and session retrieved', { user: !!user, session: !!session });

        if (user && session) {
          console.log('AuthProvider: Initializing user');
          await initializeUser(user, session);
        } else {
          console.log('AuthProvider: No user or session found');
          if (mountedRef.current) {
            setUser(null);
            setSession(null);
            setUserProfile(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (mountedRef.current) {
          setUser(null);
          setSession(null);
          setUserProfile(null);
          setIsAuthenticated(false);
        }
      } finally {
        console.log('AuthProvider: Setting loading to false');
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Listen for auth state changes - only set up once
    if (!authListenerRef.current) {
      console.log('AuthProvider: Setting up auth state listener');
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        // Check if component is still mounted
        if (!mountedRef.current) {
          console.log('AuthProvider: Component unmounted, ignoring auth state change');
          return;
        }

        console.log('Auth state changed:', event, session);

        if (event === 'SIGNED_IN' && session?.user) {
          await initializeUser(session.user, session);
          addSecurityEvent('SIGNED_IN', 'User signed in successfully');
        } else if (event === 'SIGNED_OUT') {
          if (mountedRef.current) {
            setUser(null);
            setSession(null);
            setUserProfile(null);
            setIsAuthenticated(false);
          }
          addSecurityEvent('SIGNED_OUT', 'User signed out');
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          if (mountedRef.current) {
            setSession(session);
            setLastActivity(Date.now());
          }
          addSecurityEvent('TOKEN_REFRESHED', 'Session token refreshed');
        }

        if (mountedRef.current) {
          setLoading(false);
        }
      });

      authListenerRef.current = subscription;
    }

    // Cleanup function
    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, [initializeUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
        authListenerRef.current = null;
      }
      initializedRef.current = false;
      mountedRef.current = false;
    };
  }, []);

  // Add security event
  const addSecurityEvent = async (eventType, description) => {
    const event = {
      user_id: user?.id || null,
      event_type: eventType,
      description,
      ip_address: '127.0.0.1', // In real app, get from request
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    setSecurityEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events

    try {
      await supabase.from('security_events').insert([event]);
    } catch (error) {
      console.error('Security event logging failed:', error);
    }
  };

  // Handle session timeout
  const handleSessionTimeout = async () => {
    addSecurityEvent('SESSION_TIMEOUT', 'Session expired due to inactivity');
    await logout();
  };

  // Login function with enhanced security
  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email);

      // Check for rate limiting
      const loginAttempts =
        localStorage.getItem(`login_attempts_${email}`) || 0;
      if (loginAttempts >= 5) {
        const lastAttempt = localStorage.getItem(`last_attempt_${email}`);
        if (Date.now() - lastAttempt < 15 * 60 * 1000) {
          // 15 minutes
          throw new Error(
            'Too many login attempts. Please wait 15 minutes before trying again.'
          );
        } else {
          localStorage.removeItem(`login_attempts_${email}`);
          localStorage.removeItem(`last_attempt_${email}`);
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Increment failed attempts
        const newAttempts = parseInt(loginAttempts) + 1;
        localStorage.setItem(`login_attempts_${email}`, newAttempts);
        localStorage.setItem(`last_attempt_${email}`, Date.now());

        console.error('Login error:', error);
        throw new Error(error.message);
      }

      // Reset login attempts on success
      localStorage.removeItem(`login_attempts_${email}`);
      localStorage.removeItem(`last_attempt_${email}`);

      console.log('Login successful:', data);

      // Update login count
      if (userProfile) {
        await updateLoginCount(userProfile.id);
      }

      addSecurityEvent('LOGIN_SUCCESS', 'User logged in successfully');
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      addSecurityEvent('LOGIN_FAILED', `Login failed: ${error.message}`);
      throw error;
    }
  };

  // Update login count
  const updateLoginCount = async profileId => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          login_count: (userProfile?.login_count || 0) + 1,
          last_login: new Date().toISOString(),
        })
        .eq('id', profileId);

      if (error) throw error;
    } catch (error) {
      console.error('Login count update failed:', error);
    }
  };

  // Create default user profile
  const createDefaultProfile = async userId => {
    try {
      const defaultProfile = {
        id: userId,
        role: 'developer',
        permissions: userRoles.developer.permissions,
        preferences: {
          theme: 'system',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: {
            email: true,
            push: true,
            security: true,
          },
        },
        last_login: new Date().toISOString(),
        login_count: 1,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([defaultProfile])
        .select()
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Profile creation failed:', error);
    }
  };

  // Register function with profile creation
  const register = async userData => {
    try {
      const { data, error } = await supabase.auth.signUp({
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

      if (data.user) {
        await createDefaultProfile(data.user.id);
        addSecurityEvent('REGISTRATION_SUCCESS', 'New user registered');
      }

      return { success: true };
    } catch (error) {
      addSecurityEvent(
        'REGISTRATION_FAILED',
        `Registration failed: ${error.message}`
      );
      throw error;
    }
  };

  // Logout function with cleanup
  const logout = async () => {
    try {
      addSecurityEvent('LOGOUT', 'User logged out');

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsAuthenticated(false);

      // Clear local storage
      localStorage.removeItem('user_preferences');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async profileData => {
    try {
      const { data, error } = await supabase.auth.updateUser(profileData);
      if (error) throw error;

      setUser(data.user);
      addSecurityEvent('PROFILE_UPDATED', 'User profile updated');
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Change password with security check
  const changePassword = async (currentPassword, newPassword) => {
    try {
      // Verify current password first
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (verifyError) {
        throw new Error('Current password is incorrect');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      addSecurityEvent('PASSWORD_CHANGED', 'User password changed');
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Check if user has permission
  const hasPermission = permission => {
    if (!userProfile) return false;
    return (
      userProfile.permissions.includes('*') ||
      userProfile.permissions.includes(permission)
    );
  };

  // Check if user has role
  const hasRole = roles => {
    if (!userProfile) return false;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return (
      allowedRoles.includes(userProfile.role) || userProfile.role === 'admin'
    );
  };

  // Get user's project permissions
  const getProjectPermissions = projectId => {
    if (!userProfile)
      return { read: false, write: false, deploy: false, admin: false };

    // Admin has all permissions
    if (userProfile.role === 'admin') {
      return { read: true, write: true, deploy: true, admin: true };
    }

    // Check specific project permissions
    const permissions = {
      read: hasPermission('view_projects'),
      write: hasPermission('edit_projects'),
      deploy: hasPermission('deploy'),
      admin: hasPermission('manage_projects'),
    };

    return permissions;
  };

  // Update user preferences
  const updatePreferences = async preferences => {
    try {
      const updatedPreferences = { ...userProfile.preferences, ...preferences };

      const { data, error } = await supabase
        .from('profiles')
        .update({ preferences: updatedPreferences })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUserProfile(data);
      localStorage.setItem(
        'user_preferences',
        JSON.stringify(updatedPreferences)
      );
      addSecurityEvent('PREFERENCES_UPDATED', 'User preferences updated');
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Get user role info
  const getUserRoleInfo = () => {
    if (!userProfile) return null;
    return userRoles[userProfile.role] || userRoles.viewer;
  };

  // Get security events
  const getSecurityEvents = () => {
    return securityEvents;
  };

  // Refresh session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      setSession(data.session);
      setLastActivity(Date.now());
      addSecurityEvent('SESSION_REFRESHED', 'Session manually refreshed');
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Get session info
  const getSessionInfo = () => {
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
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = React.useMemo(() => ({
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
  }), [
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
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
