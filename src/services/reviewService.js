import axios from 'axios'

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`

async function getReviewsByRestaurant(restaurantId) {
  try {
    const response = await axios.get(`${BASE_URL}/restaurants/${restaurantId}/reviews`)

    const reviewsArray = Array.isArray(response.data) ? response.data : response.data.reviews || []

    return reviewsArray
  } catch (error) {
    console.error('Error fetching reviews:', error)
    throw error
  }
}

async function createReview(restaurantId, reviewData, token) {
  try {
    const response = await axios.post(
      `${BASE_URL}/restaurants/${restaurantId}/reviews`,
      reviewData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data
  } catch (error) {
    console.error('Error creating review:', error)
    throw error;
  }
}

async function deleteReview(restaurantId, reviewId, token) {
  try {
    const response = await axios.delete(
      `${BASE_URL}/restaurants/${restaurantId}/reviews/${reviewId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data
  } catch (error) {
    console.error('Error deleting review:', error)
    throw error;
  }
}

export {
  getReviewsByRestaurant,
  createReview,
  deleteReview
}
