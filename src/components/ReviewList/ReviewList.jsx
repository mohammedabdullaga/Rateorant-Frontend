import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';

const ReviewList = ({ reviews, restaurantId, onReviewsUpdated, isOwner = false }) => {
  const { user } = useContext(UserContext);

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

  if (!reviews || reviews.length === 0) {
    return (
      <div className="card text-center py-12 bg-slate-50 border border-slate-200 rounded-lg">
        <p className="text-slate-600 text-sm font-medium">
          No reviews yet. {!isOwner ? 'Be the first to review this restaurant!' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-900">Reviews ({reviews.length})</h3>
      </div>
      
      <div className="space-y-5">
        {reviews.map(review => (
          <div 
            key={review.id} 
            className={`card bg-white rounded-lg border p-6 transition-shadow hover:shadow-md ${
              isOwner ? 'border-l-4 border-l-amber-500' : 'border border-slate-200 border-l-indigo-500'
            }`}
          >
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="flex-1">
                <div className="text-2xl mb-2 text-amber-400">
                  {'★'.repeat(review.rating)}
                </div>
                <p className="text-slate-700 text-sm font-semibold">
                  Rating: {review.rating} / 5
                </p>
                {isOwner && (
                  <p className="text-slate-600 text-xs mt-2">
                    User ID: {review.user_id}
                  </p>
                )}
              </div>
              <time className="text-slate-500 text-xs font-medium whitespace-nowrap">
                {formatDate(review.created_at)}
              </time>
            </div>

            {review.comment && (
              <div className="bg-slate-50 px-4 py-3 rounded-lg border-l-4 border-l-indigo-500 mt-4">
                <p className="text-slate-700 text-sm leading-relaxed">
                  {review.comment}
                </p>
              </div>
            )}

            {/* Edit/Delete buttons only for user's own review, not for owner */}
            {!isOwner && user && String(user.id) === String(review.user_id) && (
              <div className="mt-4 flex gap-2">
                <button className="text-xs font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 px-3 py-1.5 rounded transition-colors">
                  Edit
                </button>
                <button className="text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1.5 rounded transition-colors">
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
