import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';

import { UserContext } from '../../contexts/UserContext';
import * as backendNotificationService from '../../services/backendNotificationService';
import './NavBar.css';

const NavBar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const notificationRef = useRef(null);

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

  useEffect(() => {
    updateNotifications();
  }, [user]);

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

  const handleBellClick = () => {
    if (!showNotifications) {
      updateNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification.id);
    setShowNotifications(false);

    navigate(`/restaurant/${notification.restaurant_id}`);
  };

  const handleMarkAsRead = async (notificationId) => {

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-emoji">🍽️</span>
          <span className="navbar-logo-text">Rateorant</span>
        </Link>

        {user ? (
          <>
            {/* Search Bar for Users */}
            {user.role === 'user' && (
              <form onSubmit={handleSearch} className="navbar-search-form">
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="navbar-search-input"
                />
                <button type="submit" className="navbar-search-button">🔍</button>
              </form>
            )}

            {/* User Info and Notifications */}
            <div className="navbar-content">
              <div className="navbar-user-info">
                <p className="navbar-welcome">Welcome</p>
                <p className="navbar-username">{user.username}</p>
              </div>

              {user.role === 'restaurant_owner' && (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={handleBellClick}
                    className="navbar-bell-button"
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    🔔
                    {unreadCount > 0 && (
                      <span className="navbar-badge">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div
                      ref={notificationRef}
                      className="navbar-notifications"
                    >
                      <div className="navbar-notifications-header">
                        <span className="navbar-notifications-header-title">New Messages</span>
                        {notifications.length > 0 && (
                          <button
                            onClick={handleClearAll}
                            className="navbar-notifications-header-clear"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="navbar-notifications-list">
                        {notifications.length > 0 ? (
                          notifications.map(notification => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`navbar-notification-item ${!notification.read ? 'unread' : ''}`}
                            >
                              <p className="navbar-notification-message">
                                {notification.message}
                              </p>
                              <p className="navbar-notification-time">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="navbar-notifications-empty">
                            <p className="navbar-notifications-empty-message">All caught up!</p>
                            <p className="navbar-notifications-empty-submessage">No new notifications</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="navbar-actions">
                <Link
                  to="/"
                  className="navbar-link"
                >
                  {user.role === 'restaurant_owner' ? 'My Restaurants' : 'Dashboard'}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="navbar-button navbar-button-signout"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Unauthenticated Navigation */}
            <div className="navbar-unauthenticated">
              <Link
                to="/sign-in"
                className="navbar-signin-link"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="navbar-signup-link"
              >
                Sign Up
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
