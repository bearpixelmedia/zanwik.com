import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SecureDashboard = () => {
  const { user, userProfile, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalAPIs: 0,
    totalProjects: 0,
    totalUsers: 0,
    revenue: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/bpm-login');
      return;
    }
  }, [user, navigate]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulate API calls for dashboard data
        // In a real implementation, these would be actual API calls
        const mockData = {
          totalAPIs: 1247,
          totalProjects: 23,
          totalUsers: 156,
          revenue: 2847.50,
          recentActivity: [
            { id: 1, type: 'api_added', message: 'Stripe API added to directory', timestamp: '2 minutes ago' },
            { id: 2, type: 'user_signup', message: 'New user registered', timestamp: '5 minutes ago' },
            { id: 3, type: 'project_created', message: 'New business project created', timestamp: '12 minutes ago' },
            { id: 4, type: 'api_tested', message: 'GitHub API health check completed', timestamp: '18 minutes ago' },
            { id: 5, type: 'revenue', message: 'Premium subscription activated', timestamp: '25 minutes ago' }
          ]
        };
        
        setDashboardData(mockData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/bpm-login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)',
      fontFamily: 'Inter, sans-serif',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '20px 30px'
      }}>
        <div>
          <h1 style={{
            color: '#fff',
            fontSize: '24px',
            fontWeight: '700',
            margin: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Zanwik Dashboard
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '14px', margin: '4px 0 0 0' }}>
            Welcome back, {userProfile?.full_name || user.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          }}
        >
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { title: 'Total APIs', value: dashboardData.totalAPIs, icon: '🔌', color: '#667eea' },
          { title: 'Active Projects', value: dashboardData.totalProjects, icon: '📊', color: '#764ba2' },
          { title: 'Registered Users', value: dashboardData.totalUsers, icon: '👥', color: '#f093fb' },
          { title: 'Revenue', value: `$${dashboardData.revenue}`, icon: '💰', color: '#4facfe' }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-4px)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>
              {stat.icon}
            </div>
            <h3 style={{
              color: '#fff',
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 8px 0',
              background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {stat.value}
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', margin: 0 }}>
              {stat.title}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px'
      }}>
        {/* Recent Activity */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h2 style={{
            color: '#fff',
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 20px 0'
          }}>
            Recent Activity
          </h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {dashboardData.recentActivity.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#667eea',
                  marginRight: '12px',
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{
                    color: '#fff',
                    fontSize: '14px',
                    margin: '0 0 4px 0'
                  }}>
                    {activity.message}
                  </p>
                  <p style={{
                    color: '#71717a',
                    fontSize: '12px',
                    margin: 0
                  }}>
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h2 style={{
            color: '#fff',
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 20px 0'
          }}>
            Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: 'Add New API', icon: '➕', action: () => console.log('Add API') },
              { title: 'Create Project', icon: '📁', action: () => console.log('Create Project') },
              { title: 'View Analytics', icon: '📈', action: () => console.log('View Analytics') },
              { title: 'Manage Users', icon: '👤', action: () => console.log('Manage Users') },
              { title: 'System Settings', icon: '⚙️', action: () => console.log('Settings') }
            ].map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                <span style={{ marginRight: '12px', fontSize: '16px' }}>
                  {action.icon}
                </span>
                {action.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '30px',
        textAlign: 'center',
        padding: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <p style={{ color: '#71717a', fontSize: '12px', margin: 0 }}>
          Zanwik Dashboard • Secure Access Only • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default SecureDashboard;
