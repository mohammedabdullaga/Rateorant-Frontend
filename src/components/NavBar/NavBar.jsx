import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';

import { UserContext } from '../../contexts/UserContext';
import * as backendNotificationService from '../../services/backendNotificationService';

const NavBar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);

  // Helper function to update notifications from backend
  const updateNotifications = async () => {
    if (user?.role === 'restaurant_owner') {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No token found in localStorage - user may need to log in again');
        return;
      }
      
      const allNotifications = await backendNotificationService.getNotifications(token);
      const unread = backendNotificationService.getUnreadCount(allNotifications);
      
      setUnreadCount(unread);
      setNotifications(allNotifications);
      
      console.log('Notifications updated:', {
        total: allNotifications.length,
        unread: unread
      });
    }
  };

  // Load notifications when component mounts or user changes
  useEffect(() => {
    updateNotifications();
  }, [user]);

  // Handle outside click to close notification dropdown
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showNotifications]);

  // Refresh notifications when bell is clicked
  const handleBellClick = () => {
    if (!showNotifications) {
      updateNotifications(); // Refresh before showing
    }
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification.id);
    setShowNotifications(false);
    // Navigate to the restaurant detail page with the notification
    navigate(`/restaurant/${notification.restaurant_id}`);
  };

  const handleMarkAsRead = async (notificationId) => {
    // Update UI optimistically
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    
    const unread = notifications.filter(n => !n.read && n.id !== notificationId).length;
    setUnreadCount(unread);
    
    console.log('Marked as read:', notificationId);
  };

  const handleClearAll = () => {
    setUnreadCount(0);
    setNotifications([]);
    console.log('✅ Cleared all notifications');
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
              <span className="text-2xl font-black text-white">🍽️</span>
              <span className="text-2xl font-black text-white hidden sm:inline">Rateorant</span>
            </div>
          </Link>

          {user ? (
            <>
              {/* User Info and Notifications */}
              <div className="flex items-center gap-3 md:gap-5 flex-1 md:flex-none justify-end">
                <div className="hidden md:block text-sm text-white text-right">
                  <p className="text-indigo-100 text-xs">Welcome</p>
                  <p className="font-semibold truncate max-w-[140px]">{user.username}</p>
                </div>

                {user.role === 'restaurant_owner' && (
                  <div className="relative">
                    <button
                      onClick={handleBellClick}
                      className="relative p-2 text-white hover:text-indigo-100 hover:bg-indigo-500 rounded-lg transition-all duration-200 active:scale-95"
                      title="Notifications"
                      aria-label="Notifications"
                    >
                      <span className="text-2xl">🔔</span>
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-indigo-600">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                      <div
                        ref={notificationRef}
                        className="absolute top-14 right-0 w-96 max-h-96 bg-white rounded-xl shadow-2xl border border-slate-300 z-50 overflow-hidden animate-slideDown"
                      >
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4 text-white flex justify-between items-center">
                          <span className="font-bold text-base">New Messages</span>
                          {notifications.length > 0 && (
                            <button
                              onClick={handleClearAll}
                              className="text-xs font-semibold bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded-md transition-all duration-200"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        <div className="overflow-y-auto max-h-80">
                          {notifications.length > 0 ? (
                            notifications.map(notification => (
                              <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`px-5 py-4 border-b border-slate-100 cursor-pointer transition-all duration-200 ${
                                  notification.read 
                                    ? 'bg-white hover:bg-slate-50' 
                                    : 'bg-indigo-50 hover:bg-indigo-100 border-l-4 border-l-indigo-600'
                                }`}
                              >
                                <p className="text-sm font-bold text-slate-900 line-clamp-2 mb-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {new Date(notification.created_at).toLocaleString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="px-5 py-12 text-center">
                              <p className="text-sm text-slate-600 font-semibold">All caught up! 🎉</p>
                              <p className="text-xs text-slate-400 mt-1">No new notifications</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 border-l border-indigo-400 pl-4">
                  <Link
                    to="/"
                    className="text-sm font-semibold text-white hover:text-indigo-100 px-3 py-2 rounded-lg hover:bg-indigo-500 transition-all duration-200"
                  >
                    {user.role === 'restaurant_owner' ? '🏪 My Restaurants' : '📊 Dashboard'}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-semibold text-white hover:text-indigo-100 px-3 py-2 rounded-lg hover:bg-red-600 transition-all duration-200"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Unauthenticated Navigation */}
              <div className="flex items-center gap-2 md:gap-3 ml-auto">
                <Link
                  to="/sign-in"
                  className="text-sm font-semibold text-white hover:text-indigo-100 px-3 md:px-4 py-2 rounded-lg hover:bg-indigo-500 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="text-sm font-semibold text-indigo-600 bg-white hover:bg-indigo-50 px-3 md:px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-bold"
                >
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
