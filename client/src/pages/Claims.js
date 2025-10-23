import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { claimsAPI } from '../api/api';
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Claims = () => {
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get('item');
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchClaims();
  }, [itemId]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const { data } = itemId 
        ? await claimsAPI.getClaimsByItem(itemId)
        : await claimsAPI.getMyClaims();
      setClaims(data.data);
    } catch (error) {
      toast.error('Error fetching claims');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (claimId, status, reviewNote = '') => {
    const toastId = toast.loading(`${status === 'approved' ? 'Approving' : 'Rejecting'} claim...`);

    try {
      await claimsAPI.updateClaimStatus(claimId, { status, reviewNote });
      toast.success(`Claim ${status} successfully`, { id: toastId });
      fetchClaims();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating claim', { id: toastId });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="status-icon success" size={20} />;
      case 'rejected':
        return <XCircle className="status-icon danger" size={20} />;
      case 'disputed':
        return <AlertTriangle className="status-icon warning" size={20} />;
      default:
        return <Clock className="status-icon pending" size={20} />;
    }
  };

  const filteredClaims = claims.filter(claim => {
    if (filter === 'all') return true;
    return claim.status === filter;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading claims...</p>
      </div>
    );
  }

  return (
    <div className="claims-page">
      <div className="claims-header">
        <h1>{itemId ? 'Item Claims' : 'My Claims'}</h1>
        <p>{itemId ? 'Review and manage claims for your item' : 'Track your submitted claims'}</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({claims.length})
        </button>
        <button
          className={`tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({claims.filter(c => c.status === 'pending').length})
        </button>
        <button
          className={`tab ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved ({claims.filter(c => c.status === 'approved').length})
        </button>
        <button
          className={`tab ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({claims.filter(c => c.status === 'rejected').length})
        </button>
      </div>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <div className="no-claims">
          <p>No claims found</p>
        </div>
      ) : (
        <div className="claims-list">
          {filteredClaims.map(claim => (
            <div key={claim._id} className="claim-card">
              <div className="claim-header">
                <div className="claim-item-info">
                  {claim.itemId?.images?.[0] && (
                    <img 
                      src={claim.itemId.images[0].url} 
                      alt={claim.itemId.title}
                      className="claim-item-image"
                    />
                  )}
                  <div>
                    <h3>{claim.itemId?.title}</h3>
                    <Link to={`/items/${claim.itemId?._id}`} className="view-item-link">
                      <Eye size={14} />
                      View Item
                    </Link>
                  </div>
                </div>
                <div className="claim-status">
                  {getStatusIcon(claim.status)}
                  <span className={`status-text ${claim.status}`}>
                    {claim.status}
                  </span>
                </div>
              </div>

              <div className="claim-body">
                {itemId && claim.claimantId && (
                  <div className="claimant-info">
                    <strong>Claimant:</strong>
                    <div className="user-mini">
                      {claim.claimantId.picture && (
                        <img src={claim.claimantId.picture} alt={claim.claimantId.name} />
                      )}
                      <div>
                        <p>{claim.claimantId.name}</p>
                        <small>{claim.claimantId.email}</small>
                      </div>
                    </div>
                  </div>
                )}

                <div className="claim-description">
                  <strong>Description:</strong>
                  <p>{claim.description}</p>
                </div>

                {claim.proofImages && claim.proofImages.length > 0 && (
                  <div className="claim-images">
                    <strong>Proof Images:</strong>
                    <div className="image-grid">
                      {claim.proofImages.map((img, index) => (
                        <img key={index} src={img.url} alt={`Proof ${index + 1}`} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="claim-meta">
                  <small>Submitted: {format(new Date(claim.createdAt), 'MMM dd, yyyy HH:mm')}</small>
                </div>

                {claim.reviewNote && (
                  <div className="review-note">
                    <strong>Review Note:</strong>
                    <p>{claim.reviewNote}</p>
                  </div>
                )}

                {itemId && claim.status === 'pending' && (
                  <div className="claim-actions">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => {
                        const note = prompt('Add a note (optional):');
                        handleUpdateStatus(claim._id, 'approved', note || '');
                      }}
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        const note = prompt('Add a reason for rejection:');
                        if (note) {
                          handleUpdateStatus(claim._id, 'rejected', note);
                        }
                      }}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Claims;