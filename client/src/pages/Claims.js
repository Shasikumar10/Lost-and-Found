import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, FileText } from 'lucide-react';
import './Claims.css';

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await axios.get('/claims/my');
      setClaims(response.data.data);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="claims-page">
      <div className="claims-header">
        <h1>My Claims</h1>
        <p>Track your item claims</p>
      </div>

      {claims.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <p>No claims yet</p>
          <small>Browse items and submit claims to get started</small>
        </div>
      ) : (
        <div className="claims-list">
          {claims.map(claim => (
            <div key={claim._id} className="claim-card">
              <div className="claim-header">
                <h3>{claim.itemId.title}</h3>
                <span className={`status-badge ${claim.status}`}>
                  {claim.status}
                </span>
              </div>
              <p className="claim-description">{claim.description}</p>
              <div className="claim-meta">
                <span><Calendar size={14} /> {new Date(claim.createdAt).toLocaleDateString()}</span>
              </div>
              {claim.proofImages?.length > 0 && (
                <div className="claim-images">
                  {claim.proofImages.map((img, idx) => (
                    <img key={idx} src={img} alt={`Proof ${idx + 1}`} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Claims;