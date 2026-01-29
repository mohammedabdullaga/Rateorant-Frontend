import axios from 'axios'

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`

// Cache for user data to avoid repeated API calls
const userCache = {}

async function getUserById(userId) {
  try {
    // Check cache first
    if (userCache[userId]) {
      return userCache[userId]
    }

    const response = await axios.get(`${BASE_URL}/users/${userId}`)
    
    const user = response.data
    // Cache the user data
    userCache[userId] = user
    
    return user
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error)
    // Return a fallback object
    return { id: userId, username: `User ${userId}` }
  }
}

export {
  getUserById
}
