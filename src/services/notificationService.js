// Notification service for managing restaurant owner notifications

// Get all notifications from localStorage
function getNotifications() {
  try {
    const notifications = localStorage.getItem('notifications');
    const parsed = notifications ? JSON.parse(notifications) : [];
    return parsed;
  } catch (error) {
    console.error('Error retrieving notifications:', error);
    return [];
  }
}

// Add a notification
function addNotification(notification) {
  try {
    const notifications = getNotifications();
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    notifications.unshift(newNotification); // Add to beginning
    localStorage.setItem('notifications', JSON.stringify(notifications));
    console.log('✅ Notification saved to localStorage:', newNotification);
    console.log('📊 Total notifications now:', notifications.length);
    
    return newNotification;
  } catch (error) {
    console.error('Error adding notification:', error);
    return null;
  }
}

// Mark notification as read
function markAsRead(notificationId) {
  try {
    const notifications = getNotifications();
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return getNotifications();
  }
}

// Clear all notifications
function clearNotifications() {
  try {
    localStorage.setItem('notifications', JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}

// Get unread notification count
function getUnreadCount() {
  const notifications = getNotifications();
  const unread = notifications.filter(n => !n.read).length;
  return unread;
}

// Get last check time for a user
function getLastCheckTime(userId) {
  try {
    const lastCheck = localStorage.getItem(`lastCheck_${userId}`);
    return lastCheck ? new Date(lastCheck) : null;
  } catch (error) {
    console.error('Error getting last check time:', error);
    return null;
  }
}

// Set last check time for a user
function setLastCheckTime(userId) {
  try {
    localStorage.setItem(`lastCheck_${userId}`, new Date().toISOString());
  } catch (error) {
    console.error('Error setting last check time:', error);
  }
}

export {
  getNotifications,
  addNotification,
  markAsRead,
  clearNotifications,
  getUnreadCount,
  getLastCheckTime,
  setLastCheckTime
};
