import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SurveyBuilder from './pages/SurveyBuilder';
import SurveyList from './pages/SurveyList';
import SurveyAnalytics from './pages/SurveyAnalytics';
import SurveyResponses from './pages/SurveyResponses';
import SurveyShare from './pages/SurveyShare';
import SurveyTemplates from './pages/SurveyTemplates';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Team from './pages/Team';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import SurveyPreview from './pages/SurveyPreview';
import SurveyResponse from './pages/SurveyResponse';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar />}
        <main className={user ? 'pt-16' : ''}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/survey/:surveyId" element={<SurveyResponse />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="/surveys" element={
              <PrivateRoute>
                <SurveyList />
              </PrivateRoute>
            } />
            
            <Route path="/surveys/create" element={
              <PrivateRoute>
                <SurveyBuilder />
              </PrivateRoute>
            } />
            
            <Route path="/surveys/:surveyId/edit" element={
              <PrivateRoute>
                <SurveyBuilder />
              </PrivateRoute>
            } />
            
            <Route path="/surveys/:surveyId/preview" element={
              <PrivateRoute>
                <SurveyPreview />
              </PrivateRoute>
            } />
            
            <Route path="/surveys/:surveyId/analytics" element={
              <PrivateRoute>
                <SurveyAnalytics />
              </PrivateRoute>
            } />
            
            <Route path="/surveys/:surveyId/responses" element={
              <PrivateRoute>
                <SurveyResponses />
              </PrivateRoute>
            } />
            
            <Route path="/surveys/:surveyId/share" element={
              <PrivateRoute>
                <SurveyShare />
              </PrivateRoute>
            } />
            
            <Route path="/templates" element={
              <PrivateRoute>
                <SurveyTemplates />
              </PrivateRoute>
            } />
            
            <Route path="/reports" element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            } />
            
            <Route path="/team" element={
              <PrivateRoute>
                <Team />
              </PrivateRoute>
            } />
            
            <Route path="/settings" element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } />
            
            <Route path="/billing" element={
              <PrivateRoute>
                <Billing />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; 