import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

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
  const [token, setToken] = useState(localStorage.getItem('token'));
  const queryClient = useQueryClient();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      // Set default auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: userData: newUser } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      // Set default auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    
    // Clear all queries
    queryClient.clear();
    
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data.user);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Generate API key
  const generateApiKey = async (name, permissions) => {
    try {
      const response = await api.post('/auth/api-keys', { name, permissions });
      toast.success('API key generated successfully!');
      return { success: true, apiKey: response.data.apiKey };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate API key';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get API keys
  const getApiKeys = async () => {
    try {
      const response = await api.get('/auth/api-keys');
      return response.data.apiKeys;
    } catch (error) {
      toast.error('Failed to get API keys');
      return [];
    }
  };

  // Revoke API key
  const revokeApiKey = async (keyId) => {
    try {
      await api.delete(`/auth/api-keys/${keyId}`);
      toast.success('API key revoked successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to revoke API key';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Check if user has permission
  const hasPermission = (resource, action) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    const resourcePermissions = user.permissions[resource];
    if (!resourcePermissions) return false;
    
    return resourcePermissions[action] || false;
  };

  // Check if user has role
  const hasRole = (roles) => {
    if (!user) return false;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user.role);
  };

  // Get user's project permissions
  const getProjectPermissions = (projectId) => {
    if (!user) return { read: false, write: false, deploy: false, admin: false };
    
    // This would typically check project-specific permissions
    // For now, return basic permissions based on user role
    const basePermissions = {
      read: hasPermission('projects', 'read'),
      write: hasPermission('projects', 'update'),
      deploy: hasPermission('projects', 'deploy'),
      admin: hasPermission('projects', 'delete')
    };
    
    return basePermissions;
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      const response = await api.put('/auth/profile', { preferences });
      setUser(response.data.user);
      toast.success('Preferences updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update preferences';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get login history
  const getLoginHistory = async () => {
    try {
      const response = await api.get('/auth/login-history');
      return response.data.loginHistory;
    } catch (error) {
      toast.error('Failed to get login history');
      return [];
    }
  };

  // Set auth header when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    generateApiKey,
    getApiKeys,
    revokeApiKey,
    hasPermission,
    hasRole,
    getProjectPermissions,
    updatePreferences,
    getLoginHistory,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 