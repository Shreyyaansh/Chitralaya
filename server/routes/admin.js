const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All admin routes require authentication
router.use(authenticateToken);

// Dashboard routes
router.get('/dashboard', adminController.getDashboardStats);

// Product management routes
router.get('/products', adminController.getAllProducts);
router.post('/products', upload.array('images', 10), adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Order management routes
router.get('/orders', adminController.getAllOrders);
router.get('/orders/:id', adminController.getOrderById);
router.put('/orders/:id', adminController.updateOrder);

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Address management routes
router.get('/addresses', adminController.getAllAddresses);
router.get('/addresses/:id', adminController.getAddressById);
router.put('/addresses/:id', adminController.updateAddress);
router.delete('/addresses/:id', adminController.deleteAddress);

module.exports = router;
