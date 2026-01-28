
function getNotifications() {
  try {
    const notifications = localStorage.getItem('notifications')
    const parsed = notifications ? JSON.parse(notifications) : []
    return parsed
  } catch (error) {
    console.error('Error retrieving notifications:', error)
    return []
  }
}

function addNotification(notification) {
  try {
    const notifications = getNotifications()
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    }
    notifications.unshift(newNotification)
    localStorage.setItem('notifications', JSON.stringify(notifications))
    
    return newNotification
  } catch (error) {
    console.error('Error adding notification:', error)
    return null
  }
}

function markAsRead(notificationId) {
  try {
    const notifications = getNotifications()
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    )
    localStorage.setItem('notifications', JSON.stringify(updated))
    return updated
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return getNotifications()
  }
}

function clearNotifications() {
  try {
    localStorage.setItem('notifications', JSON.stringify([]))
  } catch (error) {
    console.error('Error clearing notifications:', error)
  }
}

function getUnreadCount() {
  const notifications = getNotifications();
  const unread = notifications.filter(n => !n.read).length
  return unread
}


function getLastCheckTime(userId) {
  try {
    const lastCheck = localStorage.getItem(`lastCheck_${userId}`)
    return lastCheck ? new Date(lastCheck) : null;
  } catch (error) {
    console.error('Error getting last check time:', error)
    return null;
  }
}

function setLastCheckTime(userId) {
  try {
    localStorage.setItem(`lastCheck_${userId}`, new Date().toISOString())
  } catch (error) {
    console.error('Error setting last check time:', error)
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
