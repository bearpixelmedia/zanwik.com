import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView, trackEvent } from '../utils/analytics';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Initialize analytics on mount
    initAnalytics();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    trackPageView(location.pathname);
  }, [location]);

  const trackAPISearch = (searchTerm, resultsCount) => {
    trackEvent('search', 'API Directory', searchTerm, resultsCount);
  };

  const trackAPIClick = (apiName, category) => {
    trackEvent('click', 'API', `${category}:${apiName}`);
  };

  const trackRegistration = (method = 'email') => {
    trackEvent('sign_up', 'User', method);
  };

  const trackConversion = (conversionType, value) => {
    trackEvent('conversion', 'Business', conversionType, value);
  };

  const trackBlogView = (postTitle) => {
    trackEvent('view_item', 'Blog', postTitle);
  };

  const trackNewsletterSignup = () => {
    trackEvent('sign_up', 'Newsletter', 'email');
  };

  const trackAPITest = (apiName, success) => {
    trackEvent('test_api', 'API Testing', apiName, success ? 1 : 0);
  };

  const trackDashboardAccess = () => {
    trackEvent('login', 'Dashboard', 'bpm-login');
  };

  const trackSubscription = (plan, value) => {
    trackEvent('purchase', 'Subscription', plan, value);
  };

  const trackPerformance = (metric, value) => {
    trackEvent('timing_complete', 'Performance', metric, Math.round(value));
  };

  const trackError = (error, fatal = false) => {
    trackEvent('exception', 'Error', error, fatal ? 1 : 0);
  };

  const trackFormSubmission = (formName, success) => {
    trackEvent(success ? 'form_submit' : 'form_error', 'Form', formName);
  };

  const trackDownload = (fileName, fileType) => {
    trackEvent('file_download', 'Download', `${fileType}:${fileName}`);
  };

  const trackSocialClick = (platform, action) => {
    trackEvent('click', 'Social', `${platform}:${action}`);
  };

  const trackAPIHealthCheck = (apiName, status, responseTime) => {
    trackEvent('api_health', 'Monitoring', apiName, responseTime);
    if (status !== 'healthy') {
      trackEvent('api_error', 'Monitoring', apiName);
    }
  };

  const trackUserJourney = (step, details) => {
    trackEvent('user_journey', 'Engagement', step, details);
  };

  const value = {
    trackAPISearch,
    trackAPIClick,
    trackRegistration,
    trackConversion,
    trackBlogView,
    trackNewsletterSignup,
    trackAPITest,
    trackDashboardAccess,
    trackSubscription,
    trackPerformance,
    trackError,
    trackFormSubmission,
    trackDownload,
    trackSocialClick,
    trackAPIHealthCheck,
    trackUserJourney
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
