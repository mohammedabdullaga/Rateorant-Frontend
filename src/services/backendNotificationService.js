import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/notifications`;

/**
 * Decode JWT token to check its contents
 */
const decodeToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format - expected 3 parts, got', parts.length);
      return null;
    }
    
    const encodedPayload = parts[1];
    const decodedPayload = atob(encodedPayload);
    const payload = JSON.parse(decodedPayload);
    
    console.log('Token decoded:', {
      hasRole: !!payload.role,
      role: payload.role,
      hasSub: !!payload.sub,
      username: payload.username,
      expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'no exp'
    });
    
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error.message);
    return null;
  }
};

/**
 * Fetch all notifications for the logged-in restaurant owner
 * Returns notifications for restaurants they own
 */
export const getNotifications = async (token) => {
  try {
    console.log('Fetching notifications from:', API_URL);
    console.log('Token exists:', !!token, 'Length:', token?.length);
    
    if (!token) {
      console.warn('No token provided to getNotifications');
      return [];
    }
    
    // Decode token to verify it's valid
    const decoded = decodeToken(token);
    if (!decoded) {
      console.error('Token appears to be malformed');
      return [];
    }
    
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Successfully fetched notifications:', response.data.length);
    return response.data || [];
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - Token issue');
      console.warn('Error details:', error.response?.data);
      console.warn('Make sure you are logged in with a restaurant_owner role');
      
      // Special case: if error message is "Invalid username or password" on /notifications endpoint
      // This suggests backend endpoint doesn't exist or is misconfigured
      if (error.response?.data?.detail === 'Invalid username or password') {
        console.error('Backend /api/notifications endpoint may not exist or is misconfigured');
        console.error('Please check with backend team that GET /api/notifications is implemented');
      }
      
      // Try to decode the token to help debug
      const token = localStorage.getItem('token');
      if (token) {
        decodeToken(token);
      }
    } else if (error.response?.status === 400) {
      console.error('400 Bad Request:', error.response?.data);
    } else if (error.request) {
      console.error('No response from server');
      console.error('Backend URL:', API_URL);
      console.error('Make sure backend is running at:', import.meta.env.VITE_BACK_END_SERVER_URL);
    } else {
      console.error('Request error:', error.message);
    }
    return [];
  }
};

/**
 * Get count of unread notifications
 */
export const getUnreadCount = (notifications) => {
  return notifications.filter(n => !n.read).length;
};
