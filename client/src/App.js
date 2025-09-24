import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AnalyticsProvider } from './components/AnalyticsProvider';
import HiddenLogin from './pages/HiddenLogin';
import SecureDashboard from './pages/SecureDashboard';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import GoogleAdsManager from './components/GoogleAdsManager';
import SocialMediaManager from './components/SocialMediaManager';
import PerformanceMonitor from './components/PerformanceMonitor';
import StructuredData from './components/StructuredData';
import { initPerformanceOptimizations } from './utils/performanceOptimizer';
import './App.css';

const App = () => {
  useEffect(() => {
    // Initialize performance optimizations
    initPerformanceOptimizations();
  }, []);

  return (
    <AuthProvider>
      <AnalyticsProvider>
        <Router>
          {/* Structured Data for SEO */}
          <StructuredData type="website" />
          <StructuredData type="organization" />
          
          <Routes>
            {/* Hidden login route - no public links */}
            <Route path="/bpm-login" element={<HiddenLogin />} />
            
            {/* Secure dashboard - requires authentication */}
            <Route path="/dashboard" element={<SecureDashboard />} />
            
            {/* Blog routes */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            {/* Marketing & Analytics routes */}
            <Route path="/ads" element={<GoogleAdsManager />} />
            <Route path="/social" element={<SocialMediaManager />} />
            <Route path="/monitor" element={<PerformanceMonitor />} />
            
            {/* Default route - redirect to main site */}
            <Route path="/" element={<Navigate to="/redirect" replace />} />
            
            {/* Redirect page */}
            <Route path="/redirect" element={<RedirectPage />} />
            
            {/* Catch all - redirect to main site */}
            <Route path="*" element={<Navigate to="/redirect" replace />} />
          </Routes>
        </Router>
      </AnalyticsProvider>
    </AuthProvider>
  );
};

const RedirectPage = () => {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted'>
      <div className='text-center space-y-6'>
        <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mb-4'>
          <img src='/zanwik-icon.svg' alt='Zanwik' className='w-10 h-10' />
        </div>
        <h1 className='text-4xl font-bold text-foreground mb-2'>
          Redirecting...
        </h1>
        <p className='text-lg text-muted-foreground mb-4'>
          Taking you to the main Zanwik API Directory.
          <br />
          If you're not redirected automatically,{' '}
          <a
            href='https://money-19sseidup-byronmccluney.vercel.app'
            className='underline text-primary'
          >
            click here
          </a>
          .
        </p>
        <div className='mt-6'>
          <span className='text-sm text-muted-foreground'>
            Contact:{' '}
            <a href='mailto:info@zanwik.com' className='underline'>
              info@zanwik.com
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;
