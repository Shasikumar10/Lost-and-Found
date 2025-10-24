import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ReportItem.css';

const ReportItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'lost',
    category: '',
    location: '',
    date: '',
  });
  const [images, setImages] = useState([]);

  const categories = [
    'Electronics',
    'Documents',
    'Accessories',
    'Clothing',
    'Books',
    'Keys',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    // Only append images if they exist
    if (images.length > 0) {
      images.forEach(image => {
        data.append('images', image);
      });
    }

    try {
      console.log('Submitting item...');
      const response = await axios.post('/items', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Response:', response.data);
      toast.success('Item reported successfully!');
      navigate('/my-items');
    } catch (error) {
      console.error('Error reporting item:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to report item');
    }
  };

  return (
    <div className="report-item">
      <div className="report-container">
        <h1>Report Lost/Found Item</h1>
        <p className="subtitle">Help reunite items with their owners</p>

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label>Type *</label>
            <select name="type" value={formData.type} onChange={handleChange} required>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Black iPhone 13"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed description..."
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Library, Block A"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Images (Optional)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            <small>You can upload up to 5 images</small>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportItem;