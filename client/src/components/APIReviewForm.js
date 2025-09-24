import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const APIReviewForm = ({ apiId, apiName }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    content: '',
    pros: [],
    cons: []
  });
  const [prosInput, setProsInput] = useState('');
  const [consInput, setConsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState([]);

  // Load existing reviews
  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/community/apis/${apiId}/reviews`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  useEffect(() => {
    if (apiId) {
      loadReviews();
    }
  }, [apiId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addPro = () => {
    if (prosInput.trim()) {
      setFormData(prev => ({
        ...prev,
        pros: [...prev.pros, prosInput.trim()]
      }));
      setProsInput('');
    }
  };

  const removePro = (index) => {
    setFormData(prev => ({
      ...prev,
      pros: prev.pros.filter((_, i) => i !== index)
    }));
  };

  const addCon = () => {
    if (consInput.trim()) {
      setFormData(prev => ({
        ...prev,
        cons: [...prev.cons, consInput.trim()]
      }));
      setConsInput('');
    }
  };

  const removeCon = (index) => {
    setFormData(prev => ({
      ...prev,
      cons: prev.cons.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/community/apis/${apiId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          userId: 'current-user' // This would come from auth context
        })
      });

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        setFormData({
          rating: 5,
          title: '',
          content: '',
          pros: [],
          cons: []
        });
        loadReviews(); // Reload reviews
      } else {
        alert('Failed to submit review: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const rateReviewHelpfulness = async (reviewId, helpful) => {
    try {
      const response = await fetch(`/api/community/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'current-user',
          helpful
        })
      });

      const data = await response.json();
      if (data.success) {
        loadReviews(); // Reload reviews to update helpfulness counts
      }
    } catch (error) {
      console.error('Error rating review:', error);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
            className={`text-2xl ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-300 cursor-pointer' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (submitted) {
    return (
      <Card className="p-6 text-center">
        <div className="text-6xl mb-4">⭐</div>
        <h2 className="text-2xl font-bold text-green-600 mb-4">Review Submitted!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your review. It will help other developers make informed decisions.
        </p>
        <Button onClick={() => setSubmitted(false)}>
          Write Another Review
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Form */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Write a Review for {apiName}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Rating *</label>
            {renderStars(formData.rating, true, (rating) => 
              setFormData(prev => ({ ...prev, rating }))
            )}
          </div>
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Review Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md"
              placeholder="Summarize your experience with this API"
            />
          </div>
          
          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-1">Review Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full p-2 border rounded-md"
              placeholder="Share your detailed experience with this API..."
            />
          </div>
          
          {/* Pros */}
          <div>
            <label className="block text-sm font-medium mb-2">Pros</label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={prosInput}
                  onChange={(e) => setProsInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
                  className="flex-1 p-2 border rounded-md"
                  placeholder="Add a positive point..."
                />
                <Button type="button" onClick={addPro} variant="outline">
                  Add
                </Button>
              </div>
              <div className="space-y-1">
                {formData.pros.map((pro, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                    <span className="text-sm text-green-800">✓ {pro}</span>
                    <button
                      type="button"
                      onClick={() => removePro(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Cons */}
          <div>
            <label className="block text-sm font-medium mb-2">Cons</label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={consInput}
                  onChange={(e) => setConsInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
                  className="flex-1 p-2 border rounded-md"
                  placeholder="Add a negative point..."
                />
                <Button type="button" onClick={addCon} variant="outline">
                  Add
                </Button>
              </div>
              <div className="space-y-1">
                {formData.cons.map((con, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded">
                    <span className="text-sm text-red-800">✗ {con}</span>
                    <button
                      type="button"
                      onClick={() => removeCon(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Existing Reviews */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Reviews ({reviews.length})</h3>
        
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">{review.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      by User {review.userId.slice(-6)}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-gray-700 mb-3">{review.content}</p>
              
              {(review.pros.length > 0 || review.cons.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  {review.pros.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-green-800 mb-1">Pros</h5>
                      <ul className="text-sm text-green-700">
                        {review.pros.map((pro, index) => (
                          <li key={index}>✓ {pro}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {review.cons.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-red-800 mb-1">Cons</h5>
                      <ul className="text-sm text-red-700">
                        {review.cons.map((con, index) => (
                          <li key={index}>✗ {con}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <button
                  onClick={() => rateReviewHelpfulness(review.id, true)}
                  className="hover:text-green-600"
                >
                  👍 {review.helpful} helpful
                </button>
                <button
                  onClick={() => rateReviewHelpfulness(review.id, false)}
                  className="hover:text-red-600"
                >
                  👎 {review.notHelpful} not helpful
                </button>
              </div>
            </div>
          ))}
          
          {reviews.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No reviews yet. Be the first to review this API!
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default APIReviewForm;
