import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

// Get all restaurants (no auth required)
async function getAllRestaurants() {
  try {
    const response = await axios.get(`${BASE_URL}/restaurants`);
    // Ensure we return an array
    return Array.isArray(response.data) ? response.data : response.data.restaurants || [];
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
}

// Get single restaurant with details and categories (no auth required)
async function getRestaurantById(restaurantId) {
  try {
    const response = await axios.get(`${BASE_URL}/restaurants/${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    throw error;
  }
}

// Create a new restaurant (auth required - owner only)
async function createRestaurant(formData, token) {
  try {
    console.log('Creating restaurant with data:', formData);
    const response = await axios.post(`${BASE_URL}/restaurants`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Restaurant created successfully:', response.data);
    console.log('Response keys:', Object.keys(response.data));
    return response.data;
  } catch (error) {
    console.error('Error creating restaurant:', error);
    console.error('Response data:', error.response?.data);
    throw error;
  }
}

// Update restaurant (auth required - owner only)
async function updateRestaurant(restaurantId, formData, token) {
  try {
    const response = await axios.put(`${BASE_URL}/restaurants/${restaurantId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating restaurant:', error);
    throw error;
  }
}

// Delete restaurant (auth required - owner only)
async function deleteRestaurant(restaurantId, token) {
  try {
    const response = await axios.delete(`${BASE_URL}/restaurants/${restaurantId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    throw error;
  }
}

export {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
};
