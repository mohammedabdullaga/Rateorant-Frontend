import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import * as restaurantService from '../../services/restaurantService';
import * as categoryService from '../../services/categoryService';

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

  if (loading) return <main className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></main>;

  return (
    <main className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-lg transition-colors"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {restaurantId ? 'Edit Restaurant' : 'Add New Restaurant'}
          </h1>
          <p className="text-slate-600">
            Fill in the details below to {restaurantId ? 'update your' : 'create a new'} restaurant listing
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
            <p className="text-red-700 font-semibold">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="card bg-white rounded-lg shadow-lg border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6 p-8">
            {/* Restaurant Name */}
            <div className="input-group">
              <label htmlFor="name" className="input-label">
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
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Description */}
            <div className="input-group">
              <label htmlFor="description" className="input-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="5"
                placeholder="Describe your restaurant, ambiance, specialties, and what makes it unique..."
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 resize-vertical"
              />
            </div>

            {/* Location */}
            <div className="input-group">
              <label htmlFor="location" className="input-label">
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
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Image URL */}
            <div className="input-group">
              <label htmlFor="image_url" className="input-label">
                Image URL
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/restaurant-image.jpg"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Categories */}
            <div className="input-group">
              <label className="input-label">
                Categories
              </label>
              <div className="border border-slate-300 rounded-lg p-4 space-y-3">
                {categories.length > 0 ? (
                  categories.map(category => (
                    <label key={category.id} className="flex items-center cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-1 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer mr-3"
                      />
                      <span className="text-slate-700 font-medium">{category.category}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No categories available</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={submitting}
                className={`btn-success flex-1 py-3 px-6 font-semibold text-lg ${
                  submitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
              >
                {submitting ? '⏳ Saving...' : restaurantId ? '✏️ Update Restaurant' : '➕ Add Restaurant'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary flex-1 py-3 px-6 font-semibold text-lg"
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
