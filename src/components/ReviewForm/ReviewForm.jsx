import { useState, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import * as reviewService from '../../services/reviewService';
import * as backendNotificationService from '../../services/backendNotificationService';
import './ReviewForm.css';

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

      // Ensure the review includes user information for display
      const reviewWithUser = {
        ...review,
        username: user.username,
        user_name: user.username,
        user: { username: user.username }
      };
      
      console.log('✅ Review enriched with user data:', reviewWithUser);

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
      onReviewAdded(reviewWithUser);
      setFormData({ rating: 5, comment: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add review');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="review-form">
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#4f46e5', fontSize: '0.875rem', fontWeight: '500' }}>
            Please sign in to leave a review
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3 className="review-form-title">Leave a Review</h3>

      {error && (
        <div className="review-form-error">
          <p className="review-form-error-message">{error}</p>
        </div>
      )}
      {success && (
        <div className="review-form-success">
          <p className="review-form-success-message">{success}</p>
        </div>
      )}

      <div className="review-form-group">
        <label htmlFor='rating' className="review-form-label">
          Rating
        </label>
        <select
          id='rating'
          name='rating'
          value={formData.rating}
          onChange={handleChange}
          required
          className="review-form-select"
        >
          <option value={5}>★★★★★ - Excellent</option>
          <option value={4}>★★★★☆ - Good</option>
          <option value={3}>★★★☆☆ - Average</option>
          <option value={2}>★★☆☆☆ - Poor</option>
          <option value={1}>★☆☆☆☆ - Terrible</option>
        </select>
      </div>

      <div className="review-form-group">
        <label htmlFor='comment' className="review-form-label">
          Comment (Optional)
        </label>
        <textarea
          id='comment'
          name='comment'
          value={formData.comment}
          onChange={handleChange}
          placeholder='Share your experience, what did you like or dislike?'
          rows='4'
          className="review-form-textarea"
        />
      </div>

      <button 
        type='submit' 
        disabled={loading} 
        className="btn-primary review-form-button"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
