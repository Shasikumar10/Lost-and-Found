import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemsAPI } from '../api/api';
import ItemCard from '../components/ItemCard';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const MyItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    try {
      setLoading(true);
      const { data } = await itemsAPI.getMyItems();
      setItems(data.data);
    } catch (error) {
      toast.error('Error fetching your items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'lost') return item.type === 'lost';
    if (filter === 'found') return item.type === 'found';
    return item.status === filter;
  });

  const stats = {
    total: items.length,
    active: items.filter(i => i.status === 'active').length,
    claimed: items.filter(i => i.status === 'claimed').length,
    resolved: items.filter(i => i.status === 'resolved').length
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your items...</p>
      </div>
    );
  }

  return (
    <div className="my-items-page">
      <div className="page-header">
        <div>
          <h1>My Items</h1>
          <p>Manage your reported lost and found items</p>
        </div>
        <Link to="/report" className="btn btn-primary">
          <Plus size={20} />
          Report New Item
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <p>Total Items</p>
        </div>
        <div className="stat-card">
          <h3>{stats.active}</h3>
          <p>Active</p>
        </div>
        <div className="stat-card">
          <h3>{stats.claimed}</h3>
          <p>Claimed</p>
        </div>
        <div className="stat-card">
          <h3>{stats.resolved}</h3>
          <p>Resolved</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`tab ${filter === 'lost' ? 'active' : ''}`}
          onClick={() => setFilter('lost')}
        >
          Lost
        </button>
        <button
          className={`tab ${filter === 'found' ? 'active' : ''}`}
          onClick={() => setFilter('found')}
        >
          Found
        </button>
        <button
          className={`tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`tab ${filter === 'claimed' ? 'active' : ''}`}
          onClick={() => setFilter('claimed')}
        >
          Claimed
        </button>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="no-items">
          <p>No items found</p>
          <Link to="/report" className="btn btn-primary">
            Report Your First Item
          </Link>
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map(item => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyItems;