import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Analytics from './pages/Analytics';
import Monitoring from './pages/Monitoring';
import Infrastructure from './pages/Infrastructure';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Login from './pages/Login';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <div className="flex h-screen bg-gray-50">
                      <Sidebar />
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <Navbar />
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                          <Dashboard />
                        </main>
                      </div>
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <PrivateRoute>
                    <div className="flex h-screen bg-gray-50">
                      <Sidebar />
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <Navbar />
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                          <Projects />
                        </main>
                      </div>
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <div className="flex h-screen bg-gray-50">
                      <Sidebar />
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <Navbar />
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                          <Analytics />
                        </main>
                      </div>
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/monitoring"
                element={
                  <PrivateRoute>
                    <div className="flex h-screen bg-gray-50">
                      <Sidebar />
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <Navbar />
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                          <Monitoring />
                        </main>
                      </div>
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/infrastructure"
                element={
                  <PrivateRoute>
                    <div className="flex h-screen bg-gray-50">
                      <Sidebar />
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <Navbar />
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                          <Infrastructure />
                        </main>
                      </div>
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <PrivateRoute>
                    <div className="flex h-screen bg-gray-50">
                      <Sidebar />
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <Navbar />
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                          <Users />
                        </main>
                      </div>
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <div className="flex h-screen bg-gray-50">
                      <Sidebar />
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <Navbar />
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                          <Settings />
                        </main>
                      </div>
                    </div>
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; 