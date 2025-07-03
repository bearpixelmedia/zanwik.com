import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Analytics from './pages/Analytics';
import Infrastructure from './pages/Infrastructure';
import Monitoring from './pages/Monitoring';
import Users from './pages/Users';
import Settings from './pages/Settings';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <PrivateRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </PrivateRoute>
            } />
            <Route path="/projects" element={
              <PrivateRoute>
                <AppLayout>
                  <Projects />
                </AppLayout>
              </PrivateRoute>
            } />
            <Route path="/analytics" element={
              <PrivateRoute>
                <AppLayout>
                  <Analytics />
                </AppLayout>
              </PrivateRoute>
            } />
            <Route path="/infrastructure" element={
              <PrivateRoute>
                <AppLayout>
                  <Infrastructure />
                </AppLayout>
              </PrivateRoute>
            } />
            <Route path="/monitoring" element={
              <PrivateRoute>
                <AppLayout>
                  <Monitoring />
                </AppLayout>
              </PrivateRoute>
            } />
            <Route path="/users" element={
              <PrivateRoute>
                <AppLayout>
                  <Users />
                </AppLayout>
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App; 