const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['claim', 'claim_update', 'item_update', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  link: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  relatedClaim: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim'
  }
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);