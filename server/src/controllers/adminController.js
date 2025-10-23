const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const activeItems = await Item.countDocuments({ status: 'active' });
    const resolvedItems = await Item.countDocuments({ status: 'resolved' });
    const pendingClaims = await Claim.countDocuments({ status: 'pending' });
    const lostItems = await Item.countDocuments({ type: 'lost' });
    const foundItems = await Item.countDocuments({ type: 'found' });
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalItems,
        activeItems,
        resolvedItems,
        pendingClaims,
        lostItems,
        foundItems
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling user status'
    });
  }
};

// @desc    Get all claims (admin view)
// @route   GET /api/admin/claims
exports.getAllClaims = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = status ? { status } : {};
    
    const claims = await Claim.find(query)
      .populate('itemId')
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

// @desc    Mark claim as disputed
// @route   PUT /api/admin/claims/:id/dispute
exports.disputeClaim = async (req, res) => {
  try {
    const { reviewNote } = req.body;
    
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }
    
    claim.status = 'disputed';
    claim.reviewNote = reviewNote;
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = Date.now();
    
    await claim.save();
    
    res.json({
      success: true,
      data: claim
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error disputing claim'
    });
  }
};

// @desc    Delete item (admin)
// @route   DELETE /api/admin/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    await item.deleteOne();
    
    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting item'
    });
  }
};