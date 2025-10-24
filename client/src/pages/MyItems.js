import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Eye, Edit, Trash2 } from 'lucide-react';
import './MyItems.css';

const MyItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyItems = async () => {
    try {
      const response = await axios.get('/items/my/items');
      setItems(response.data.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load your items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await axios.delete(`/items/${id}`);
      toast.success('Item deleted successfully');
      fetchMyItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="my-items">
      <div className="my-items-header">
        <h1>My Items</h1>
        <button onClick={() => navigate('/report')} className="btn-primary">
          Report New Item
        </button>
      </div>

      <div className="filters">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All ({items.length})
        </button>
        <button 
          className={filter === 'lost' ? 'active' : ''} 
          onClick={() => setFilter('lost')}
        >
          Lost ({items.filter(i => i.type === 'lost').length})
        </button>
        <button 
          className={filter === 'found' ? 'active' : ''} 
          onClick={() => setFilter('found')}
        >
          Found ({items.filter(i => i.type === 'found').length})
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <p>No items found</p>
          <button onClick={() => navigate('/report')} className="btn-primary">
            Report Your First Item
          </button>
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map(item => (
            <div key={item._id} className="item-card">
              {item.images?.[0] && (
                <img src={item.images[0]} alt={item.title} className="item-image" />
              )}
              <div className="item-content">
                <span className={`badge ${item.type}`}>{item.type}</span>
                <h3>{item.title}</h3>
                <p className="item-description">{item.description}</p>
                <div className="item-meta">
                  <span><MapPin size={14} /> {item.location}</span>
                  <span><Calendar size={14} /> {new Date(item.date).toLocaleDateString()}</span>
                </div>
                <div className="item-actions">
                  <button onClick={() => navigate(`/items/${item._id}`)} className="btn-icon">
                    <Eye size={16} /> View
                  </button>
                  <button onClick={() => navigate(`/items/${item._id}/edit`)} className="btn-icon">
                    <Edit size={16} /> Edit
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="btn-icon danger">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyItems;