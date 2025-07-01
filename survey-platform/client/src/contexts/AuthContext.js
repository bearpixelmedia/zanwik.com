import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    case 'UPDATE_USAGE':
      return {
        ...state,
        user: {
          ...state.user,
          usage: { ...state.user.usage, ...action.payload }
        }
      };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token in API headers
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token) {
        try {
          dispatch({ type: 'AUTH_START' });
          const response = await api.get('/auth/me');
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.user,
              token: state.token
            }
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication failed' });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    checkAuth();
  }, []);

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await api.post('/auth/register', userData);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
          token: response.data.token
        }
      });
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await api.post('/auth/login', credentials);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
          token: response.data.token
        }
      });
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    dispatch({ type: 'AUTH_LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      dispatch({ type: 'UPDATE_USER', payload: response.data.user });
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await api.put('/auth/change-password', passwordData);
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyEmail = async (token) => {
    try {
      await api.post('/auth/verify-email', { token });
      dispatch({ type: 'UPDATE_USER', payload: { isEmailVerified: true } });
      toast.success('Email verified successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resendVerification = async () => {
    try {
      await api.post('/auth/resend-verification');
      toast.success('Verification email sent');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send verification email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Password reset email sent');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateUsage = (usageData) => {
    dispatch({ type: 'UPDATE_USAGE', payload: usageData });
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      dispatch({ type: 'UPDATE_USER', payload: response.data.user });
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    updateUsage,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 