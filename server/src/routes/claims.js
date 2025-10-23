const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middlewares/auth');
const {
  createClaim,
  getClaimsByItem,
  getMyClaims,
  updateClaimStatus,
  deleteClaim
} = require('../controllers/claimsController');

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// All routes are protected
router.use(protect);

router.post('/', upload.array('proofImages', 3), createClaim);
router.get('/item/:itemId', getClaimsByItem);
router.get('/my', getMyClaims);
router.put('/:id/status', updateClaimStatus);
router.delete('/:id', deleteClaim);

module.exports = router;