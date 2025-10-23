import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    notificationPreferences: {
      email: user?.notificationPreferences?.email ?? true,
      inApp: user?.notificationPreferences?.inApp ?? true
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [name]: checked
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateUser(formData);
      setEditing(false);
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Profile Settings</h1>
          <p>Manage your account information and preferences</p>
        </div>

        <div className="profile-content">
          {/* Profile Info Card */}
          <div className="profile-card">
            <div className="profile-avatar-section">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="profile-avatar-large" />
              ) : (
                <div className="profile-avatar-placeholder">
                  <User size={60} />
                </div>
              )}
              <div className="profile-info-text">
                <h2>{user?.name}</h2>
                <p>{user?.email}</p>
                {user?.role === 'admin' && (
                  <span className="admin-badge">
                    <Shield size={14} />
                    Administrator
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Personal Information</h3>
              {!editing ? (
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                  Edit
                </button>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editing}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="form-input disabled"
                />
                <small className="form-hint">Email cannot be changed</small>
              </div>

              {editing && (
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              )}
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="profile-card">
            <div className="card-header">
              <h3>
                <Bell size={20} />
                Notification Preferences
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="preferences-form">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="email"
                    checked={formData.notificationPreferences.email}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                  <span>Email Notifications</span>
                </label>
                <small>Receive notifications via email</small>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="inApp"
                    checked={formData.notificationPreferences.inApp}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                  <span>In-App Notifications</span>
                </label>
                <small>Receive real-time notifications in the app</small>
              </div>

              {editing && (
                <button type="submit" className="btn btn-primary">
                  Save Preferences
                </button>
              )}
            </form>
          </div>

          {/* Account Stats */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Account Statistics</h3>
            </div>
            <div className="stats-list">
              <div className="stat-item">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">
                  {new Date(user?.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Account Status</span>
                <span className={`stat-value ${user?.isActive ? 'active' : 'inactive'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Role</span>
                <span className="stat-value">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;