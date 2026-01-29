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
  const [mapPreview, setMapPreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch restaurant details with categories
        const restaurantData = await restaurantService.getRestaurantById(restaurantId);
        console.log('🏪 Restaurant data received:', restaurantData);
        console.log('   owner_id:', restaurantData?.owner_id, '(type:', typeof restaurantData?.owner_id + ')');
        setRestaurant(restaurantData);

        // Generate map preview from location
        if (restaurantData.location) {
          await generateMapPreviewFromLocation(restaurantData.location);
        }

        // Fetch reviews
        const reviewsData = await reviewService.getReviewsByRestaurant(restaurantId);
        console.log('Reviews data fetched:', reviewsData);
        console.log('Reviews data type:', typeof reviewsData);
        console.log('Is array:', Array.isArray(reviewsData));
        
        // Enrich reviews with user information
        const enrichedReviews = enrichReviewsWithUserInfo(reviewsData);
        setReviews(enrichedReviews);
      } catch (err) {
        console.error(err);
        setError('Failed to load restaurant details');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) fetchData();
  }, [restaurantId, user]);

  // Generate map preview by geocoding location name
  const generateMapPreviewFromLocation = async (location) => {
    try {
      // Use Nominatim (Open Street Map geocoding) - free, no API key needed
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`
      );
      const results = await response.json();

      if (!results || results.length === 0) {
        console.warn('Could not find location on map');
        return;
      }

      const { lat, lon } = results[0];
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      // Generate embedded Google Maps URL
      const googleMapsEmbedUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`;

      setMapPreview({
        url: googleMapsEmbedUrl,
        latitude,
        longitude
      });
    } catch (err) {
      console.error('Error generating map preview:', err);
    }
  };

  // Enrich reviews with user information
  const enrichReviewsWithUserInfo = (reviewsData) => {
    if (!Array.isArray(reviewsData)) return [];
    
    return reviewsData.map(review => {
      // If review already has username, keep it
      if (review.username) return review;
      
      // If current user is the reviewer, add their username
      if (user && String(review.user_id) === String(user.id)) {
        return {
          ...review,
          username: user.username,
          user: { username: user.username }
        };
      }
      
      // For other users, keep user_id (will show fallback "User X" in ReviewList)
      return review;
    });
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

            {/* Map Preview */}
            {mapPreview && (
              <div className="restaurant-detail-map-preview">
                <iframe
                  src={mapPreview.url}
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: '0.5rem' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Restaurant Location Map"
                  className="restaurant-detail-map-iframe"
                />
              </div>
            )}

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
                    onReviewAdded={(newReview) => {
                      console.log('✅ New review added:', newReview);
                      const enriched = enrichReviewsWithUserInfo([newReview]);
                      setReviews([...reviews, enriched[0]]);
                    }}
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
