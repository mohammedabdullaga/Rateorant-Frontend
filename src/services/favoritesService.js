import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`

async function getAllFavorites(token) {
  try {
    const response = await axios.get(`${BASE_URL}/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return Array.isArray(response.data) ? response.data : response.data.favorites || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
}

async function checkIsFavorite(restaurantId, token) {
  try {
    const response = await axios.get(`${BASE_URL}/restaurants/${restaurantId}/favorite`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data;
  } catch (error) {
    console.error('Error checking favorite:', error);
    throw error;
  }
}

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
    console.error('Error adding to favorites:', error)
    throw error;
  }
}

async function removeFromFavorites(restaurantId, token) {
  try {
    const response = await axios.delete(`${BASE_URL}/restaurants/${restaurantId}/favorite`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data;
  } catch (error) {
    console.error('Error removing from favorites:', error)
    throw error;
  }
}

export {
  getAllFavorites,
  checkIsFavorite,
  addToFavorites,
  removeFromFavorites
}
