import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { UserContext } from '../../contexts/UserContext';

import * as restaurantService from '../../services/restaurantService';
import * as reviewService from '../../services/reviewService';
import ReviewForm from '../ReviewForm/ReviewForm';
import ReviewList from '../ReviewList/ReviewList';

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

  if (loading) return <main className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></main>;
  if (error) return <main className="py-12 px-4"><div className="text-center text-red-600 font-semibold">{error}</div></main>;
  if (!restaurant) return <main className="py-12 px-4"><div className="text-center text-slate-600 font-semibold">Restaurant not found</div></main>;

  return (
    <main className="bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-lg transition-colors"
        >
          ← Back to Restaurants
        </button>

        {/* Restaurant Card */}
        <div className="card bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
          {/* Hero Image */}
          {restaurant.image_url && (
            <div className="w-full h-96 overflow-hidden">
              <img 
                src={restaurant.image_url} 
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Restaurant Info */}
          <div className="p-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{restaurant.name}</h1>
            
            {/* Location */}
            <div className="flex items-center gap-3 text-slate-700 mb-4">
              <span className="text-2xl">📍</span>
              <p className="text-lg">{restaurant.location}</p>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              {restaurant.description}
            </p>

            {/* Categories */}
            {restaurant.categories && restaurant.categories.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-slate-900 mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.categories.map((cat, idx) => (
                    <span 
                      key={idx}
                      className="badge bg-indigo-100 text-indigo-700"
                    >
                      {cat.category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="border-t border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Reviews & Ratings</h2>

            {/* Owner View Notice */}
            {String(restaurant.owner_id) === String(user?.id) ? (
              <div className="mb-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <p className="text-amber-900 font-semibold">
                  You're viewing all customer comments for your restaurant.
                </p>
                <p className="text-amber-800 text-sm mt-1">
                  Use this feedback to improve your restaurant experience.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <ReviewForm 
                    restaurantId={restaurantId}
                    restaurantName={restaurant.name}
                    restaurantOwnerId={restaurant.owner_id}
                    onReviewAdded={(newReview) => setReviews([...reviews, newReview])}
                  />
                </div>
                <p className="text-slate-600 text-sm mb-6">
                  See what other diners think about this restaurant before leaving your own rating.
                </p>
              </>
            )}

            {/* Reviews List */}
            <div className="mt-8">
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
