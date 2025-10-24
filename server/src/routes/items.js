const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getMyItems,
  getRecentItems,
  getStats
} = require('../controllers/itemsController');

// @route   GET /api/items/stats
// @desc    Get item statistics
// @access  Public
router.get('/stats', getStats);

// @route   GET /api/items/recent
// @desc    Get recent items
// @access  Public
router.get('/recent', getRecentItems);

// @route   GET /api/items/my/items
// @desc    Get user's items
// @access  Private
router.get('/my/items', protect, getMyItems);

// @route   GET /api/items
// @desc    Get all items with filters
// @access  Public
router.get('/', getItems);

// @route   POST /api/items
// @desc    Create new item
// @access  Private
router.post('/', protect, upload.array('images', 5), createItem);

// @route   GET /api/items/:id
// @desc    Get single item
// @access  Public
router.get('/:id', getItem);

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private
router.put('/:id', protect, upload.array('images', 5), updateItem);

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private
router.delete('/:id', protect, deleteItem);

module.exports = router;