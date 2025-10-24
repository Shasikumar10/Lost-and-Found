const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  type: {
    type: String,
    required: true,
    enum: ['lost', 'found'],
    lowercase: true
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Electronics',
      'Documents',
      'Accessories',
      'Clothing',
      'Books',
      'Keys',
      'Other'
    ]
  },
  location: {
    type: String,
    required: [true, 'Please provide a location']
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date']
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['active', 'claimed', 'returned', 'closed'],
    default: 'active'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  claimApprovedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Add index for better search performance
itemSchema.index({ title: 'text', description: 'text' });
itemSchema.index({ type: 1, status: 1 });
itemSchema.index({ reportedBy: 1 });

module.exports = mongoose.model('Item', itemSchema);