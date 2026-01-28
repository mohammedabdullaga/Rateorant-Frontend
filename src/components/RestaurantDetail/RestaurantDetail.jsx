import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { UserContext } from '../../contexts/UserContext';

import * as restaurantService from '../../services/restaurantService';
import * as reviewService from '../../services/reviewService';
import ReviewForm from '../ReviewForm/ReviewForm';
import ReviewList from '../ReviewList/ReviewList';
import './RestaurantDetail.css';

const RestaurantDetail = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch restaurant details with categories
        const restaurantData = await restaurantService.getRestaurantById(restaurantId);
        console.log('🏪 Restaurant data received:', restaurantData);
        console.log('   owner_id:', restaurantData?.owner_id, '(type:', typeof restaurantData?.owner_id + ')');
        setRestaurant(restaurantData);

        // Fetch reviews
        const reviewsData = await reviewService.getReviewsByRestaurant(restaurantId);
        console.log('Reviews data fetched:', reviewsData);
        console.log('Reviews data type:', typeof reviewsData);
        console.log('Is array:', Array.isArray(reviewsData));
        setReviews(reviewsData);
      } catch (err) {
        console.error(err);
        setError('Failed to load restaurant details');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) fetchData();
  }, [restaurantId]);

  const handleReviewAdded = (newReview) => {
    setReviews([...reviews, newReview]);
  };

  if (loading) return <main className="restaurant-detail-loading"><div className="restaurant-detail-spinner"></div></main>;
  if (error) return <main className="restaurant-detail-error">{error}</main>;
  if (!restaurant) return <main className="restaurant-detail-not-found">Restaurant not found</main>;

  return (
    <main className="restaurant-detail-main">
      <div className="restaurant-detail-container">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="restaurant-detail-back-button"
        >
          ← Back to Restaurants
        </button>

        {/* Restaurant Card */}
        <div className="restaurant-detail-card">
          {/* Hero Image */}
          {restaurant.image_url && (
            <div className="restaurant-detail-image">
              <img 
                src={restaurant.image_url} 
                alt={restaurant.name}
              />
            </div>
          )}

          {/* Restaurant Info */}
          <div className="restaurant-detail-info">
            <h1 className="restaurant-detail-title">{restaurant.name}</h1>
            
            {/* Location */}
            <div className="restaurant-detail-location">
              <span className="restaurant-detail-location-icon">📍</span>
              <p className="restaurant-detail-location-text">{restaurant.location}</p>
            </div>

            {/* Description */}
            <p className="restaurant-detail-description">
              {restaurant.description}
            </p>

            {/* Categories */}
            {restaurant.categories && restaurant.categories.length > 0 && (
              <div className="restaurant-detail-categories">
                <h3 className="restaurant-detail-categories-title">Categories</h3>
                <div className="restaurant-detail-categories-list">
                  {restaurant.categories.map((cat, idx) => (
                    <span 
                      key={idx}
                      className="restaurant-detail-badge"
                    >
                      {cat.category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="restaurant-detail-reviews-section">
            <h2 className="restaurant-detail-reviews-title">Reviews & Ratings</h2>

            {/* Owner View Notice */}
            {String(restaurant.owner_id) === String(user?.id) ? (
              <div className="restaurant-detail-owner-notice">
                <p className="restaurant-detail-owner-notice-title">
                  You're viewing all customer comments for your restaurant.
                </p>
                <p className="restaurant-detail-owner-notice-message">
                  Use this feedback to improve your restaurant experience.
                </p>
              </div>
            ) : (
              <>
                <div className="restaurant-detail-review-form-section">
                  <ReviewForm 
                    restaurantId={restaurantId}
                    restaurantName={restaurant.name}
                    restaurantOwnerId={restaurant.owner_id}
                    onReviewAdded={(newReview) => setReviews([...reviews, newReview])}
                  />
                </div>
                <p className="restaurant-detail-review-prompt">
                  See what other diners think about this restaurant before leaving your own rating.
                </p>
              </>
            )}

            {/* Reviews List */}
            <div className="restaurant-detail-reviews-list-section">
              <ReviewList 
                reviews={reviews}
                restaurantId={restaurantId}
                onReviewsUpdated={setReviews}
                isOwner={String(restaurant.owner_id) === String(user?.id)}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RestaurantDetail;
