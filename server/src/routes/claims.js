const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createClaim,
  getMyClaims,
  getClaimsByItem,
  updateClaimStatus,
  getClaim
} = require('../controllers/claimsController');

// @route   POST /api/claims
// @desc    Create new claim
// @access  Private
router.post('/', protect, upload.array('proofImages', 5), createClaim);

// @route   GET /api/claims/my
// @desc    Get user's claims
// @access  Private
router.get('/my', protect, getMyClaims);

// @route   GET /api/claims/item/:itemId
// @desc    Get claims for specific item
// @access  Private
router.get('/item/:itemId', protect, getClaimsByItem);

// @route   GET /api/claims/:id
// @desc    Get single claim
// @access  Private
router.get('/:id', protect, getClaim);

// @route   PUT /api/claims/:id/status
// @desc    Update claim status
// @access  Private
router.put('/:id/status', protect, updateClaimStatus);

module.exports = router;