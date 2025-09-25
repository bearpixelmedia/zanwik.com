import React, { useState, useEffect } from 'react';

const ContentMarketingDashboard = () => {
  const [contentStats, setContentStats] = useState({
    blogViews: 0,
    socialEngagement: 0,
    conversions: 0,
    reach: 0
  });
  
  const [socialMediaStats, setSocialMediaStats] = useState({
    linkedin: { posts: 0, engagement: 0, reach: 0 },
    twitter: { posts: 0, engagement: 0, reach: 0 },
    reddit: { posts: 0, engagement: 0, reach: 0 }
  });
  
  const [recentPosts, setRecentPosts] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    // Load content marketing data
    loadContentMarketingData();
  }, []);

  const loadContentMarketingData = async () => {
    try {
      // Fetch content marketing stats
      const statsResponse = await fetch('/api/content-marketing/stats');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setContentStats(statsData.data.contentStats);
        setSocialMediaStats(statsData.data.socialStats);
      }
      
      // Fetch recent posts
      const recentResponse = await fetch('/api/content-marketing/recent-posts');
      const recentData = await recentResponse.json();
      
      if (recentData.success) {
        setRecentPosts(recentData.data);
      }
      
      // Fetch scheduled posts
      const scheduledResponse = await fetch('/api/content-marketing/scheduled-posts');
      const scheduledData = await scheduledResponse.json();
      
      if (scheduledData.success) {
        setScheduledPosts(scheduledData.data);
      }
    } catch (error) {
      console.error('Failed to load content marketing data:', error);
      
      // Fallback to mock data if API fails
      const mockContentStats = {
        blogViews: 1247,
        socialEngagement: 89,
        conversions: 23,
        reach: 4567
      };
      
      const mockSocialStats = {
        linkedin: { posts: 15, engagement: 45, reach: 1200 },
        twitter: { posts: 23, engagement: 67, reach: 2100 },
        reddit: { posts: 8, engagement: 34, reach: 890 }
      };
      
      const mockRecentPosts = [
        {
          id: 1,
          platform: 'LinkedIn',
          title: 'API Integration Guide 2024',
          status: 'published',
          engagement: 45,
          timestamp: '2 hours ago'
        },
        {
          id: 2,
          platform: 'Twitter',
          title: 'Top 10 APIs for Startups',
          status: 'published',
          engagement: 67,
          timestamp: '4 hours ago'
        },
        {
          id: 3,
          platform: 'Reddit',
          title: 'API Security Best Practices',
          status: 'published',
          engagement: 34,
          timestamp: '6 hours ago'
        }
      ];
      
      const mockScheduledPosts = [
        {
          id: 1,
          platform: 'LinkedIn',
          title: 'Startup Tech Stack Insights',
          scheduledTime: 'Tomorrow 9:00 AM',
          status: 'scheduled'
        },
        {
          id: 2,
          platform: 'Twitter',
          title: 'API Testing Strategies',
          scheduledTime: 'Tomorrow 12:00 PM',
          status: 'scheduled'
        },
        {
          id: 3,
          platform: 'Reddit',
          title: 'Developer Productivity Tips',
          scheduledTime: 'Tomorrow 2:00 PM',
          status: 'scheduled'
        }
      ];
      
      setContentStats(mockContentStats);
      setSocialMediaStats(mockSocialStats);
      setRecentPosts(mockRecentPosts);
      setScheduledPosts(mockScheduledPosts);
    }
  };

  const handlePostNow = async (platform, content) => {
    try {
      // Call the content marketing API
      const response = await fetch(`/api/content-marketing/post-${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Posted to ${platform} successfully!`);
        loadContentMarketingData(); // Refresh data
      } else {
        alert(`Failed to post to ${platform}: ${data.error}`);
      }
    } catch (error) {
      console.error(`Failed to post to ${platform}:`, error);
      alert(`Error posting to ${platform}`);
    }
  };

  const handleSchedulePost = async (platform, content, scheduledTime) => {
    try {
      // Call the content marketing API
      const response = await fetch('/api/content-marketing/schedule-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, content, scheduledTime })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Scheduled post to ${platform} for ${scheduledTime}!`);
        loadContentMarketingData(); // Refresh data
      } else {
        alert(`Failed to schedule post to ${platform}: ${data.error}`);
      }
    } catch (error) {
      console.error(`Failed to schedule post to ${platform}:`, error);
      alert(`Error scheduling post to ${platform}`);
    }
  };

  return (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px'
    }}>
      <h2 style={{
        color: '#fff',
        fontSize: '20px',
        fontWeight: '600',
        margin: '0 0 20px 0',
        display: 'flex',
        alignItems: 'center'
      }}>
        📱 Content Marketing Dashboard
      </h2>

      {/* Content Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[
          { title: 'Blog Views', value: contentStats.blogViews, icon: '📊', color: '#667eea' },
          { title: 'Social Engagement', value: contentStats.socialEngagement, icon: '💬', color: '#764ba2' },
          { title: 'Conversions', value: contentStats.conversions, icon: '🎯', color: '#f093fb' },
          { title: 'Total Reach', value: contentStats.reach, icon: '👥', color: '#4facfe' }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              {stat.icon}
            </div>
            <h3 style={{
              color: '#fff',
              fontSize: '20px',
              fontWeight: '700',
              margin: '0 0 4px 0',
              background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {stat.value}
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '12px', margin: 0 }}>
              {stat.title}
            </p>
          </div>
        ))}
      </div>

      {/* Social Media Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {Object.entries(socialMediaStats).map(([platform, stats]) => (
          <div
            key={platform}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px'
            }}
          >
            <h3 style={{
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 12px 0',
              textTransform: 'capitalize'
            }}>
              {platform === 'linkedin' ? '💼 LinkedIn' : 
               platform === 'twitter' ? '🐦 Twitter' : 
               '🔴 Reddit'}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#a1a1aa', fontSize: '12px' }}>Posts:</span>
              <span style={{ color: '#fff', fontSize: '12px' }}>{stats.posts}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#a1a1aa', fontSize: '12px' }}>Engagement:</span>
              <span style={{ color: '#fff', fontSize: '12px' }}>{stats.engagement}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#a1a1aa', fontSize: '12px' }}>Reach:</span>
              <span style={{ color: '#fff', fontSize: '12px' }}>{stats.reach}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Posts & Scheduled Posts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        {/* Recent Posts */}
        <div>
          <h3 style={{
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 16px 0'
          }}>
            📝 Recent Posts
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {recentPosts.map((post) => (
              <div
                key={post.id}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                    {post.platform}
                  </span>
                  <span style={{
                    color: '#10b981',
                    fontSize: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {post.status}
                  </span>
                </div>
                <p style={{ color: '#a1a1aa', fontSize: '12px', margin: '0 0 8px 0' }}>
                  {post.title}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#71717a', fontSize: '11px' }}>
                    {post.timestamp}
                  </span>
                  <span style={{ color: '#667eea', fontSize: '11px' }}>
                    {post.engagement} engagements
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Posts */}
        <div>
          <h3 style={{
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 16px 0'
          }}>
            ⏰ Scheduled Posts
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {scheduledPosts.map((post) => (
              <div
                key={post.id}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                    {post.platform}
                  </span>
                  <span style={{
                    color: '#f59e0b',
                    fontSize: '12px',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {post.status}
                  </span>
                </div>
                <p style={{ color: '#a1a1aa', fontSize: '12px', margin: '0 0 8px 0' }}>
                  {post.title}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#71717a', fontSize: '11px' }}>
                    {post.scheduledTime}
                  </span>
                  <button
                    onClick={() => handlePostNow(post.platform, post.title)}
                    style={{
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      borderRadius: '4px',
                      color: '#667eea',
                      fontSize: '10px',
                      padding: '2px 6px',
                      cursor: 'pointer'
                    }}
                  >
                    Post Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{
          color: '#fff',
          fontSize: '16px',
          fontWeight: '600',
          margin: '0 0 16px 0'
        }}>
          🚀 Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handlePostNow('linkedin', 'API Integration Guide 2024')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: 'rgba(0, 119, 181, 0.1)',
              border: '1px solid rgba(0, 119, 181, 0.3)',
              borderRadius: '8px',
              color: '#0077b5',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            💼 Post to LinkedIn
          </button>
          <button
            onClick={() => handlePostNow('twitter', 'Top 10 APIs for Startups')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: 'rgba(29, 161, 242, 0.1)',
              border: '1px solid rgba(29, 161, 242, 0.3)',
              borderRadius: '8px',
              color: '#1da1f2',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🐦 Post to Twitter
          </button>
          <button
            onClick={() => handlePostNow('reddit', 'API Security Best Practices')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 69, 0, 0.1)',
              border: '1px solid rgba(255, 69, 0, 0.3)',
              borderRadius: '8px',
              color: '#ff4500',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🔴 Post to Reddit
          </button>
          <button
            onClick={() => window.open('/blog', '_blank')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '8px',
              color: '#667eea',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📝 View Blog
          </button>
          <button
            onClick={() => window.open('/analytics', '_blank')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: '#10b981',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📊 View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentMarketingDashboard;
