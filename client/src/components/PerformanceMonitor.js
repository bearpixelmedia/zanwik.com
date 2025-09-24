import React, { useState, useEffect } from 'react';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    pageLoadTime: 0,
    apiResponseTime: 0,
    errorRate: 0,
    uptime: 0,
    memoryUsage: 0,
    cpuUsage: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Mock performance data
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMonitoring) {
        setMetrics({
          pageLoadTime: Math.random() * 2000 + 500, // 500-2500ms
          apiResponseTime: Math.random() * 1000 + 100, // 100-1100ms
          errorRate: Math.random() * 5, // 0-5%
          uptime: 99.5 + Math.random() * 0.5, // 99.5-100%
          memoryUsage: Math.random() * 50 + 30, // 30-80%
          cpuUsage: Math.random() * 40 + 10 // 10-50%
        });

        // Generate random alerts
        if (Math.random() < 0.1) { // 10% chance of alert
          const alertTypes = [
            { type: 'error', message: 'High error rate detected', severity: 'high' },
            { type: 'performance', message: 'Page load time exceeded threshold', severity: 'medium' },
            { type: 'uptime', message: 'Service availability below 99%', severity: 'high' },
            { type: 'memory', message: 'Memory usage above 80%', severity: 'medium' },
            { type: 'api', message: 'API response time degraded', severity: 'low' }
          ];
          
          const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
          const newAlert = {
            id: Date.now(),
            ...randomAlert,
            timestamp: new Date().toISOString(),
            acknowledged: false
          };
          
          setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep last 10 alerts
        }
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const handleAcknowledgeAlert = (alertId) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true }
        : alert
    ));
  };

  const handleDismissAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.high) return 'text-red-600';
    if (value >= thresholds.medium) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTime = (ms) => {
    return `${ms.toFixed(0)}ms`;
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Monitor</h1>
            <p className="text-gray-600">Real-time monitoring of your application performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
              </span>
            </div>
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                isMonitoring 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMonitoring ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Page Load Time</h3>
              <span className={`text-2xl font-bold ${getStatusColor(metrics.pageLoadTime, { medium: 1500, high: 2000 })}`}>
                {formatTime(metrics.pageLoadTime)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((metrics.pageLoadTime / 3000) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Target: &lt; 1500ms</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">API Response Time</h3>
              <span className={`text-2xl font-bold ${getStatusColor(metrics.apiResponseTime, { medium: 500, high: 1000 })}`}>
                {formatTime(metrics.apiResponseTime)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((metrics.apiResponseTime / 1500) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Target: &lt; 500ms</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Error Rate</h3>
              <span className={`text-2xl font-bold ${getStatusColor(metrics.errorRate, { medium: 2, high: 5 })}`}>
                {formatPercentage(metrics.errorRate)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((metrics.errorRate / 10) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Target: &lt; 2%</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Uptime</h3>
              <span className={`text-2xl font-bold ${getStatusColor(100 - metrics.uptime, { medium: 0.5, high: 1 })}`}>
                {formatPercentage(metrics.uptime)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.uptime}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Target: &gt; 99.5%</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Memory Usage</h3>
              <span className={`text-2xl font-bold ${getStatusColor(metrics.memoryUsage, { medium: 70, high: 85 })}`}>
                {formatPercentage(metrics.memoryUsage)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.memoryUsage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Target: &lt; 70%</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">CPU Usage</h3>
              <span className={`text-2xl font-bold ${getStatusColor(metrics.cpuUsage, { medium: 60, high: 80 })}`}>
                {formatPercentage(metrics.cpuUsage)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.cpuUsage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Target: &lt; 60%</p>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Alerts</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {alerts.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No alerts in the last 24 hours
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className={`px-6 py-4 ${alert.acknowledged ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        alert.severity === 'high' ? 'bg-red-500' :
                        alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      {!alert.acknowledged && (
                        <button
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Performance History Chart Placeholder */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance History</h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500">Performance charts would be displayed here</p>
              <p className="text-sm text-gray-400">Integration with Chart.js or similar library</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
