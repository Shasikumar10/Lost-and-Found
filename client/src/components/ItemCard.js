import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, User } from 'lucide-react';

const ItemCard = ({ item }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = () => {
    const badges = {
      active: 'badge-success',
      claimed: 'badge-warning',
      resolved: 'badge-info',
      expired: 'badge-danger'
    };
    return badges[item.status] || 'badge-default';
  };

  const getTypeBadge = () => {
    return item.type === 'lost' ? 'badge-lost' : 'badge-found';
  };

  return (
    <Link to={`/items/${item._id}`} className="item-card">
      <div className="item-image">
        {item.images && item.images.length > 0 ? (
          <img src={item.images[0].url || item.images[0]} alt={item.title} />
        ) : (
          <div className="no-image">
            <span>📷</span>
            <p>No Image</p>
          </div>
        )}
        <div className="item-badges">
          <span className={`badge ${getTypeBadge()}`}>
            {item.type.toUpperCase()}
          </span>
          <span className={`badge ${getStatusBadge()}`}>
            {item.status}
          </span>
        </div>
      </div>

      <div className="item-content">
        <h3 className="item-title">{item.title}</h3>
        <p className="item-description">
          {item.description.length > 100 
            ? `${item.description.substring(0, 100)}...` 
            : item.description
          }
        </p>

        <div className="item-meta">
          <span className="meta-item">
            <Calendar size={14} />
            {formatDate(item.date)}
          </span>
          <span className="meta-item">
            <MapPin size={14} />
            {item.location}
          </span>
        </div>

        <div className="item-footer">
          <div className="item-category">
            <span className="category-badge">{item.category}</span>
          </div>
          {item.userId && (
            <div className="item-user">
              <User size={14} />
              <span>{item.userId.name}</span>
            </div>
          )}
        </div>

        {item.claimCount > 0 && (
          <div className="claim-count">
            {item.claimCount} {item.claimCount === 1 ? 'claim' : 'claims'}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ItemCard;