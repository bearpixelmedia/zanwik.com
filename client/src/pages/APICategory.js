import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const APICategory = () => {
  const { category } = useParams();
  const [categoryData, setCategoryData] = useState(null);
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategoryData();
  }, [category]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load category APIs
      const response = await fetch(`http://localhost:8080/api/apis/category/${category}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setCategoryData(data.data.category);
        setApis(data.data.apis);
      } else {
        setError(data.error || 'Category not found');
      }
    } catch (err) {
      console.error('Error loading category data:', err);
      setError('Failed to load category information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/apis">
            <Button>Back to API Directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <Link to="/apis" className="hover:text-gray-700">API Directory</Link>
                <span>/</span>
                <span className="text-gray-900">{categoryData?.name}</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">
                {categoryData?.icon} {categoryData?.name}
              </h1>
              <p className="mt-2 text-gray-600">{categoryData?.description}</p>
              <p className="mt-1 text-sm text-gray-500">
                {apis.length} APIs available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* API Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {apis.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No APIs found</h3>
            <p className="text-gray-600">This category doesn't have any APIs yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apis.map((api) => (
              <Card key={api.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{api.name}</h3>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-600">{api.rating || '4.5'}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {api.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {api.https && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        HTTPS
                      </span>
                    )}
                    {api.cors && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        CORS
                      </span>
                    )}
                    {api.free && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Free
                      </span>
                    )}
                  </div>
                  
                  <Link to={`/apis/category/${category}/${api.id}`}>
                    <Button size="sm">View Details</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default APICategory;
