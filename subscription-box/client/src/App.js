import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import Products from './pages/Products';
import Analytics from './pages/Analytics';
import CustomerDashboard from './pages/CustomerDashboard';
import SubscriptionMarketplace from './pages/SubscriptionMarketplace';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Business Owner Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute allowedRoles={['business_owner']}>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/subscriptions" 
                element={
                  <PrivateRoute allowedRoles={['business_owner']}>
                    <Subscriptions />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/products" 
                element={
                  <PrivateRoute allowedRoles={['business_owner']}>
                    <Products />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <PrivateRoute allowedRoles={['business_owner']}>
                    <Analytics />
                  </PrivateRoute>
                } 
              />
              
              {/* Customer Routes */}
              <Route 
                path="/customer-dashboard" 
                element={
                  <PrivateRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/marketplace" 
                element={
                  <PrivateRoute allowedRoles={['customer']}>
                    <SubscriptionMarketplace />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </main>
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
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 