import React, { useState, useEffect } from 'react';
import { itemsAPI } from '../api/api';
import ItemCard from '../components/ItemCard';
import { Search, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'All',
  'Electronics',
  'Documents',
  'Accessories',
  'Clothing',
  'Books',
  'Keys',
  'Bags',
  'Other'
];

const BrowseItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'All',
    search: '',
    status: 'active'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchItems();
  }, [filters, pagination.currentPage]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 12,
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.category !== 'All' && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
        status: filters.status
      };

      const { data } = await itemsAPI.getItems(params);
      setItems(data.data);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total
      });
    } catch (error) {
      toast.error('Error fetching items');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      category: 'All',
      search: '',
      status: 'active'
    });
  };

  return (
    <div className="browse-page">
      <div className="browse-header">
        <h1>Browse Items</h1>
        <p>Search through reported lost and found items</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <form onSubmit={handleSearch} className="search-form">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search items..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </form>

        <button 
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          Filters
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-section">
            <label>Type</label>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filters.type === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('type', 'all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${filters.type === 'lost' ? 'active' : ''}`}
                onClick={() => handleFilterChange('type', 'lost')}
              >
                Lost
              </button>
              <button
                className={`filter-btn ${filters.type === 'found' ? 'active' : ''}`}
                onClick={() => handleFilterChange('type', 'found')}
              >
                Found
              </button>
            </div>
          </div>

          <div className="filter-section">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="active">Active</option>
              <option value="claimed">Claimed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <button className="clear-filters-btn" onClick={clearFilters}>
            <X size={16} />
            Clear Filters
          </button>
        </div>
      )}

      {/* Results */}
      <div className="browse-results">
        <div className="results-header">
          <p className="results-count">
            {pagination.total} {pagination.total === 1 ? 'item' : 'items'} found
          </p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading items...</p>
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="items-grid">
              {items.map(item => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={pagination.currentPage === 1}
                  onClick={() => setPagination(prev => ({ 
                    ...prev, 
                    currentPage: prev.currentPage - 1 
                  }))}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  className="pagination-btn"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => setPagination(prev => ({ 
                    ...prev, 
                    currentPage: prev.currentPage + 1 
                  }))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-results">
            <p>No items found matching your criteria</p>
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseItems;