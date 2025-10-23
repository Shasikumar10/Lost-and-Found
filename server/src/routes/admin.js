const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth');
const {
  getStats,
  getUsers,
  updateUserRole,
  toggleUserStatus,
  getAllClaims,
  disputeClaim,
  deleteItem
} = require('../controllers/adminController');

// All routes are protected and admin only
router.use(protect);
router.use(adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/claims', getAllClaims);
router.put('/claims/:id/dispute', disputeClaim);
router.delete('/items/:id', deleteItem);

module.exports = router;