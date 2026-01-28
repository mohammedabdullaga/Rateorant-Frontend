import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

// Get all favorite restaurants (auth required)
async function getAllFavorites(token) {
  try {
    const response = await axios.get(`${BASE_URL}/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    // Ensure we return an array
    return Array.isArray(response.data) ? response.data : response.data.favorites || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
}

// Check if restaurant is favorite (auth required)
async function checkIsFavorite(restaurantId, token) {
  try {
    const response = await axios.get(`${BASE_URL}/restaurants/${restaurantId}/favorite`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking favorite:', error);
    throw error;
  }
}

// Add restaurant to favorites (auth required)
async function addToFavorites(restaurantId, token) {
  try {
    const response = await axios.post(
      `${BASE_URL}/restaurants/${restaurantId}/favorite`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
}

// Remove restaurant from favorites (auth required)
async function removeFromFavorites(restaurantId, token) {
  try {
    const response = await axios.delete(`${BASE_URL}/restaurants/${restaurantId}/favorite`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
}

export {
  getAllFavorites,
  checkIsFavorite,
  addToFavorites,
  removeFromFavorites
};
