import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { auth, supabase } from '../utils/supabase';

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
        const user = await auth.getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const { user: userData } = await auth.signIn(email, password);
      setUser(userData);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const { user: newUser } = await auth.signUp(userData.email, userData.password);
      setUser(newUser);
      toast.success('Registration successful! Please check your email to verify your account.');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const { data, error } = await supabase.auth.updateUser(profileData);
      if (error) throw error;
      setUser(data.user);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Failed to update profile';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Change password
  const changePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Failed to change password';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Check if user has permission (simplified for demo)
  const hasPermission = (resource, action) => {
    if (!user) return false;
    // For demo purposes, return true for all permissions
    // In production, you'd check user metadata or roles
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
      toast.success('Preferences updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Failed to update preferences';
      toast.error(message);
      return { success: false, error: message };
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