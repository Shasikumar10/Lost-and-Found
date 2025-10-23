const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Item validation rules
const itemValidation = [
  body('type').isIn(['lost', 'found']).withMessage('Type must be either lost or found'),
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['Electronics', 'Documents', 'Accessories', 'Clothing', 'Books', 'Keys', 'Bags', 'Other']).withMessage('Invalid category'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('date').isISO8601().withMessage('Valid date is required')
];

// Claim validation rules
const claimValidation = [
  body('itemId').isMongoId().withMessage('Valid item ID is required'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters')
];

module.exports = {
  validate,
  itemValidation,
  claimValidation
};