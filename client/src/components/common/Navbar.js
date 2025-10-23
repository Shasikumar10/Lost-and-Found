import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { Menu, X, Bell, User, LogOut, Settings, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useSocket(localStorage.getItem('token'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🔍</span>
          KLH Lost & Found
        </Link>

        {/* Desktop Menu */}
        <div className="nav-menu">
          <Link to="/browse" className="nav-link">Browse Items</Link>
          {isAuthenticated && (
            <>
              <Link to="/report" className="nav-link">Report Item</Link>
              <Link to="/my-items" className="nav-link">My Items</Link>
              <Link to="/claims" className="nav-link">My Claims</Link>
              {isAdmin && (
                <Link to="/admin" className="nav-link admin-link">
                  <Shield size={16} />
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right Side */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <div className="notification-wrapper">
                <button 
                  className="icon-button"
                  onClick={() => setNotifOpen(!notifOpen)}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>

                {notifOpen && (
                  <div className="dropdown-menu notification-dropdown">
                    <div className="dropdown-header">
                      <h3>Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          className="mark-all-read"
                          onClick={markAllAsRead}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="notification-list">
                      {notifications.length === 0 ? (
                        <p className="no-notifications">No notifications</p>
                      ) : (
                        notifications.slice(0, 10).map(notif => (
                          <div 
                            key={notif._id}
                            className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                            onClick={() => {
                              markAsRead(notif._id);
                              if (notif.relatedItem) {
                                navigate(`/items/${notif.relatedItem}`);
                                setNotifOpen(false);
                              }
                            }}
                          >
                            <strong>{notif.title}</strong>
                            <p>{notif.message}</p>
                            <small>{new Date(notif.createdAt).toLocaleDateString()}</small>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Menu */}
              <div className="profile-wrapper">
                <button 
                  className="profile-button"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="profile-pic" />
                  ) : (
                    <User size={20} />
                  )}
                </button>

                {profileOpen && (
                  <div className="dropdown-menu profile-dropdown">
                    <div className="profile-info">
                      <p className="profile-name">{user.name}</p>
                      <p className="profile-email">{user.email}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings size={16} />
                      Profile Settings
                    </Link>
                    <button 
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/browse" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
            Browse Items
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/report" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                Report Item
              </Link>
              <Link to="/my-items" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                My Items
              </Link>
              <Link to="/claims" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                My Claims
              </Link>
              {isAdmin && (
                <Link to="/admin" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  Admin Dashboard
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;