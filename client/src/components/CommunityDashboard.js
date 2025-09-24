import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const CommunityDashboard = () => {
  const [stats, setStats] = useState(null);
  const [topContributors, setTopContributors] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load community data
  const loadCommunityData = async () => {
    try {
      const [statsResponse, contributorsResponse, submissionsResponse, postsResponse] = await Promise.all([
        fetch('/api/community/stats'),
        fetch('/api/community/contributors'),
        fetch('/api/community/apis/submissions'),
        fetch('/api/community/posts')
      ]);
      
      const statsData = await statsResponse.json();
      const contributorsData = await contributorsResponse.json();
      const submissionsData = await submissionsResponse.json();
      const postsData = await postsResponse.json();
      
      if (statsData.success) setStats(statsData.data);
      if (contributorsData.success) setTopContributors(contributorsData.data);
      if (submissionsData.success) setRecentSubmissions(submissionsData.data.slice(0, 5));
      if (postsData.success) setRecentPosts(postsData.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'discussion': return 'text-blue-600 bg-blue-100';
      case 'question': return 'text-green-600 bg-green-100';
      case 'announcement': return 'text-purple-600 bg-purple-100';
      case 'showcase': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading community data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Community Dashboard</h2>
        <p className="text-gray-600">Welcome to the Zanwik developer community</p>
      </div>

      {/* Community Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalSubmissions}</div>
            <div className="text-sm text-gray-600">API Submissions</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.totalReviews}</div>
            <div className="text-sm text-gray-600">Reviews</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.totalPosts}</div>
            <div className="text-sm text-gray-600">Community Posts</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.activeUsers}</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent API Submissions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent API Submissions</h3>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentSubmissions.map((submission) => (
              <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{submission.apiData.name}</div>
                  <div className="text-sm text-gray-600">{submission.apiData.description}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{submission.apiData.category}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{submission.votes} votes</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(submission.status)}`}>
                    {submission.status}
                  </span>
                </div>
              </div>
            ))}
            {recentSubmissions.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No recent submissions
              </div>
            )}
          </div>
        </Card>

        {/* Recent Community Posts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Community Posts</h3>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{post.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.content}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{post.likes} likes</span>
                  <span>{post.comments} comments</span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
            ))}
            {recentPosts.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No recent posts
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Top Contributors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Contributors</h3>
        
        <div className="space-y-3">
          {topContributors.map((contributor, index) => (
            <div key={contributor.userId} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                </div>
                <div>
                  <div className="font-medium">User {contributor.userId.slice(-6)}</div>
                  <div className="text-sm text-gray-600">
                    {contributor.submissions} submissions • {contributor.reviews} reviews • {contributor.posts} posts
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {contributor.score} points
              </div>
            </div>
          ))}
          {topContributors.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No contributors yet
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-20 flex flex-col items-center justify-center space-y-2">
            <span className="text-2xl">📝</span>
            <span>Submit API</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
            <span className="text-2xl">💬</span>
            <span>Create Post</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
            <span className="text-2xl">⭐</span>
            <span>Write Review</span>
          </Button>
        </div>
      </Card>

      {/* Community Guidelines */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Community Guidelines</h3>
        
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Be respectful and constructive in all interactions</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Provide accurate and helpful information about APIs</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Use appropriate categories and tags for posts</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Follow our API submission guidelines</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-red-500 mt-1">✗</span>
            <span>No spam, self-promotion, or off-topic content</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CommunityDashboard;
