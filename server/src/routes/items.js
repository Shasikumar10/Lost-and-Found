const express = require('express');
const router = express.Router();
const {
  createItem,
  getItems,
  getItem,
  getMyItems,
  updateItem,
  deleteItem
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getItems);
router.get('/:id', getItem);

// Protected routes
router.post('/', protect, upload.array('images', 5), createItem);
router.get('/my/items', protect, getMyItems);
router.put('/:id', protect, upload.array('images', 5), updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;