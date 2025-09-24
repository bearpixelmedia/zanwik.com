// Google Analytics 4 implementation
export const GA_TRACKING_ID = 'G-Y1DM6G1JR1';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track API searches
export const trackAPISearch = (searchTerm, resultsCount) => {
  trackEvent('search', 'API Directory', searchTerm, resultsCount);
};

// Track API clicks
export const trackAPIClick = (apiName, category) => {
  trackEvent('click', 'API', `${category}:${apiName}`);
};

// Track user registrations
export const trackRegistration = (method = 'email') => {
  trackEvent('sign_up', 'User', method);
};

// Track conversions
export const trackConversion = (conversionType, value) => {
  trackEvent('conversion', 'Business', conversionType, value);
};

// Track blog engagement
export const trackBlogView = (postTitle) => {
  trackEvent('view_item', 'Blog', postTitle);
};

// Track newsletter signup
export const trackNewsletterSignup = () => {
  trackEvent('sign_up', 'Newsletter', 'email');
};

// Track API testing
export const trackAPITest = (apiName, success) => {
  trackEvent('test_api', 'API Testing', apiName, success ? 1 : 0);
};

// Track dashboard usage
export const trackDashboardAccess = () => {
  trackEvent('login', 'Dashboard', 'bpm-login');
};

// Enhanced ecommerce tracking
export const trackPurchase = (transactionId, value, currency = 'USD', items = []) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items,
    });
  }
};

// Track subscription events
export const trackSubscription = (plan, value) => {
  trackEvent('purchase', 'Subscription', plan, value);
};

// Performance tracking
export const trackPerformance = (metric, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: metric,
      value: Math.round(value),
    });
  }
};

// Error tracking
export const trackError = (error, fatal = false) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: error,
      fatal: fatal,
    });
  }
};

// User properties
export const setUserProperties = (properties) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      custom_map: properties,
    });
  }
};

// Track scroll depth
export const trackScrollDepth = (depth) => {
  trackEvent('scroll', 'Engagement', `${depth}%`);
};

// Track time on page
export const trackTimeOnPage = (timeInSeconds) => {
  trackEvent('timing', 'Engagement', 'time_on_page', timeInSeconds);
};

// Track form submissions
export const trackFormSubmission = (formName, success) => {
  trackEvent(success ? 'form_submit' : 'form_error', 'Form', formName);
};

// Track file downloads
export const trackDownload = (fileName, fileType) => {
  trackEvent('file_download', 'Download', `${fileType}:${fileName}`);
};

// Track social media clicks
export const trackSocialClick = (platform, action) => {
  trackEvent('click', 'Social', `${platform}:${action}`);
};

// Track API health checks
export const trackAPIHealthCheck = (apiName, status, responseTime) => {
  trackEvent('api_health', 'Monitoring', apiName, responseTime);
  if (status !== 'healthy') {
    trackEvent('api_error', 'Monitoring', apiName);
  }
};

// Track user journey
export const trackUserJourney = (step, details) => {
  trackEvent('user_journey', 'Engagement', step, details);
};

// Initialize all tracking
export const initAnalytics = () => {
  // Initialize GA
  initGA();
  
  // Track initial page view
  trackPageView(window.location.pathname);
  
  // Set up scroll tracking
  let maxScroll = 0;
  const trackScroll = () => {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
        trackScrollDepth(maxScroll);
      }
    }
  };
  
  window.addEventListener('scroll', trackScroll);
  
  // Track time on page
  const startTime = Date.now();
  window.addEventListener('beforeunload', () => {
    const timeOnPage = Math.round((Date.now() - startTime) / 1000);
    trackTimeOnPage(timeOnPage);
  });
  
  // Track errors
  window.addEventListener('error', (event) => {
    trackError(event.error?.message || 'Unknown error', false);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    trackError(event.reason?.message || 'Unhandled promise rejection', false);
  });
};

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackAPISearch,
  trackAPIClick,
  trackRegistration,
  trackConversion,
  trackBlogView,
  trackNewsletterSignup,
  trackAPITest,
  trackDashboardAccess,
  trackPurchase,
  trackSubscription,
  trackPerformance,
  trackError,
  setUserProperties,
  trackScrollDepth,
  trackTimeOnPage,
  trackFormSubmission,
  trackDownload,
  trackSocialClick,
  trackAPIHealthCheck,
  trackUserJourney
};
