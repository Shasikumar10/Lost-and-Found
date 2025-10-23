import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI, claimsAPI } from '../api/api';
import Modal from '../components/common/Modal';
import { Calendar, MapPin, User, Tag, Edit, Trash2, Flag } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimDescription, setClaimDescription] = useState('');
  const [claimImages, setClaimImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const { data } = await itemsAPI.getItem(id);
      setItem(data.data);
    } catch (error) {
      toast.error('Error fetching item details');
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();

    if (claimDescription.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Submitting claim...');

    try {
      const formData = new FormData();
      formData.append('itemId', item._id);
      formData.append('description', claimDescription);

      claimImages.forEach(image => {
        formData.append('proofImages', image);
      });

      await claimsAPI.createClaim(formData);
      
      toast.success('Claim submitted successfully!', { id: toastId });
      setShowClaimModal(false);
      setClaimDescription('');
      setClaimImages([]);
      fetchItem();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting claim', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    const toastId = toast.loading('Deleting item...');

    try {
      await itemsAPI.deleteItem(item._id);
      toast.success('Item deleted successfully', { id: toastId });
      navigate('/my-items');
    } catch (error) {
      toast.error('Error deleting item', { id: toastId });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (claimImages.length + files.length > 3) {
      toast.error('Maximum 3 proof images allowed');
      return;
    }
    setClaimImages(prev => [...prev, ...files]);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading item details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="error-container">
        <p>Item not found</p>
      </div>
    );
  }

  const isOwner = user && item.userId._id === user._id;
  const canClaim = isAuthenticated && !isOwner && item.status === 'active';

  return (
    <div className="item-detail-page">
      <div className="detail-container">
        {/* Image Gallery */}
        <div className="detail-images">
          {item.images && item.images.length > 0 ? (
            <>
              <div className="main-image">
                <img src={item.images[currentImageIndex].url} alt={item.title} />
              </div>
              {item.images.length > 1 && (
                <div className="image-thumbnails">
                  {item.images.map((img, index) => (
                    <button
                      key={index}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img src={img.url} alt={`${item.title} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-image-placeholder">
              <span>📷</span>
              <p>No images available</p>
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="detail-content">
          <div className="detail-header">
            <div className="detail-badges">
              <span className={`badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                {item.type.toUpperCase()}
              </span>
              <span className={`badge badge-${item.status}`}>
                {item.status}
              </span>
            </div>

            {isOwner && (
              <div className="owner-actions">
                <button className="icon-btn" onClick={() => navigate(`/edit-item/${item._id}`)}>
                  <Edit size={18} />
                </button>
                <button className="icon-btn danger" onClick={handleDelete}>
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>

          <h1 className="detail-title">{item.title}</h1>

          <div className="detail-meta">
            <div className="meta-item">
              <Calendar size={16} />
              <span>{format(new Date(item.date), 'MMMM dd, yyyy')}</span>
            </div>
            <div className="meta-item">
              <MapPin size={16} />
              <span>{item.location}</span>
            </div>
            <div className="meta-item">
              <Tag size={16} />
              <span>{item.category}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Description</h3>
            <p className="description-text">{item.description}</p>
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="detail-section">
              <h3>Tags</h3>
              <div className="tag-list">
                {item.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>Posted By</h3>
            <div className="user-info">
              {item.userId.picture && (
                <img src={item.userId.picture} alt={item.userId.name} className="user-avatar" />
              )}
              <div>
                <p className="user-name">{item.userId.name}</p>
                <p className="user-email">{item.userId.email}</p>
              </div>
            </div>
          </div>

          {item.claimCount > 0 && (
            <div className="claim-count-info">
              <Flag size={16} />
              <span>{item.claimCount} {item.claimCount === 1 ? 'claim' : 'claims'} submitted</span>
            </div>
          )}

          {canClaim && (
            <button 
              className="btn btn-primary btn-large claim-btn"
              onClick={() => setShowClaimModal(true)}
            >
              Claim This Item
            </button>
          )}

          {isOwner && item.claimCount > 0 && (
            <button 
              className="btn btn-secondary btn-large"
              onClick={() => navigate(`/claims?item=${item._id}`)}
            >
              View Claims ({item.claimCount})
            </button>
          )}
        </div>
      </div>

      {/* Claim Modal */}
      <Modal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        title="Claim Item"
      >
        <form onSubmit={handleClaimSubmit} className="claim-form">
          <div className="form-group">
            <label className="form-label">
              Describe why this item belongs to you
            </label>
            <textarea
              value={claimDescription}
              onChange={(e) => setClaimDescription(e.target.value)}
              placeholder="Provide specific details to verify ownership..."
              rows="5"
              className="form-textarea"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Upload Proof (optional, max 3 images)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="form-input"
            />
            {claimImages.length > 0 && (
              <p className="form-hint">{claimImages.length} image(s) selected</p>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowClaimModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ItemDetail;