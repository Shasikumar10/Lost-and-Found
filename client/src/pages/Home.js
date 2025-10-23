import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI } from '../api/api';
import ItemCard from '../components/ItemCard';
import { Search, Plus, TrendingUp, Package } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    lostItems: 0,
    foundItems: 0,
    resolved: 0
  });

  useEffect(() => {
    fetchRecentItems();
  }, []);

  const fetchRecentItems = async () => {
    try {
      const { data } = await itemsAPI.getItems({ limit: 6 });
      setRecentItems(data.data);
      
      // Calculate stats
      const lost = data.data.filter(item => item.type === 'lost').length;
      const found = data.data.filter(item => item.type === 'found').length;
      const resolved = data.data.filter(item => item.status === 'resolved').length;
      
      setStats({ lostItems: lost, foundItems: found, resolved });
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Lost Something? <br />
            <span className="gradient-text">We'll Help You Find It</span>
          </h1>
          <p className="hero-subtitle">
            KLH University's trusted platform to report and recover lost items.
            Join our community in reuniting people with their belongings.
          </p>
          <div className="hero-actions">
            <Link to="/browse" className="btn btn-primary btn-large">
              <Search size={20} />
              Browse Items
            </Link>
            {isAuthenticated ? (
              <Link to="/report" className="btn btn-secondary btn-large">
                <Plus size={20} />
                Report Item
              </Link>
            ) : (
              <Link to="/login" className="btn btn-secondary btn-large">
                Get Started
              </Link>
            )}
          </div>
        </div>
        <div className="hero-illustration">
          <div className="floating-card card-1">
            <Package size={40} />
            <p>Lost Items</p>
          </div>
          <div className="floating-card card-2">
            <Search size={40} />
            <p>Found Items</p>
          </div>
          <div className="floating-card card-3">
            <TrendingUp size={40} />
            <p>Quick Recovery</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon lost">📦</div>
            <h3 className="stat-number">{stats.lostItems}</h3>
            <p className="stat-label">Lost Items</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon found">✅</div>
            <h3 className="stat-number">{stats.foundItems}</h3>
            <p className="stat-label">Found Items</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon resolved">🎉</div>
            <h3 className="stat-number">{stats.resolved}</h3>
            <p className="stat-label">Resolved Cases</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">1️⃣</div>
            <h3>Report an Item</h3>
            <p>Lost something or found an item? Create a detailed report with photos and description.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">2️⃣</div>
            <h3>Browse & Search</h3>
            <p>Search through reported items using filters and keywords to find what you're looking for.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">3️⃣</div>
            <h3>Claim & Verify</h3>
            <p>Found your item? Submit a claim with proof. Item owners verify and approve claims.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">4️⃣</div>
            <h3>Get Notified</h3>
            <p>Receive real-time notifications about claims, updates, and successful matches.</p>
          </div>
        </div>
      </section>

      {/* Recent Items Section */}
      <section className="recent-items-section">
        <div className="section-header">
          <h2 className="section-title">Recently Reported</h2>
          <Link to="/browse" className="view-all-link">
            View All →
          </Link>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading items...</p>
          </div>
        ) : recentItems.length > 0 ? (
          <div className="items-grid">
            {recentItems.map(item => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="no-items">
            <p>No items reported yet. Be the first to report!</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join KLH Lost & Found and help build a safer campus community</p>
            <Link to="/login" className="btn btn-primary btn-large">
              Login with KLH Account
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;