import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { MapPin, Calendar, Tag, Edit, Trash2, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import './ItemDetail.css';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimDescription, setClaimDescription] = useState('');
  const [proofImages, setProofImages] = useState([]);

  useEffect(() => {
    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await axios.get(`/items/${id}`);
      setItem(response.data.data);
    } catch (error) {
      console.error('Error fetching item:', error);
      toast.error('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    
    if (!claimDescription.trim()) {
      toast.error('Please provide a description');
      return;
    }

    const formData = new FormData();
    formData.append('itemId', id);
    formData.append('description', claimDescription);
    
    proofImages.forEach((file) => {
      formData.append('proofImages', file);
    });

    try {
      await axios.post('/claims', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Claim submitted successfully!');
      setShowClaimModal(false);
      setClaimDescription('');
      setProofImages([]);
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast.error(error.response?.data?.message || 'Failed to submit claim');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await axios.delete(`/items/${id}`);
      toast.success('Item deleted successfully');
      navigate('/my-items');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!item) {
    return <div className="error">Item not found</div>;
  }

  const isOwner = user && user._id === item.reportedBy._id;
  const canClaim = user && !isOwner && item.status === 'active';

  return (
    <div className="item-detail">
      <div className="item-detail-container">
        <div className="item-header">
          <div className="item-header-top">
            <div>
              <h1 className="item-title">{item.title}</h1>
              <div className="item-meta">
                <span className="meta-item">
                  <MapPin /> {item.location}
                </span>
                <span className="meta-item">
                  <Calendar /> {formatDate(item.date)}
                </span>
                <span className="meta-item">
                  <Tag /> {item.category}
                </span>
              </div>
            </div>
            
            {isOwner && (
              <div className="action-buttons">
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate(`/items/${id}/edit`)}
                >
                  <Edit size={16} /> Edit
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="item-body">
          {item.images && item.images.length > 0 && (
            <div className="item-images">
              <div className="image-grid">
                {item.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${item.title} ${index + 1}`}
                    className="item-image"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="item-info">
            <div>
              <div className="info-section">
                <h3>Description</h3>
                <p>{item.description}</p>
              </div>

              <div className="info-section">
                <h3>Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Type:</span>
                    <span className="info-value">{item.type}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Category:</span>
                    <span className="info-value">{item.category}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status:</span>
                    <span className="info-value">{item.status}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Reported by:</span>
                    <span className="info-value">{item.reportedBy.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="item-sidebar">
              {canClaim && (
                <>
                  <button
                    className="claim-button"
                    onClick={() => setShowClaimModal(true)}
                  >
                    <Flag size={18} /> Claim This Item
                  </button>
                  <p style={{ fontSize: '0.875rem', color: '#718096' }}>
                    Found this item? Submit a claim with proof to get it back.
                  </p>
                </>
              )}

              {isOwner && (
                <div style={{ padding: '1rem', background: '#dbeafe', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#2563eb' }}>
                    You reported this item
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="modal-overlay" onClick={() => setShowClaimModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Claim This Item</h2>
            </div>
            <form onSubmit={handleClaim}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    rows="4"
                    value={claimDescription}
                    onChange={(e) => setClaimDescription(e.target.value)}
                    placeholder="Describe why this item belongs to you..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Proof Images (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setProofImages(Array.from(e.target.files))}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowClaimModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;