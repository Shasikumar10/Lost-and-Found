const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middlewares/auth');
const {
  createItem,
  getItems,
  getItem,
  getMyItems,
  updateItem,
  deleteItem
} = require('../controllers/itemsController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.get('/', getItems);
router.get('/:id', getItem);

// Protected routes
router.post('/', protect, upload.array('images', 5), createItem);
router.get('/my/items', protect, getMyItems);
router.put('/:id', protect, upload.array('images', 5), updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;