const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { sendNotification } = require('../services/notificationService');

// @desc    Create claim
// @route   POST /api/claims
exports.createClaim = async (req, res) => {
  try {
    const { itemId, description } = req.body;
    
    const item = await Item.findById(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    if (item.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This item is not available for claiming'
      });
    }
    
    // Check if user already claimed this item
    const existingClaim = await Claim.findOne({
      itemId,
      claimantId: req.user._id,
      status: { $in: ['pending', 'approved'] }
    });
    
    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'You have already claimed this item'
      });
    }
    
    // Upload proof images
    const proofImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'claims');
        proofImages.push({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    }
    
    const claim = await Claim.create({
      itemId,
      claimantId: req.user._id,
      description,
      proofImages
    });
    
    // Update item claim count
    item.claimCount += 1;
    await item.save();
    
    // Send notification to item owner
    await sendNotification(
      req.app.get('io'),
      item.userId,
      'claim_submitted',
      'New Claim Submitted',
      `Someone has claimed your ${item.type} item: ${item.title}`,
      itemId,
      claim._id
    );
    
    res.status(201).json({
      success: true,
      data: claim
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating claim'
    });
  }
};

// @desc    Get claims for an item (owner only)
// @route   GET /api/claims/item/:itemId
exports.getClaimsByItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    // Only item owner or admin can view claims
    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view claims'
      });
    }
    
    const claims = await Claim.find({ itemId: req.params.itemId })
      .populate('claimantId', 'name email picture')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: claims
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching claims'
    });
  }
};

// @desc    Get user's claims
// @route   GET /api/claims/my
exports.getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimantId: req.user._id })
      .populate('itemId')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: claims
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your claims'
    });
  }
};

// @desc    Update claim status (item owner or admin)
// @route   PUT /api/claims/:id/status
exports.updateClaimStatus = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    
    const claim = await Claim.findById(req.params.id).populate('itemId');
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }
    
    const item = claim.itemId;
    
    // Check authorization
    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this claim'
      });
    }
    
    claim.status = status;
    claim.reviewNote = reviewNote;
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = Date.now();
    
    await claim.save();
    
    // If approved, update item status
    if (status === 'approved') {
      item.status = 'claimed';
      item.resolvedBy = claim.claimantId;
      item.resolvedAt = Date.now();
      await item.save();
      
      // Reject all other pending claims
      await Claim.updateMany(
        { itemId: item._id, _id: { $ne: claim._id }, status: 'pending' },
        { status: 'rejected', reviewNote: 'Item already claimed by another user' }
      );
    }
    
    // Send notification to claimant
    const notifType = status === 'approved' ? 'claim_approved' : 'claim_rejected';
    const notifTitle = status === 'approved' ? 'Claim Approved!' : 'Claim Rejected';
    const notifMessage = status === 'approved' 
      ? `Your claim for "${item.title}" has been approved!`
      : `Your claim for "${item.title}" has been rejected. ${reviewNote || ''}`;
    
    await sendNotification(
      req.app.get('io'),
      claim.claimantId,
      notifType,
      notifTitle,
      notifMessage,
      item._id,
      claim._id
    );
    
    res.json({
      success: true,
      data: claim
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating claim status'
    });
  }
};

// @desc    Delete claim
// @route   DELETE /api/claims/:id
exports.deleteClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }
    
    // Only claimant can delete their own claim
    if (claim.claimantId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this claim'
      });
    }
    
    // Delete proof images
    for (const image of claim.proofImages) {
      await deleteFromCloudinary(image.publicId);
    }
    
    await claim.deleteOne();
    
    res.json({
      success: true,
      message: 'Claim deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting claim'
    });
  }
};