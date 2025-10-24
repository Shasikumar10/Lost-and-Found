const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getStats,
  getUsers,
  updateUserRole,
  toggleUserStatus,
  getAllClaims,
  disputeClaim
} = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(protect, adminOnly);

// @route   GET /api/admin/stats
// @desc    Get admin statistics
// @access  Admin
router.get('/stats', getStats);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', getUsers);

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Admin
router.put('/users/:id/role', updateUserRole);

// @route   PUT /api/admin/users/:id/status
// @desc    Toggle user active status
// @access  Admin
router.put('/users/:id/status', toggleUserStatus);

// @route   GET /api/admin/claims
// @desc    Get all claims
// @access  Admin
router.get('/claims', getAllClaims);

// @route   PUT /api/admin/claims/:id/dispute
// @desc    Mark claim as disputed
// @access  Admin
router.put('/claims/:id/dispute', disputeClaim);

module.exports = router;