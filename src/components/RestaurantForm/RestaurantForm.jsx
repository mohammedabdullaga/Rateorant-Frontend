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
    image_url: '',
    latitude: null,
    longitude: null
  });

  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [mapPreview, setMapPreview] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);

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
        image_url: restaurant.image_url || '',
        latitude: restaurant.latitude || null,
        longitude: restaurant.longitude || null
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

  const parseGoogleMapsLink = async (link) => {
    try {
      setMapLoading(true);
      
      // Extract coordinates from Google Maps link
      const coordMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (!coordMatch) {
        setError('Could not extract coordinates from Google Maps link. Make sure the link contains location coordinates.');
        setMapLoading(false);
        return;
      }

      const latitude = parseFloat(coordMatch[1]);
      const longitude = parseFloat(coordMatch[2]);

      // Extract place name from URL (after /place/)
      const placeMatch = link.match(/\/place\/([^/]+)/);
      const placeName = placeMatch ? decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ') : '';

      // Generate map preview using Google Maps embed URL
      const googleMapsEmbedUrl = `https://www.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=17&output=embed`;

      setMapPreview({
        url: googleMapsEmbedUrl,
        latitude,
        longitude,
        placeName
      });

      // Update form data with coordinates and location
      setFormData(prev => ({
        ...prev,
        location: placeName || prev.location,
        latitude,
        longitude
      }));

      setError('');
    } catch (err) {
      console.error('Error parsing Google Maps link:', err);
      setError('Error parsing Google Maps link. Please try again.');
    } finally {
      setMapLoading(false);
    }
  };

  const handleGoogleMapsLinkChange = (e) => {
    const link = e.target.value;
    setGoogleMapsLink(link);

    if (link.includes('google.com/maps')) {
      parseGoogleMapsLink(link);
    }
  };

  // Generate map preview by geocoding location name (fallback when no Google link provided)
  const generateMapPreviewFromLocation = async () => {
    if (!formData.location) {
      setError('Please enter a location first');
      return;
    }

    try {
      setMapLoading(true);
      
      // Use Nominatim (Open Street Map geocoding) - free, no API key needed
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.location)}&format=json&limit=1`
      );
      const results = await response.json();

      if (!results || results.length === 0) {
        setError('Could not find location. Please provide a more specific address.');
        setMapLoading(false);
        return;
      }

      const { lat, lon, display_name } = results[0];
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      // Generate embedded Google Maps URL
      const googleMapsEmbedUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`;

      setMapPreview({
        url: googleMapsEmbedUrl,
        latitude,
        longitude,
        placeName: display_name
      });

      // Update form data with coordinates
      setFormData(prev => ({
        ...prev,
        latitude,
        longitude
      }));

      setError('');
    } catch (err) {
      console.error('Error generating map preview:', err);
      setError('Error generating map preview. Please try again.');
    } finally {
      setMapLoading(false);
    }
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
              <div className="restaurant-form-location-input-wrapper">
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
                <button
                  type="button"
                  onClick={generateMapPreviewFromLocation}
                  disabled={mapLoading || !formData.location}
                  className="restaurant-form-map-button"
                  title="Generate map preview from location"
                >
                  {mapLoading ? '⏳' : '📍'}
                </button>
              </div>
            </div>

            {/* Google Maps Link */}
            <div className="restaurant-form-group">
              <label htmlFor="google_maps_link" className="restaurant-form-label">
                Google Maps Link (Optional)
              </label>
              <input
                type="url"
                id="google_maps_link"
                value={googleMapsLink}
                onChange={handleGoogleMapsLinkChange}
                placeholder="https://www.google.com/maps/place/..."
                className="restaurant-form-input"
              />
              <p className="restaurant-form-help-text">
                Paste your Google Maps link to auto-fill location and show a map preview
              </p>
            </div>

            {/* Map Preview */}
            {mapPreview && (
              <div className="restaurant-form-map-preview">
                <div className="restaurant-form-map-preview-header">
                  <h3 className="restaurant-form-map-preview-title">📍 Location Preview</h3>
                  <p className="restaurant-form-map-coordinates">
                    {mapPreview.latitude.toFixed(6)}, {mapPreview.longitude.toFixed(6)}
                  </p>
                </div>
                <iframe
                  src={mapPreview.url}
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: '0.5rem' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Restaurant Location Map"
                  className="restaurant-form-map-iframe"
                />
              </div>
            )}

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
