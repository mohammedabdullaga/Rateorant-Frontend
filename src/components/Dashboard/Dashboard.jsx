import { useEffect, useState, useContext } from 'react';
import { Link, useSearchParams } from 'react-router';

import { UserContext } from '../../contexts/UserContext';

import * as restaurantService from '../../services/restaurantService';
import * as favoritesService from '../../services/favoritesService';
import * as reviewService from '../../services/reviewService';
import './Dashboard.css';

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

  if (loading) return <main className="dashboard-loading"><div className="dashboard-spinner"></div></main>;

  return (
    <main className="dashboard-main">
      <div className="dashboard-container">
        {/* Welcome Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            Welcome back, {user?.username}!
          </h1>
          <p className="dashboard-subtitle">
            {role === 'owner' 
              ? 'Manage and monitor your restaurant listings' 
              : 'Discover and rate the best restaurants in your area'}
          </p>
        </div>

        {/* Add Restaurant Button for Owners */}
        {role === 'owner' && (
          <div className="dashboard-add-button-container">
            <Link to="/add-restaurant" className="dashboard-add-button">
              <button className="btn-success" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem', fontWeight: '600', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                + Add New Restaurant
              </button>
            </Link>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="dashboard-error">
            <p className="dashboard-error-title">Error</p>
            <p className="dashboard-error-message">{error}</p>
          </div>
        )}

        {/* Restaurants Grid */}
        {Array.isArray(restaurants) && restaurants.length > 0 ? (
          <div className="dashboard-grid">
            {restaurants.map(restaurant => (
              <div 
                key={restaurant.id} 
                className="dashboard-card"
              >
                {/* Restaurant Image */}
                {restaurant.image_url && (
                  <div className="dashboard-card-image">
                    <img 
                      src={restaurant.image_url} 
                      alt={restaurant.name}
                    />
                  </div>
                )}

                {/* Restaurant Content */}
                <div className="dashboard-card-content">
                  {/* Title and Rating */}
                  <div className="dashboard-card-header">
                    <h3 className="dashboard-card-title">
                      {restaurant.name}
                    </h3>
                    <div className="dashboard-card-rating">
                      <div className="dashboard-card-stars">
                        {getRatingStars(calculateAverageRating(restaurant.id))}
                      </div>
                      <p className="dashboard-card-review-count">
                        {restaurantRatings[restaurant.id]?.count || 0} reviews
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="dashboard-card-location">
                    <span className="dashboard-card-location-icon">📍</span>
                    <p className="dashboard-card-location-text">{restaurant.location}</p>
                  </div>

                  {/* Description */}
                  <p className="dashboard-card-description">
                    {restaurant.description}
                  </p>

                  {/* Action Buttons */}
                  {role === 'user' && (
                    <div className="dashboard-card-actions">
                      <Link to={`/restaurant/${restaurant.id}`} className="block">
                        <button className="btn-primary w-full" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: '600' }}>
                          View Details
                        </button>
                      </Link>
                      {favorites.includes(restaurant.id) ? (
                        <button 
                          onClick={() => handleRemoveFromFavorites(restaurant.id)}
                          className="dashboard-card-action-button favorite active"
                        >
                          ❤️ Remove from Favorites
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAddToFavorites(restaurant.id)}
                          className="dashboard-card-action-button favorite"
                        >
                          🤍 Add to Favorites
                        </button>
                      )}
                    </div>
                  )}

                  {role === 'owner' && (
                    <div className="dashboard-card-actions">
                      <div className="dashboard-card-action-grid">
                        <Link to={`/edit-restaurant/${restaurant.id}`} className="block">
                          <button className="dashboard-card-action-button edit w-full">
                            ✏️ Edit
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDeleteRestaurant(restaurant.id)}
                          className="dashboard-card-action-button delete"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                      <Link to={`/restaurant/${restaurant.id}`} className="block">
                        <button className="btn-success dashboard-card-action-button-primary w-full">
                          View Comments
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">📭</div>
            <p className="dashboard-empty-title">
              {role === 'owner' ? 'No restaurants yet' : 'No restaurants available'}
            </p>
            <p className="dashboard-empty-message">
              {role === 'owner' 
                ? 'Create your first restaurant to get started' 
                : 'Check back soon for new listings'}
            </p>
            {role === 'owner' && (
              <Link to="/add-restaurant" className="dashboard-empty-button">
                <button className="btn-success" style={{ padding: '0.75rem 2rem', fontWeight: '600' }}>
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
