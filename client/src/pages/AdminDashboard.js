import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { adminAPI } from '../api/api';
import { 
  BarChart3, 
  Users, 
  Package, 
  Flag, 
  CheckCircle, 
  XCircle,
  Shield,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './AdminDashboard.css';

// Admin Dashboard Overview
const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await adminAPI.getStats();
      setStats(data.data);
    } catch (error) {
      toast.error('Error fetching stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-overview">
      <h2>Dashboard Overview</h2>
      
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon users">
            <Users size={30} />
          </div>
          <div className="stat-content">
            <h3>{stats?.totalUsers || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon items">
            <Package size={30} />
          </div>
          <div className="stat-content">
            <h3>{stats?.totalItems || 0}</h3>
            <p>Total Items</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon active">
            <CheckCircle size={30} />
          </div>
          <div className="stat-content">
            <h3>{stats?.activeItems || 0}</h3>
            <p>Active Items</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon pending">
            <Flag size={30} />
          </div>
          <div className="stat-content">
            <h3>{stats?.pendingClaims || 0}</h3>
            <p>Pending Claims</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon lost">
            <Package size={30} />
          </div>
          <div className="stat-content">
            <h3>{stats?.lostItems || 0}</h3>
            <p>Lost Items</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon found">
            <Package size={30} />
          </div>
          <div className="stat-content">
            <h3>{stats?.foundItems || 0}</h3>
            <p>Found Items</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon resolved">
            <CheckCircle size={30} />
          </div>
          <div className="stat-content">
            <h3>{stats?.resolvedItems || 0}</h3>
            <p>Resolved Items</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Users Management
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await adminAPI.getUsers();
      setUsers(data.data);
    } catch (error) {
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error('Error updating user status');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return;

    try {
      await adminAPI.updateUserRole(userId, newRole);
      toast.success('User role updated');
      fetchUsers();
    } catch (error) {
      toast.error('Error updating user role');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <h2>User Management</h2>
      <p className="section-subtitle">Total Users: {users.length}</p>

      <div className="users-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-cell">
                    {user.picture && (
                      <img src={user.picture} alt={user.name} className="table-avatar" />
                    )}
                    <span>{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => handleToggleStatus(user._id)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Admin Claims Management
const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (activeTab === 'claims') {
      fetchClaims();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getAllClaims(filter !== 'all' ? filter : undefined);
      setClaims(data.data);
    } catch (error) {
      toast.error('Error fetching claims');
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = async (claimId) => {
    const reviewNote = prompt('Enter reason for dispute:');
    if (!reviewNote) return;

    try {
      await adminAPI.disputeClaim(claimId, reviewNote);
      toast.success('Claim marked as disputed');
      fetchClaims();
    } catch (error) {
      toast.error('Error disputing claim');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading claims...</p>
      </div>
    );
  }

  return (
    <div className="admin-claims">
      <h2>Claims Management</h2>

      <div className="filter-tabs">
        <button
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`tab ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button
          className={`tab ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
        <button
          className={`tab ${filter === 'disputed' ? 'active' : ''}`}
          onClick={() => setFilter('disputed')}
        >
          Disputed
        </button>
      </div>

      {claims.length === 0 ? (
        <div className="no-data">
          <p>No claims found</p>
        </div>
      ) : (
        <div className="claims-grid">
          {claims.map(claim => (
            <div key={claim._id} className="admin-claim-card">
              <div className="claim-header">
                <div className="item-info">
                  {claim.itemId?.images?.[0] && (
                    <img src={claim.itemId.images[0].url} alt={claim.itemId.title} />
                  )}
                  <div>
                    <h4>{claim.itemId?.title}</h4>
                    <span className={`badge badge-${claim.itemId?.type}`}>
                      {claim.itemId?.type}
                    </span>
                  </div>
                </div>
                <span className={`status-badge ${claim.status}`}>
                  {claim.status}
                </span>
              </div>

              <div className="claim-details">
                <div className="detail-row">
                  <strong>Claimant:</strong>
                  <span>{claim.claimantId?.name}</span>
                </div>
                <div className="detail-row">
                  <strong>Email:</strong>
                  <span>{claim.claimantId?.email}</span>
                </div>
                <div className="detail-row">
                  <strong>Date:</strong>
                  <span>{new Date(claim.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <strong>Description:</strong>
                  <p className="claim-description">{claim.description}</p>
                </div>

                {claim.proofImages && claim.proofImages.length > 0 && (
                  <div className="proof-images">
                    {claim.proofImages.map((img, idx) => (
                      <img key={idx} src={img.url} alt={`Proof ${idx + 1}`} />
                    ))}
                  </div>
                )}

                {claim.reviewNote && (
                  <div className="review-note">
                    <strong>Review Note:</strong>
                    <p>{claim.reviewNote}</p>
                  </div>
                )}
              </div>

              {claim.status !== 'disputed' && (
                <div className="claim-actions">
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleDispute(claim._id)}
                  >
                    <AlertTriangle size={16} />
                    Mark as Disputed
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const location = useLocation();

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Shield size={24} />
          <h2>Admin Panel</h2>
        </div>

        <nav className="admin-nav">
          <Link 
            to="/admin" 
            className={`admin-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            <BarChart3 size={20} />
            Dashboard
          </Link>
          <Link 
            to="/admin/users" 
            className={`admin-nav-link ${location.pathname === '/admin/users' ? 'active' : ''}`}
          >
            <Users size={20} />
            Users
          </Link>
          <Link 
            to="/admin/claims" 
            className={`admin-nav-link ${location.pathname === '/admin/claims' ? 'active' : ''}`}
          >
            <Flag size={20} />
            Claims
          </Link>
        </nav>
      </div>

      <div className="admin-content">
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="claims" element={<AdminClaims />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;