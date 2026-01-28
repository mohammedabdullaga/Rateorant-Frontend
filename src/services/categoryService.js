import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

// Get all categories (no auth required)
async function getAllCategories() {
  try {
    const response = await axios.get(`${BASE_URL}/categories`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export {
  getAllCategories
};
