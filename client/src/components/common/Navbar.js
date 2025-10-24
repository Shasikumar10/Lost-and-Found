import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { Menu, X, Bell, User, LogOut, Settings, Shield } from 'lucide-react';
import './Navbar.css';

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

  const handleLoginClick = () => {
    console.log('Login clicked - navigating to /login');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          KLH Lost & Found
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/browse" className="navbar-link">Browse Items</Link>
          
          {user ? (
            <>
              <Link to="/report" className="navbar-link">Report Item</Link>
              <Link to="/my-items" className="navbar-link">My Items</Link>
              <Link to="/claims" className="navbar-link">Claims</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="navbar-link">Admin</Link>
              )}
              <Link to="/profile" className="navbar-link">Profile</Link>
              <button onClick={handleLogout} className="navbar-btn">
                Logout
              </button>
            </>
          ) : (
            <button onClick={handleLoginClick} className="navbar-btn">
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;