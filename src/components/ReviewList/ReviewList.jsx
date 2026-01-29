import { useContext, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';
import * as reviewService from '../../services/reviewService';
import '../ReviewForm/ReviewForm.css';

const ReviewList = ({ reviews, restaurantId, onReviewsUpdated, isOwner = false }) => {
  const { user } = useContext(UserContext);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, reviewId: null });

  const getStarRating = (rating) => {
    return '⭐'.repeat(rating);
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

  const openDeleteModal = (reviewId) => {
    setDeleteModal({ isOpen: true, reviewId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, reviewId: null });
  };

  const confirmDelete = async () => {
    const reviewId = deleteModal.reviewId;
    try {
      const token = localStorage.getItem('token');
      await reviewService.deleteReview(restaurantId, reviewId, token);
      
      // Update the reviews list by filtering out the deleted review
      const updatedReviews = reviews.filter(review => review.id !== reviewId);
      onReviewsUpdated(updatedReviews);
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review');
      closeDeleteModal();
    }
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="review-empty">
        <p>
          No reviews yet. {!isOwner ? 'Be the first to review this restaurant!' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="review-list-container">
      <h3 className="review-list-header">Reviews ({reviews.length})</h3>
      
      <div className="review-list">
        {reviews.map(review => {
          console.log('📝 Rendering review:', { id: review.id, username: review.username, user_id: review.user_id, user: review.user });
          return (
          <div 
            key={review.id} 
            className={`review-item ${isOwner ? 'owner-review' : ''}`}
          >
            <div className="review-item-header">
              <div className="review-item-info">
                <div className="review-item-rating">
                  {'★'.repeat(review.rating)}
                </div>
                <p className="review-item-score">
                  Rating: {review.rating} / 5
                </p>
                <p className="review-item-commenter">
                  By: <strong>{review.username || review.user?.username || `User ${review.user_id}`}</strong>
                </p>
              </div>
              <time className="review-item-date">
                {formatDate(review.created_at)}
              </time>
            </div>

            {review.comment && (
              <div className="review-item-comment">
                <p className="review-item-comment-text">
                  {review.comment}
                </p>
              </div>
            )}

            {/* Delete button only for user's own review, not for owner */}
            {!isOwner && user && String(user.id) === String(review.user_id) && (
              <div className="review-item-actions">
                <button 
                  className="review-item-action-button delete"
                  onClick={() => openDeleteModal(review.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Delete Review</h3>
              <button 
                className="modal-close-btn"
                onClick={closeDeleteModal}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p className="modal-message">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
            </div>

            <div className="modal-footer">
              <button 
                className="modal-button modal-button-cancel"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button 
                className="modal-button modal-button-delete"
                onClick={confirmDelete}
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};  

export default ReviewList;
