import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../api/api';
import { validateItemForm, validateFileSize, validateFileType } from '../utils/validators';
import { Upload, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Electronics',
  'Documents',
  'Accessories',
  'Clothing',
  'Books',
  'Keys',
  'Bags',
  'Other'
];

const ReportItem = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'lost',
    title: '',
    description: '',
    category: '',
    location: '',
    date: '',
    tags: ''
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const validFiles = [];
    const previews = [];

    files.forEach(file => {
      if (!validateFileType(file)) {
        toast.error(`${file.name} is not a valid image file`);
        return;
      }
      if (!validateFileSize(file, 5)) {
        toast.error(`${file.name} exceeds 5MB size limit`);
        return;
      }

      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === validFiles.length) {
          setImagePreviews(prev => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateItemForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Creating item...');

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      await itemsAPI.createItem(formDataToSend);
      
      toast.success('Item reported successfully!', { id: toastId });
      navigate('/my-items');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating item', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page">
      <div className="report-container">
        <div className="report-header">
          <h1>Report an Item</h1>
          <p>Fill in the details to report a lost or found item</p>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          {/* Type Selection */}
          <div className="form-group">
            <label className="form-label required">Type</label>
            <div className="type-selector">
              <button
                type="button"
                className={`type-btn ${formData.type === 'lost' ? 'active lost' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'lost' }))}
              >
                📦 Lost Item
              </button>
              <button
                type="button"
                className={`type-btn ${formData.type === 'found' ? 'active found' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'found' }))}
              >
                ✅ Found Item
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label required">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Black iPhone 13"
              className={`form-input ${errors.title ? 'error' : ''}`}
            />
            {errors.title && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.title}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label required">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed description..."
              rows="5"
              className={`form-textarea ${errors.description ? 'error' : ''}`}
            />
            {errors.description && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.description}
              </span>
            )}
          </div>

          {/* Category and Location */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`form-select ${errors.category ? 'error' : ''}`}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.category}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Library 2nd Floor"
                className={`form-input ${errors.location ? 'error' : ''}`}
              />
              {errors.location && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.location}
                </span>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label required">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className={`form-input ${errors.date ? 'error' : ''}`}
            />
            {errors.date && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.date}
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags (optional)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., blue, apple, case (comma separated)"
              className="form-input"
            />
            <small className="form-hint">Add tags to help others find your item</small>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">Images (optional, max 5)</label>
            <div className="image-upload-area">
              {imagePreviews.length < 5 && (
                <label className="upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <Upload size={40} />
                  <p>Click to upload images</p>
                  <small>PNG, JPG, WEBP (max 5MB each)</small>
                </label>
              )}

              {imagePreviews.length > 0 && (
                <div className="image-previews">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="image-preview">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Report Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportItem;