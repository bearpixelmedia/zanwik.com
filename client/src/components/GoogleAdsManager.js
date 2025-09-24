import React, { useState, useEffect } from 'react';

const GoogleAdsManager = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Mock campaign data
  const mockCampaigns = [
    {
      id: 1,
      name: "API Directory - Brand Awareness",
      status: "Active",
      budget: 1000,
      spent: 450,
      impressions: 125000,
      clicks: 3200,
      ctr: 2.56,
      cpc: 0.14,
      conversions: 45,
      conversionRate: 1.41,
      keywords: ["API directory", "API testing", "developer tools"],
      adGroups: 3,
      ads: 9
    },
    {
      id: 2,
      name: "API Integration - Search Campaign",
      status: "Active",
      budget: 2000,
      spent: 1200,
      impressions: 89000,
      clicks: 2100,
      ctr: 2.36,
      cpc: 0.57,
      conversions: 78,
      conversionRate: 3.71,
      keywords: ["API integration", "REST API", "API documentation"],
      adGroups: 5,
      ads: 15
    },
    {
      id: 3,
      name: "Developer Tools - Display Campaign",
      status: "Paused",
      budget: 800,
      spent: 320,
      impressions: 45000,
      clicks: 890,
      ctr: 1.98,
      cpc: 0.36,
      conversions: 23,
      conversionRate: 2.58,
      keywords: ["developer resources", "programming tools", "API testing"],
      adGroups: 2,
      ads: 6
    }
  ];

  useEffect(() => {
    setCampaigns(mockCampaigns);
  }, []);

  const handleCreateCampaign = () => {
    const newCampaign = {
      id: Date.now(),
      name: "New Campaign",
      status: "Draft",
      budget: 500,
      spent: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      conversions: 0,
      conversionRate: 0,
      keywords: [],
      adGroups: 0,
      ads: 0
    };
    setCampaigns([...campaigns, newCampaign]);
  };

  const handleCampaignStatusChange = (campaignId, newStatus) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: newStatus }
        : campaign
    ));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num) => {
    return `${num.toFixed(2)}%`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Google Ads Campaign Manager</h1>
          <p className="text-gray-600">Manage your Google Ads campaigns and track performance</p>
        </div>

        {/* Campaign Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Budget</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(campaigns.reduce((sum, c) => sum + c.budget, 0))}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Spent</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(campaigns.reduce((sum, c) => sum + c.spent, 0))}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Clicks</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(campaigns.reduce((sum, c) => sum + c.clicks, 0))}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Conversions</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(campaigns.reduce((sum, c) => sum + c.conversions, 0))}
            </p>
          </div>
        </div>

        {/* Campaign Actions */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Campaigns</h2>
          <button
            onClick={handleCreateCampaign}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Campaign
          </button>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">
                          {campaign.adGroups} ad groups • {campaign.ads} ads
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        campaign.status === 'Active' 
                          ? 'bg-green-100 text-green-800'
                          : campaign.status === 'Paused'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(campaign.budget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(campaign.spent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(campaign.clicks)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercentage(campaign.ctr)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(campaign.cpc)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(campaign.conversions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedCampaign(campaign)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleCampaignStatusChange(
                            campaign.id, 
                            campaign.status === 'Active' ? 'Paused' : 'Active'
                          )}
                          className="text-green-600 hover:text-green-900"
                        >
                          {campaign.status === 'Active' ? 'Pause' : 'Resume'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campaign Details Modal */}
        {selectedCampaign && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedCampaign.name}
                  </h3>
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-700">Performance Metrics</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Impressions:</span>
                        <span className="text-sm font-medium">{formatNumber(selectedCampaign.impressions)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Clicks:</span>
                        <span className="text-sm font-medium">{formatNumber(selectedCampaign.clicks)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">CTR:</span>
                        <span className="text-sm font-medium">{formatPercentage(selectedCampaign.ctr)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">CPC:</span>
                        <span className="text-sm font-medium">{formatCurrency(selectedCampaign.cpc)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Conversions:</span>
                        <span className="text-sm font-medium">{formatNumber(selectedCampaign.conversions)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Conversion Rate:</span>
                        <span className="text-sm font-medium">{formatPercentage(selectedCampaign.conversionRate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700">Keywords</h4>
                    <div className="mt-2">
                      {selectedCampaign.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-2"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Edit Campaign
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleAdsManager;
