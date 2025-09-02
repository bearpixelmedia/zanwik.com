import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AnalyticsPage from './pages/Analytics';
import Projects from './pages/Projects';
import Deployment from './pages/Deployment';
import Infrastructure from './pages/Infrastructure';
import Monitoring from './pages/Monitoring';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Admin from './pages/Admin';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Styles
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Check if we're on the admin route (public page)
  if (window.location.pathname === '/admin') {
    return <Admin />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        <main className="p-6">
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/deployment" element={<Deployment />} />
            <Route path="/infrastructure" element={<Infrastructure />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-right" />
        <Analytics />
        <SpeedInsights />
      </AuthProvider>
    </Router>
  );
}

export default App; 