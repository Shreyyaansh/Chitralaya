const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules for creating/updating products
const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  body('category')
    .isIn(['canvas', 'sketches', 'color', 'all'])
    .withMessage('Category must be one of: canvas, sketches, color, all'),
];

// Public routes (no authentication required)
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin routes (authentication required)
router.post('/', authenticateToken, productValidation, productController.createProduct);
router.put('/:id', authenticateToken, productValidation, productController.updateProduct);
router.delete('/:id', authenticateToken, productController.deleteProduct);

module.exports = router;
