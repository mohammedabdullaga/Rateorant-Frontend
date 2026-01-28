import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

// Get all reviews for a restaurant (no auth required)
async function getReviewsByRestaurant(restaurantId) {
  try {
    const response = await axios.get(`${BASE_URL}/restaurants/${restaurantId}/reviews`);
    console.log('Raw reviews response:', response.data);
    // Ensure we return an array
    const reviewsArray = Array.isArray(response.data) ? response.data : response.data.reviews || [];
    console.log('Processed reviews array:', reviewsArray);
    return reviewsArray;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}

// Create a review (auth required)
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
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

export {
  getReviewsByRestaurant,
  createReview
};
