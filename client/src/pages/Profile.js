import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(
    user?.notificationPreferences || {
      email: true,
      push: false
    }
  );

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    toast.success('Notification preferences updated');
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <img src={user.picture} alt={user.name} className="profile-avatar" />
          <h1>{user.name}</h1>
          <p>{user.email}</p>
        </div>

        <div className="profile-info">
          <h2>Account Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <User size={20} />
              <div>
                <label>Name</label>
                <p>{user.name}</p>
              </div>
            </div>
            <div className="info-item">
              <Mail size={20} />
              <div>
                <label>Email</label>
                <p>{user.email}</p>
              </div>
            </div>
            <div className="info-item">
              <Shield size={20} />
              <div>
                <label>Role</label>
                <p className="role-badge">{user.role}</p>
              </div>
            </div>
            <div className="info-item">
              <Calendar size={20} />
              <div>
                <label>Member Since</label>
                <p>{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-settings">
          <h2>Notification Preferences</h2>
          <div className="settings-list">
            <div className="setting-item">
              <div>
                <h3>Email Notifications</h3>
                <p>Receive updates via email</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() => handleNotificationChange('email')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div>
                <h3>Push Notifications</h3>
                <p>Receive browser notifications</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={() => handleNotificationChange('push')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;