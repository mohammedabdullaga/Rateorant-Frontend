import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import * as restaurantService from '../../services/restaurantService';
import * as categoryService from '../../services/categoryService';
import './RestaurantForm.css';

const RestaurantForm = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    image_url: ''
  });

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const allCategories = await categoryService.getAllCategories();
        setCategories(allCategories);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    loadCategories();

    // If editing, load restaurant data
    if (restaurantId) {
      loadRestaurantData();
    } else {
      setLoading(false);
    }
  }, [restaurantId]);

  const loadRestaurantData = async () => {
    try {
      const restaurant = await restaurantService.getRestaurantById(restaurantId);
      
      // Check if current user is the owner (convert to string to handle type mismatch)
      if (String(restaurant.owner_id) !== String(user.id)) {
        setError('You do not have permission to edit this restaurant');
        return;
      }

      setFormData({
        name: restaurant.name,
        description: restaurant.description || '',
        location: restaurant.location,
        image_url: restaurant.image_url || ''
      });

      setSelectedCategories(restaurant.categories.map(cat => cat.id));
    } catch (err) {
      console.error('Failed to load restaurant:', err);
      setError('Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location) {
      setError('Name and location are required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        ...formData,
        category_ids: selectedCategories
      };

      const token = localStorage.getItem('token');
      console.log('Restaurant form submission:', payload);

      if (restaurantId) {
        const result = await restaurantService.updateRestaurant(restaurantId, payload, token);
        console.log('Update result:', result);
      } else {
        const result = await restaurantService.createRestaurant(payload, token);
        console.log('Create result:', result);
      }

      // Force a refresh by adding a timestamp query parameter
      // This ensures Dashboard will refetch the data
      navigate('/?refreshed=' + Date.now());
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save restaurant');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="restaurant-form-loading"><div className="restaurant-form-spinner"></div></main>;

  return (
    <main className="restaurant-form-main">
      <div className="restaurant-form-container">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="restaurant-form-back-button"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="restaurant-form-header">
          <h1 className="restaurant-form-title">
            {restaurantId ? 'Edit Restaurant' : 'Add New Restaurant'}
          </h1>
          <p className="restaurant-form-subtitle">
            Fill in the details below to {restaurantId ? 'update your' : 'create a new'} restaurant listing
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="restaurant-form-error">
            <p className="restaurant-form-error-title">Error</p>
            <p className="restaurant-form-error-message">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="restaurant-form-card">
          <form onSubmit={handleSubmit} className="restaurant-form">
            {/* Restaurant Name */}
            <div className="restaurant-form-group">
              <label htmlFor="name" className="restaurant-form-label">
                Restaurant Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., The Italian Corner"
                className="restaurant-form-input"
              />
            </div>

            {/* Description */}
            <div className="restaurant-form-group">
              <label htmlFor="description" className="restaurant-form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="5"
                placeholder="Describe your restaurant, ambiance, specialties, and what makes it unique..."
                className="restaurant-form-textarea"
              />
            </div>

            {/* Location */}
            <div className="restaurant-form-group">
              <label htmlFor="location" className="restaurant-form-label">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="e.g., 123 Main Street, Downtown"
                className="restaurant-form-input"
              />
            </div>

            {/* Image URL */}
            <div className="restaurant-form-group">
              <label htmlFor="image_url" className="restaurant-form-label">
                Image URL
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/restaurant-image.jpg"
                className="restaurant-form-input"
              />
            </div>

            {/* Categories */}
            <div className="restaurant-form-group">
              <label className="restaurant-form-label">
                Categories
              </label>
              <div className="restaurant-form-categories">
                {categories.length > 0 ? (
                  categories.map(category => (
                    <label key={category.id} className="restaurant-form-category-item">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                        className="restaurant-form-category-input"
                      />
                      <span className="restaurant-form-category-label">{category.category}</span>
                    </label>
                  ))
                ) : (
                  <p className="restaurant-form-no-categories">No categories available</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="restaurant-form-actions">
              <button
                type="submit"
                disabled={submitting}
                className="restaurant-form-submit-btn"
              >
                {submitting ? '⏳ Saving...' : restaurantId ? '✏️ Update Restaurant' : '➕ Add Restaurant'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="restaurant-form-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default RestaurantForm;
