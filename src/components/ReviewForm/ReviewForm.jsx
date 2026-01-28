import { useState, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import * as reviewService from '../../services/reviewService';
import * as backendNotificationService from '../../services/backendNotificationService';

const ReviewForm = ({ restaurantId, restaurantName, restaurantOwnerId, onReviewAdded }) => {
  const { user } = useContext(UserContext);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Debug logging
  console.log('ReviewForm props:', { restaurantId, restaurantName, restaurantOwnerId, userId: user?.id, userName: user?.username });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rating' ? parseInt(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to leave a review');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const review = await reviewService.createReview(
        restaurantId,
        formData,
        localStorage.getItem('token')
      );

      console.log('✅ Review created successfully:', review);

      // Add notification for restaurant owner (via backend)
      console.log('🔍 Checking notification conditions:');
      console.log('   restaurantOwnerId:', restaurantOwnerId, 'type:', typeof restaurantOwnerId);
      console.log('   restaurantName:', restaurantName);
      
      if (restaurantOwnerId && restaurantName) {
        try {
          const token = localStorage.getItem('token');
          // Backend will create the notification
          console.log('📧 Creating notification for owner:', restaurantOwnerId);
          // Note: Backend creates notification automatically when review is created
          // No need to call notification service here
        } catch (error) {
          console.error('Error with notification:', error);
        }
      } else {
        console.warn('⚠️ Cannot create notification - missing data:', { restaurantOwnerId, restaurantName });
      }

      setSuccess('Review added successfully!');
      onReviewAdded(review);
      setFormData({ rating: 5, comment: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add review');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="card bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <div className="text-center">
          <p className="text-indigo-700 text-sm font-medium">
            Please sign in to leave a review
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card bg-white border border-slate-200 rounded-lg p-8">
      <h3 className="text-2xl font-bold text-slate-900 mb-6">Leave a Review</h3>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-red-700 text-sm font-semibold">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded">
          <p className="text-emerald-700 text-sm font-semibold">{success}</p>
        </div>
      )}

      <div className="mb-6">
        <label htmlFor='rating' className="input-label block text-slate-900 font-semibold mb-2">
          Rating
        </label>
        <select
          id='rating'
          name='rating'
          value={formData.rating}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-colors"
        >
          <option value={5}>★★★★★ - Excellent</option>
          <option value={4}>★★★★☆ - Good</option>
          <option value={3}>★★★☆☆ - Average</option>
          <option value={2}>★★☆☆☆ - Poor</option>
          <option value={1}>★☆☆☆☆ - Terrible</option>
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor='comment' className="input-label block text-slate-900 font-semibold mb-2">
          Comment (Optional)
        </label>
        <textarea
          id='comment'
          name='comment'
          value={formData.comment}
          onChange={handleChange}
          placeholder='Share your experience, what did you like or dislike?'
          rows='4'
          className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 resize-vertical"
        />
      </div>

      <button 
        type='submit' 
        disabled={loading} 
        className="btn-primary w-full"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
