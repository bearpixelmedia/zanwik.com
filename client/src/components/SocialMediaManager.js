import React, { useState, useEffect } from 'react';

const SocialMediaManager = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [newPost, setNewPost] = useState({
    platform: 'twitter',
    content: '',
    scheduledTime: '',
    hashtags: [],
    media: null
  });

  // Mock social media campaigns
  const mockCampaigns = [
    {
      id: 1,
      platform: 'twitter',
      content: '🚀 Discover 1000+ APIs in our comprehensive directory! Perfect for developers and entrepreneurs. #API #DeveloperTools #Tech',
      scheduledTime: '2024-01-15T10:00:00Z',
      status: 'scheduled',
      engagement: {
        likes: 45,
        retweets: 12,
        replies: 8,
        clicks: 23
      },
      hashtags: ['#API', '#DeveloperTools', '#Tech'],
      media: null
    },
    {
      id: 2,
      platform: 'linkedin',
      content: 'Building a startup? Check out our curated list of essential APIs that can accelerate your development process. From payment processing to AI services, we\'ve got you covered.',
      scheduledTime: '2024-01-15T14:00:00Z',
      status: 'published',
      engagement: {
        likes: 89,
        comments: 15,
        shares: 23,
        clicks: 67
      },
      hashtags: ['#Startup', '#API', '#Development', '#Tech'],
      media: null
    },
    {
      id: 3,
      platform: 'facebook',
      content: 'New blog post: "The Complete Guide to API Integration for Entrepreneurs" - Learn how to integrate APIs into your business applications with our comprehensive guide.',
      scheduledTime: '2024-01-15T16:00:00Z',
      status: 'published',
      engagement: {
        likes: 156,
        comments: 34,
        shares: 45,
        clicks: 89
      },
      hashtags: ['#API', '#Entrepreneur', '#Business', '#Tech'],
      media: 'blog-post-image.jpg'
    },
    {
      id: 4,
      platform: 'instagram',
      content: 'Swipe through to see our top 5 APIs every developer should know! 🔥 #API #Developer #Tech #Programming',
      scheduledTime: '2024-01-16T09:00:00Z',
      status: 'scheduled',
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        clicks: 0
      },
      hashtags: ['#API', '#Developer', '#Tech', '#Programming'],
      media: 'carousel-post.jpg'
    }
  ];

  useEffect(() => {
    setCampaigns(mockCampaigns);
  }, []);

  const platforms = [
    { id: 'all', name: 'All Platforms', icon: '🌐' },
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'instagram', name: 'Instagram', icon: '📷' }
  ];

  const filteredCampaigns = selectedPlatform === 'all' 
    ? campaigns 
    : campaigns.filter(campaign => campaign.platform === selectedPlatform);

  const handleCreatePost = () => {
    const post = {
      id: Date.now(),
      ...newPost,
      status: 'draft',
      engagement: {
        likes: 0,
        retweets: 0,
        replies: 0,
        clicks: 0
      }
    };
    setCampaigns([...campaigns, post]);
    setNewPost({
      platform: 'twitter',
      content: '',
      scheduledTime: '',
      hashtags: [],
      media: null
    });
  };

  const handleSchedulePost = (postId) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === postId 
        ? { ...campaign, status: 'scheduled' }
        : campaign
    ));
  };

  const handlePublishPost = (postId) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === postId 
        ? { ...campaign, status: 'published' }
        : campaign
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform) => {
    const platformData = platforms.find(p => p.id === platform);
    return platformData ? platformData.icon : '🌐';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Media Campaign Manager</h1>
          <p className="text-gray-600">Manage your social media presence across all platforms</p>
        </div>

        {/* Platform Filter */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {platforms.map(platform => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPlatform === platform.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{platform.icon}</span>
                {platform.name}
              </button>
            ))}
          </div>
        </div>

        {/* Create New Post */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Post</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <select
                value={newPost.platform}
                onChange={(e) => setNewPost({...newPost, platform: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Time</label>
              <input
                type="datetime-local"
                value={newPost.scheduledTime}
                onChange={(e) => setNewPost({...newPost, scheduledTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What's on your mind?"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Hashtags</label>
              <input
                type="text"
                value={newPost.hashtags.join(' ')}
                onChange={(e) => setNewPost({...newPost, hashtags: e.target.value.split(' ').filter(tag => tag.trim())})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#API #Developer #Tech"
              />
            </div>
            <div className="lg:col-span-2 flex justify-end">
              <button
                onClick={handleCreatePost}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Post
              </button>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-6">
          {filteredCampaigns.map(campaign => (
            <div key={campaign.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getPlatformIcon(campaign.platform)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {campaign.platform} Post
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(campaign.scheduledTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => handleSchedulePost(campaign.id)}
                      className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                    >
                      Schedule
                    </button>
                  )}
                  {campaign.status === 'scheduled' && (
                    <button
                      onClick={() => handlePublishPost(campaign.id)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Publish Now
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-900 mb-2">{campaign.content}</p>
                <div className="flex flex-wrap gap-2">
                  {campaign.hashtags.map((hashtag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>

              {campaign.status === 'published' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{campaign.engagement.likes}</div>
                    <div className="text-sm text-gray-500">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{campaign.engagement.retweets || campaign.engagement.shares}</div>
                    <div className="text-sm text-gray-500">
                      {campaign.platform === 'twitter' ? 'Retweets' : 'Shares'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{campaign.engagement.replies || campaign.engagement.comments}</div>
                    <div className="text-sm text-gray-500">
                      {campaign.platform === 'twitter' ? 'Replies' : 'Comments'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{campaign.engagement.clicks}</div>
                    <div className="text-sm text-gray-500">Clicks</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Analytics Summary */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {filteredCampaigns.reduce((sum, c) => sum + c.engagement.likes, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Likes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {filteredCampaigns.reduce((sum, c) => sum + (c.engagement.retweets || c.engagement.shares), 0)}
              </div>
              <div className="text-sm text-gray-500">Total Shares</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {filteredCampaigns.reduce((sum, c) => sum + (c.engagement.replies || c.engagement.comments), 0)}
              </div>
              <div className="text-sm text-gray-500">Total Comments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {filteredCampaigns.reduce((sum, c) => sum + c.engagement.clicks, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Clicks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaManager;
