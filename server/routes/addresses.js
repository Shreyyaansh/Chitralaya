const express = require('express');
const addressController = require('../controllers/addressController');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation middleware for address creation/update
const addressValidationRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Address name must be between 2 and 50 characters'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .matches(/^(\+91)?[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number (with or without +91 prefix)'),
  body('address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('pincode')
    .matches(/^\d{6}$/)
    .withMessage('Please provide a valid 6-digit pincode'),
];

// User routes
router.route('/')
  .get(addressController.getUserAddresses)
  .post(addressValidationRules, handleValidationErrors, addressController.createAddress);

router.get('/default', addressController.getDefaultAddress);

router.route('/:id')
  .get(addressController.getAddressById)
  .put(addressValidationRules, handleValidationErrors, addressController.updateAddress)
  .delete(addressController.deleteAddress);

router.put('/:id/default', addressController.setDefaultAddress);

module.exports = router;
