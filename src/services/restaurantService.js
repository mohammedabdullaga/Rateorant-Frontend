import axios from 'axios'

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`

async function getAllRestaurants() {
  try {
    const response = await axios.get(`${BASE_URL}/restaurants`)

    return Array.isArray(response.data) ? response.data : response.data.restaurants || []
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    throw error
  }
}

async function getRestaurantsByCategory(categoryIdentifier) {
  try {
    // Try several possible backend routes for category-based lookup.
    // 1) /categories/:id/restaurants
    // 2) /restaurants?category_id=:id
    // 3) /restaurants?category=:name
    const tryPaths = [
      `${BASE_URL}/categories/${categoryIdentifier}/restaurants`,
      `${BASE_URL}/restaurants?category_id=${encodeURIComponent(categoryIdentifier)}`,
      `${BASE_URL}/restaurants?category=${encodeURIComponent(categoryIdentifier)}`,
      // try common /api prefixed variants in case BASE_URL doesn't include /api
      `${BASE_URL}/api/categories/${categoryIdentifier}/restaurants`,
      `${BASE_URL}/api/restaurants?category_id=${encodeURIComponent(categoryIdentifier)}`,
      `${BASE_URL}/api/restaurants?category=${encodeURIComponent(categoryIdentifier)}`
    ];

    for (const url of tryPaths) {
      try {
        const resp = await axios.get(url);
        if (resp && resp.data) {
          // resp.data may be array or wrapped
          if (Array.isArray(resp.data)) {
            console.debug('getRestaurantsByCategory: matched url', url);
            return resp.data;
          }
          if (Array.isArray(resp.data.restaurants)) {
            console.debug('getRestaurantsByCategory: matched url (wrapped restaurants)', url);
            return resp.data.restaurants;
          }
          if (Array.isArray(resp.data.data)) {
            console.debug('getRestaurantsByCategory: matched url (wrapped data)', url);
            return resp.data.data;
          }
        }
      } catch (err) {
        // try next
      }
    }

    // If none succeeded, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching restaurants by category:', error);
    throw error;
  }
}

async function getRestaurantById(restaurantId) {
  try {
    const response = await axios.get(`${BASE_URL}/restaurants/${restaurantId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    throw error
  }
}

async function createRestaurant(formData, token) {
  try {
    const response = await axios.post(`${BASE_URL}/restaurants`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data
  } catch (error) {
    console.error('Error creating restaurant:', error)
    console.error('Response data:', error.response?.data)
    throw error
  }
}

async function updateRestaurant(restaurantId, formData, token) {
  try {
    const response = await axios.put(`${BASE_URL}/restaurants/${restaurantId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('Error updating restaurant:', error)
    throw error
  }
}

async function deleteRestaurant(restaurantId, token) {
  try {
    const response = await axios.delete(`${BASE_URL}/restaurants/${restaurantId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data
  } catch (error) {
    console.error('Error deleting restaurant:', error)
    throw error
  }
}

export {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantsByCategory,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
};
