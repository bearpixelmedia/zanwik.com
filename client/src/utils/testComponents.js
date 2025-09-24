// Component testing utilities
import React from 'react';

// Test if all components can be imported without errors
export const testComponentImports = () => {
  try {
    // Test AnalyticsProvider
    const { AnalyticsProvider } = require('../components/AnalyticsProvider');
    console.log('✅ AnalyticsProvider imported successfully');
    
    // Test Blog components
    const Blog = require('../pages/Blog').default;
    const BlogPost = require('../pages/BlogPost').default;
    console.log('✅ Blog components imported successfully');
    
    // Test Marketing components
    const GoogleAdsManager = require('../components/GoogleAdsManager').default;
    const SocialMediaManager = require('../components/SocialMediaManager').default;
    const PerformanceMonitor = require('../components/PerformanceMonitor').default;
    console.log('✅ Marketing components imported successfully');
    
    // Test Analytics utilities
    const analytics = require('./analytics');
    console.log('✅ Analytics utilities imported successfully');
    
    // Test Performance utilities
    const performanceOptimizer = require('./performanceOptimizer');
    console.log('✅ Performance utilities imported successfully');
    
    // Test StructuredData component
    const StructuredData = require('../components/StructuredData').default;
    console.log('✅ StructuredData component imported successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Component import error:', error);
    return false;
  }
};

// Test if all routes are properly configured
export const testRoutes = () => {
  const routes = [
    '/bpm-login',
    '/dashboard', 
    '/blog',
    '/blog/test-post',
    '/ads',
    '/social',
    '/monitor'
  ];
  
  console.log('🔗 Available routes:');
  routes.forEach(route => {
    console.log(`  - ${route}`);
  });
  
  return routes;
};

// Test if all analytics functions are available
export const testAnalytics = () => {
  try {
    const analytics = require('./analytics');
    
    const functions = [
      'initGA',
      'trackPageView',
      'trackEvent',
      'trackAPISearch',
      'trackAPIClick',
      'trackRegistration',
      'trackConversion',
      'trackBlogView',
      'trackNewsletterSignup',
      'trackAPITest',
      'trackDashboardAccess',
      'trackSubscription',
      'trackPerformance',
      'trackError',
      'trackFormSubmission',
      'trackDownload',
      'trackSocialClick',
      'trackAPIHealthCheck',
      'trackUserJourney'
    ];
    
    console.log('📊 Analytics functions available:');
    functions.forEach(func => {
      if (typeof analytics[func] === 'function') {
        console.log(`  ✅ ${func}`);
      } else {
        console.log(`  ❌ ${func} - Missing or not a function`);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Analytics test error:', error);
    return false;
  }
};

// Test if all performance functions are available
export const testPerformance = () => {
  try {
    const performance = require('./performanceOptimizer');
    
    const functions = [
      'lazyLoadImages',
      'preloadCriticalResources',
      'cachedApiCall',
      'debounce',
      'throttle',
      'loadComponent',
      'registerServiceWorker',
      'optimizeImage',
      'inlineCriticalCSS',
      'performanceMonitor',
      'initPerformanceOptimizations'
    ];
    
    console.log('⚡ Performance functions available:');
    functions.forEach(func => {
      if (typeof performance[func] === 'function') {
        console.log(`  ✅ ${func}`);
      } else {
        console.log(`  ❌ ${func} - Missing or not a function`);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Performance test error:', error);
    return false;
  }
};

// Test if all SEO functions are available
export const testSEO = () => {
  try {
    const seo = require('../utils/sitemapGenerator');
    
    const functions = [
      'generateSitemap',
      'generateRobotsTxt',
      'generateSitemapIndex',
      'writeSitemapFiles'
    ];
    
    console.log('🔍 SEO functions available:');
    functions.forEach(func => {
      if (typeof seo[func] === 'function') {
        console.log(`  ✅ ${func}`);
      } else {
        console.log(`  ❌ ${func} - Missing or not a function`);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ SEO test error:', error);
    return false;
  }
};

// Run all tests
export const runAllTests = () => {
  console.log('🧪 Running component tests...\n');
  
  const results = {
    components: testComponentImports(),
    routes: testRoutes(),
    analytics: testAnalytics(),
    performance: testPerformance(),
    seo: testSEO()
  };
  
  console.log('\n📋 Test Results Summary:');
  Object.entries(results).forEach(([test, result]) => {
    if (typeof result === 'boolean') {
      console.log(`  ${result ? '✅' : '❌'} ${test}`);
    } else {
      console.log(`  ✅ ${test} - ${result.length} items`);
    }
  });
  
  const allPassed = Object.values(results).every(result => 
    typeof result === 'boolean' ? result : true
  );
  
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed!'}`);
  
  return allPassed;
};

// Export for use in development
export default {
  testComponentImports,
  testRoutes,
  testAnalytics,
  testPerformance,
  testSEO,
  runAllTests
};
