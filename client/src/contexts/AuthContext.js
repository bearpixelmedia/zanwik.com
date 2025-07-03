import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        throw new Error(error.message);
      }

      console.log('Login successful:', data);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });

      if (error) throw error;

      setUser(data.user);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const { data, error } = await supabase.auth.updateUser(profileData);
      if (error) throw error;
      setUser(data.user);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Change password
  const changePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Check if user has permission (simplified for demo)
  const hasPermission = (resource, action) => {
    if (!user) return false;
    // For demo purposes, return true for all permissions
    return true;
  };

  // Check if user has role
  const hasRole = (roles) => {
    if (!user) return false;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    // For demo purposes, assume all users have admin role
    return allowedRoles.includes('admin');
  };

  // Get user's project permissions
  const getProjectPermissions = (projectId) => {
    if (!user) return { read: false, write: false, deploy: false, admin: false };
    
    // For demo purposes, return full permissions
    return {
      read: true,
      write: true,
      deploy: true,
      admin: true
    };
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { preferences }
      });
      if (error) throw error;
      setUser(data.user);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Get login history (simplified)
  const getLoginHistory = async () => {
    // Supabase doesn't provide login history by default
    // You'd need to implement this with a custom table
    return [];
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    hasPermission,
    hasRole,
    getProjectPermissions,
    updatePreferences,
    getLoginHistory
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 