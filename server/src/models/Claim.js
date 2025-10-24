const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  claimantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  proofImages: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'disputed'],
    default: 'pending'
  },
  reviewNote: {
    type: String,
    trim: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

claimSchema.index({ itemId: 1 });
claimSchema.index({ claimantId: 1 });
claimSchema.index({ status: 1 });
claimSchema.index({ createdAt: -1 });
claimSchema.index({ itemId: 1, claimantId: 1 }, { unique: true });

module.exports = mongoose.model('Claim', claimSchema);