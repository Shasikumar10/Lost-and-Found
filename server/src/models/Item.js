const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: [true, 'Type is required']
  },
  category: {
    type: String,
    enum: [
      'electronics',
      'clothing',
      'accessories',
      'documents',
      'books',
      'keys',
      'bags',
      'sports',
      'jewelry',
      'other'
    ],
    required: [true, 'Category is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: ['active', 'claimed', 'resolved', 'expired'],
    default: 'active'
  },
  claimCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

itemSchema.index({ userId: 1 });
itemSchema.index({ type: 1, status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ createdAt: -1 });
itemSchema.index({ title: 'text', description: 'text', tags: 'text' });

itemSchema.virtual('claims', {
  ref: 'Claim',
  localField: '_id',
  foreignField: 'itemId'
});

module.exports = mongoose.model('Item', itemSchema);