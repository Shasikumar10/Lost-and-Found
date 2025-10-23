const Claim = require('../models/Claim');
const Item = require('../models/Item');
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;

// @desc    Create new claim
// @route   POST /api/claims
// @access  Private
exports.createClaim = async (req, res) => {
  try {
    const { itemId, description } = req.body;

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item is active
    if (item.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This item is no longer available for claims'
      });
    }

    // Check if user is the owner
    if (item.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot claim your own item'
      });
    }

    // Check if user already claimed this item
    const existingClaim = await Claim.findOne({
      itemId,
      claimantId: req.user._id
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a claim for this item'
      });
    }

    // Upload proof images
    const proofImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'klh-lost-found/claims',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto' }
            ]
          });

          proofImages.push({
            url: result.secure_url,
            publicId: result.public_id
          });

          await fs.unlink(file.path);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
        }
      }
    }

    // Create claim
    const claim = await Claim.create({
      itemId,
      claimantId: req.user._id,
      description,
      proofImages,
      status: 'pending'
    });

    // Update item claim count
    item.claimCount += 1;
    await item.save();

    const populatedClaim = await Claim.findById(claim._id)
      .populate('itemId')
      .populate('claimantId', 'name email picture');

    // TODO: Send notification to item owner
    // const io = req.app.get('io');
    // io.to(item.userId.toString()).emit('newClaim', { claim: populatedClaim });

    res.status(201).json({
      success: true,
      data: populatedClaim,
      message: 'Claim submitted successfully'
    });
  } catch (error) {
    console.error('Create claim error:', error);

    // Clean up uploaded files on error
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('File cleanup error:', unlinkError);
        }
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error creating claim'
    });
  }
};

// @desc    Get user's claims
// @route   GET /api/claims/my
// @access  Private
exports.getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimantId: req.user._id })
      .populate('itemId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: claims
    });
  } catch (error) {
    console.error('Get my claims error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your claims'
    });
  }
};

// @desc    Get claims for an item
// @route   GET /api/claims/item/:itemId
// @access  Private
exports.getClaimsByItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if user is the owner
    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view claims for this item'
      });
    }

    const claims = await Claim.find({ itemId: req.params.itemId })
      .populate('claimantId', 'name email picture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: claims
    });
  } catch (error) {
    console.error('Get claims by item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching claims'
    });
  }
};

// @desc    Update claim status
// @route   PUT /api/claims/:id/status
// @access  Private
exports.updateClaimStatus = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const claim = await Claim.findById(req.params.id).populate('itemId');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Check if user is the item owner or admin
    if (claim.itemId.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this claim'
      });
    }

    claim.status = status;
    claim.reviewNote = reviewNote || '';
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();

    await claim.save();

    // If approved, update item status
    if (status === 'approved') {
      await Item.findByIdAndUpdate(claim.itemId._id, {
        status: 'claimed'
      });
    }

    const updatedClaim = await Claim.findById(claim._id)
      .populate('itemId')
      .populate('claimantId', 'name email picture')
      .populate('reviewedBy', 'name email');

    // TODO: Send notification to claimant
    // const io = req.app.get('io');
    // io.to(claim.claimantId.toString()).emit('claimUpdate', { claim: updatedClaim });

    res.json({
      success: true,
      data: updatedClaim,
      message: `Claim ${status} successfully`
    });
  } catch (error) {
    console.error('Update claim status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating claim status'
    });
  }
};

// @desc    Get single claim
// @route   GET /api/claims/:id
// @access  Private
exports.getClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('itemId')
      .populate('claimantId', 'name email picture')
      .populate('reviewedBy', 'name email');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Check authorization
    const isClaimant = claim.claimantId._id.toString() === req.user._id.toString();
    const isItemOwner = claim.itemId.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isClaimant && !isItemOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this claim'
      });
    }

    res.json({
      success: true,
      data: claim
    });
  } catch (error) {
    console.error('Get claim error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching claim'
    });
  }
};