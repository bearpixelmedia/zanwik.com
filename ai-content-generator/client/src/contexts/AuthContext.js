import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
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
  const [stripe, setStripe] = useState(null);

  useEffect(() => {
    // Initialize Stripe
    const initStripe = async () => {
      const stripeInstance = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      setStripe(stripeInstance);
    };
    initStripe();

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateProfile = async (updates) => {
    try {
      const response = await api.put('/auth/profile', updates);
      setUser(response.data);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Profile update failed' 
      };
    }
  };

  const createCheckoutSession = async (priceId) => {
    try {
      const response = await api.post('/subscriptions/create-checkout-session', { priceId });
      const { sessionId } = response.data;
      
      const result = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Checkout failed' 
      };
    }
  };

  const createPortalSession = async () => {
    try {
      const response = await api.post('/subscriptions/create-portal-session');
      window.location.href = response.data.url;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Portal access failed' 
      };
    }
  };

  const value = {
    user,
    loading,
    stripe,
    login,
    register,
    logout,
    updateProfile,
    createCheckoutSession,
    createPortalSession,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 