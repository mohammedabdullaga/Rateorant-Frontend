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
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
};
