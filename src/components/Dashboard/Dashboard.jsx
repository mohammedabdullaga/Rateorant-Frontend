import { useEffect, useState, useContext } from 'react';
import { Link, useSearchParams } from 'react-router';

import { UserContext } from '../../contexts/UserContext';

import * as restaurantService from '../../services/restaurantService';
import * as favoritesService from '../../services/favoritesService';
import * as reviewService from '../../services/reviewService';

const Dashboard = ({ role = 'user' }) => {
  // Access the user object from UserContext
  const { user } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  
  // Get the refreshed parameter from URL query string
  const refreshed = searchParams.get('refreshed');

  const [restaurants, setRestaurants] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restaurantRatings, setRestaurantRatings] = useState({});

  // useEffect runs after the component renders
  // This is where we perform side effects like API calls
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all restaurants
        const allRestaurants = await restaurantService.getAllRestaurants();
        
        // Ensure it's an array
        if (!Array.isArray(allRestaurants)) {
          throw new Error('Invalid restaurants data format');
        }
        
        // If it's a regular user, show all restaurants
        if (role === 'user') {
          setRestaurants(allRestaurants);
          
          // Also fetch their favorites
          if (user) {
            const userFavorites = await favoritesService.getAllFavorites(localStorage.getItem('token'));
            
            // Ensure it's an array and extract restaurant IDs
            if (Array.isArray(userFavorites)) {
              setFavorites(userFavorites.map(fav => fav.restaurant_id));
            } else {
              setFavorites([]);
            }
          }
        }
        // If it's an owner, filter restaurants to only show their own
        else if (role === 'owner' && user) {
          console.log('Filtering restaurants for owner. User ID:', user.id);
          console.log('All restaurants:', allRestaurants);
          
          const ownerRestaurants = allRestaurants.filter(rest => {
            const match = String(rest.owner_id) === String(user.id);
            console.log(`Comparing owner_id ${rest.owner_id} with user.id ${user.id}: ${match}`);
            return match;
          });
          
          console.log('Owner restaurants after filter:', ownerRestaurants);
          setRestaurants(ownerRestaurants);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchData();
    }

  }, [user, role, refreshed]);

  // Fetch ratings whenever restaurants change
  useEffect(() => {
    if (restaurants.length > 0) {
      fetchRestaurantRatings();
    }
  }, [restaurants]);

  const handleAddToFavorites = async (restaurantId) => {
    try {
      await favoritesService.addToFavorites(restaurantId, localStorage.getItem('token'));
      setFavorites([...favorites, restaurantId]);
    } catch (err) {
      console.error('Error adding to favorites:', err);
    }
  };

  const handleRemoveFromFavorites = async (restaurantId) => {
    try {
      await favoritesService.removeFromFavorites(restaurantId, localStorage.getItem('token'));
      setFavorites(favorites.filter(id => id !== restaurantId));
    } catch (err) {
      console.error('Error removing from favorites:', err);
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) {
      return;
    }

    try {
      await restaurantService.deleteRestaurant(restaurantId, localStorage.getItem('token'));
      setRestaurants(restaurants.filter(r => r.id !== restaurantId));
      alert('Restaurant deleted successfully');
    } catch (err) {
      console.error('Error deleting restaurant:', err);
      setError(err.response?.data?.detail || 'Failed to delete restaurant');
    }
  };

  const calculateAverageRating = (restaurantId) => {
    const rating = restaurantRatings[restaurantId];
    if (!rating || rating.count === 0) return 0;
    return (rating.total / rating.count).toFixed(1);
  };

  const getRatingStars = (rating) => {
    const stars = Math.round(rating);
    return '⭐'.repeat(stars);
  };

  // Fetch ratings for all restaurants
  const fetchRestaurantRatings = async () => {
    try {
      const ratings = {};
      for (const restaurant of restaurants) {
        const reviews = await reviewService.getReviewsByRestaurant(restaurant.id);
        if (Array.isArray(reviews) && reviews.length > 0) {
          const total = reviews.reduce((sum, r) => sum + r.rating, 0);
          ratings[restaurant.id] = { total, count: reviews.length };
        } else {
          ratings[restaurant.id] = { total: 0, count: 0 };
        }
      }
      setRestaurantRatings(ratings);
    } catch (err) {
      console.error('Error fetching ratings:', err);
    }
  };

  if (loading) return <main className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></main>;

  return (
    <main className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-lg text-slate-600">
            {role === 'owner' 
              ? 'Manage and monitor your restaurant listings' 
              : 'Discover and rate the best restaurants in your area'}
          </p>
        </div>

        {/* Add Restaurant Button for Owners */}
        {role === 'owner' && (
          <div className="mb-10">
            <Link to="/add-restaurant" className="inline-block">
              <button className="btn-success px-8 py-3 text-lg font-semibold shadow-md hover:shadow-lg transition-shadow">
                + Add New Restaurant
              </button>
            </Link>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Restaurants Grid */}
        {Array.isArray(restaurants) && restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map(restaurant => (
              <div 
                key={restaurant.id} 
                className="card-hover flex flex-col overflow-hidden bg-white rounded-lg shadow-md border border-slate-200 transition-all duration-300"
              >
                {/* Restaurant Image */}
                {restaurant.image_url && (
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
                    <img 
                      src={restaurant.image_url} 
                      alt={restaurant.name} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                )}

                {/* Restaurant Content */}
                <div className="flex-1 p-6 flex flex-col">
                  {/* Title and Rating */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-2 flex-1">
                      {restaurant.name}
                    </h3>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg mb-1">
                        {getRatingStars(calculateAverageRating(restaurant.id))}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {restaurantRatings[restaurant.id]?.count || 0} reviews
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-slate-600 mb-4">
                    <span>📍</span>
                    <p className="text-sm font-medium">{restaurant.location}</p>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">
                    {restaurant.description}
                  </p>

                  {/* Action Buttons */}
                  {role === 'user' && (
                    <div className="space-y-3">
                      <Link to={`/restaurant/${restaurant.id}`} className="block">
                        <button className="btn-primary w-full py-2 px-4 text-sm font-semibold">
                          View Details
                        </button>
                      </Link>
                      {favorites.includes(restaurant.id) ? (
                        <button 
                          onClick={() => handleRemoveFromFavorites(restaurant.id)}
                          className="w-full py-2 px-4 bg-red-50 text-red-600 font-semibold rounded-lg border border-red-200 hover:bg-red-100 transition-colors text-sm"
                        >
                          ❤️ Remove from Favorites
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAddToFavorites(restaurant.id)}
                          className="w-full py-2 px-4 bg-slate-100 text-slate-600 font-semibold rounded-lg border border-slate-300 hover:bg-slate-200 transition-colors text-sm"
                        >
                          🤍 Add to Favorites
                        </button>
                      )}
                    </div>
                  )}

                  {role === 'owner' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Link to={`/edit-restaurant/${restaurant.id}`} className="block">
                          <button className="w-full py-2 px-3 bg-amber-50 text-amber-600 font-semibold rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors text-sm">
                            ✏️ Edit
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDeleteRestaurant(restaurant.id)}
                          className="w-full py-2 px-3 bg-red-50 text-red-600 font-semibold rounded-lg border border-red-200 hover:bg-red-100 transition-colors text-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                      <Link to={`/restaurant/${restaurant.id}`} className="block">
                        <button className="btn-success w-full py-2 px-3 text-sm font-semibold">
                          📊 View Comments
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-16 bg-white rounded-lg shadow-md border border-slate-200">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-2xl font-bold text-slate-900 mb-2">
              {role === 'owner' ? 'No restaurants yet' : 'No restaurants available'}
            </p>
            <p className="text-slate-600 mb-6">
              {role === 'owner' 
                ? 'Create your first restaurant to get started' 
                : 'Check back soon for new listings'}
            </p>
            {role === 'owner' && (
              <Link to="/add-restaurant">
                <button className="btn-success px-8 py-3 font-semibold">
                  + Create Your First Restaurant
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
